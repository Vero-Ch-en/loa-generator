import { TRPCError } from "@trpc/server";
import { randomUUID } from "node:crypto";
import { z } from "zod";
import { COOKIE_NAME } from "../shared/const";
import { composeLoaFilename, convertDocxToPdf, loadApprovedTemplate, renderDocx } from "./documents";
import * as db from "./db";
import { isSharePointUploadConfigured, uploadPdfToSharePoint } from "./sharepoint";
import { canGenerateFromRecord, canMarkSigned, canMarkUploaded, canPrepareHandoff } from "./workflowRules";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { storagePut } from "./storage";
import { normalizeTemplateFieldKey } from "./templateFieldKey";
import { assertTemplateFieldKeyIsAvailable } from "./templateFieldValidation";
import { isConsultantTemplateAvailable } from "../shared/consultantFlow";
import { missingRequiredAuthorisedUserFields } from "../shared/authorisedUserLoaFields";
import { normalizeMappingTarget, resolveTemplateFieldData } from "../shared/templateMapping";

const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN", message: "Administrator access is required." });
  return next();
});

function assertRecordAccess(record: Awaited<ReturnType<typeof db.getLoaRecord>>, userId: number, isAdmin: boolean) {
  if (!record) throw new TRPCError({ code: "NOT_FOUND", message: "LOA record not found." });
  if (!isAdmin && record.createdById !== userId) {
    throw new TRPCError({ code: "FORBIDDEN", message: "You do not have access to this LOA." });
  }
  return record;
}

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      ctx.res.clearCookie(COOKIE_NAME, { ...getSessionCookieOptions(ctx.req), maxAge: -1 });
      return { success: true } as const;
    }),
  }),
  workspace: router({
    overview: protectedProcedure.query(async ({ ctx }) => ({
      ...(await db.getWorkspaceOverview(ctx.user.id, ctx.user.role === "admin")),
      sharePointConfigured: isSharePointUploadConfigured(),
    })),
    members: adminProcedure.query(() => db.getWorkspaceMembers()),
    setMemberRole: adminProcedure.input(z.object({ userId: z.number().int().positive(), role: z.enum(["admin", "user"]) })).mutation(async ({ input, ctx }) => {
      if (input.userId === ctx.user.id && input.role !== "admin") throw new TRPCError({ code: "BAD_REQUEST", message: "You cannot remove your own administrator access." });
      await db.updateUserRole(input.userId, input.role);
      return { success: true };
    }),
  }),
  projects: router({
    create: adminProcedure
      .input(z.object({ name: z.string().trim().min(2).max(160), code: z.string().trim().min(2).max(32), description: z.string().trim().max(1000).optional() }))
      .mutation(async ({ input, ctx }) => {
        await db.createProject({ id: randomUUID(), ...input, code: input.code.toUpperCase(), userId: ctx.user.id });
        return { success: true };
      }),
  }),
  templates: router({
    create: adminProcedure
      .input(z.object({ projectId: z.string().uuid(), name: z.string().trim().min(2).max(160), description: z.string().trim().max(1000).optional() }))
      .mutation(async ({ input }) => {
        await db.createTemplate({ id: randomUUID(), ...input });
        return { success: true };
      }),
    addField: adminProcedure
      .input(z.object({ templateId: z.string().uuid(), fieldKey: z.string().trim().min(1).max(160), formFieldKey: z.string().trim().max(80).optional(), label: z.string().trim().min(2).max(160), fieldScope: z.enum(["shared", "project"]), isRequired: z.boolean(), position: z.number().int().min(0).max(200) }))
      .mutation(async ({ input }) => {
        const fieldKey = normalizeTemplateFieldKey(input.fieldKey);
        const formFieldKey = normalizeMappingTarget(input.formFieldKey);
        if (input.formFieldKey && !formFieldKey) throw new TRPCError({ code: "BAD_REQUEST", message: "Map the document tag to one of the fixed LOA form fields." });
        if (!fieldKey) throw new TRPCError({ code: "BAD_REQUEST", message: "Enter a field name or a merge tag such as {{candidate_full_name}}." });
        const existingFields = await db.getFieldsForTemplate(input.templateId);
        assertTemplateFieldKeyIsAvailable(existingFields, fieldKey);
        await db.createTemplateField({ id: randomUUID(), ...input, fieldKey, formFieldKey: formFieldKey || null });
        return { success: true, fieldKey };
      }),
    mapField: adminProcedure
      .input(z.object({ fieldId: z.string().uuid(), formFieldKey: z.string().trim().max(80).nullable() }))
      .mutation(async ({ input }) => {
        const formFieldKey = normalizeMappingTarget(input.formFieldKey);
        if (input.formFieldKey && !formFieldKey) throw new TRPCError({ code: "BAD_REQUEST", message: "Map the document tag to one of the fixed LOA form fields." });
        await db.updateTemplateFieldMapping(input.fieldId, formFieldKey || null);
        return { success: true, formFieldKey: formFieldKey || null };
      }),
    uploadVersion: adminProcedure
      .input(z.object({ templateId: z.string().uuid(), version: z.string().trim().min(1).max(32), filename: z.string().trim().endsWith(".docx", "Upload a .docx template."), documentBase64: z.string().min(100) }))
      .mutation(async ({ input, ctx }) => {
        const contents = Buffer.from(input.documentBase64, "base64");
        if (contents.length > 12 * 1024 * 1024) throw new TRPCError({ code: "PAYLOAD_TOO_LARGE", message: "Template files must be 12 MB or smaller." });
        const stored = await storagePut(`loa/templates/${input.templateId}/${input.version}/${input.filename}`, contents, "application/vnd.openxmlformats-officedocument.wordprocessingml.document");
        await db.createTemplateVersion({
          id: randomUUID(),
          templateId: input.templateId,
          version: input.version,
          sourceFilename: input.filename,
          docxStorageKey: stored.key,
          docxUrl: stored.url,
          uploadedById: ctx.user.id,
        });
        return { success: true };
      }),
    approveVersion: adminProcedure.input(z.object({ versionId: z.string().uuid() })).mutation(async ({ input, ctx }) => {
      await db.approveTemplateVersion(input.versionId, ctx.user.id);
      return { success: true };
    }),
  }),
  loas: router({
    createDraft: protectedProcedure
      .input(z.object({ projectId: z.string().uuid(), templateVersionId: z.string().uuid(), title: z.string().trim().min(2).max(200), referenceNumber: z.string().trim().min(2).max(100), fieldData: z.record(z.string(), z.string().max(2000)) }))
      .mutation(async ({ input, ctx }) => {
        const approvedTemplate = await db.getTemplateForVersion(input.templateVersionId);
        if (!approvedTemplate || !isConsultantTemplateAvailable(approvedTemplate.version.status)) throw new TRPCError({ code: "BAD_REQUEST", message: "Select an approved template version." });
        if (approvedTemplate.template.projectId !== input.projectId) throw new TRPCError({ code: "BAD_REQUEST", message: "The selected template does not belong to the selected project." });
        const missingAuthorisedUserFields = missingRequiredAuthorisedUserFields(input.fieldData);
        if (missingAuthorisedUserFields.length) throw new TRPCError({ code: "BAD_REQUEST", message: `Complete the authorised-user fields: ${missingAuthorisedUserFields.join(", ")}.` });
        const templateFields = await db.getFieldsForTemplate(approvedTemplate.template.id);
        const missingTemplateFields = templateFields.filter(field => !field.formFieldKey && field.isRequired && !input.fieldData[field.fieldKey]?.trim()).map(field => field.label);
        if (missingTemplateFields.length) throw new TRPCError({ code: "BAD_REQUEST", message: `Complete the selected template fields: ${missingTemplateFields.join(", ")}.` });
        const id = randomUUID();
        await db.createLoaRecord({ id, ...input, createdById: ctx.user.id });
        await db.addLoaEvent(id, ctx.user.id, "review_started", "Draft created and awaiting review confirmation.");
        return { id };
      }),
    confirmReview: protectedProcedure.input(z.object({ id: z.string().uuid() })).mutation(async ({ input, ctx }) => {
      const record = assertRecordAccess(await db.getLoaRecord(input.id), ctx.user.id, ctx.user.role === "admin");
      if (record.status !== "in_review") throw new TRPCError({ code: "BAD_REQUEST", message: "This LOA is not awaiting review." });
      await db.updateLoaRecord(input.id, { reviewConfirmed: true, reviewedAt: new Date() });
      await db.addLoaEvent(input.id, ctx.user.id, "review_confirmed", "User confirmed the review before generation.");
      return { success: true };
    }),
    generate: protectedProcedure.input(z.object({ id: z.string().uuid() })).mutation(async ({ input, ctx }) => {
      const record = assertRecordAccess(await db.getLoaRecord(input.id), ctx.user.id, ctx.user.role === "admin");
      const version = await db.getTemplateVersion(record.templateVersionId);
      if (!version || !canGenerateFromRecord(version.status, record.reviewConfirmed)) throw new TRPCError({ code: "BAD_REQUEST", message: "Review must be confirmed and the template version must remain approved before generation." });
      const overview = await db.getWorkspaceOverview(ctx.user.id, true);
      const project = overview.projects.find(item => item.id === record.projectId);
      if (!project) throw new TRPCError({ code: "NOT_FOUND", message: "Project configuration was not found." });

      const baseFilename = composeLoaFilename(project.code, record.referenceNumber, record.title);
      try {
        await db.updateLoaRecord(input.id, { conversionStatus: "in_progress", errorMessage: null });
        const templateBuffer = await loadApprovedTemplate(version.docxStorageKey);
        const templateFields = await db.getFieldsForTemplate(version.templateId);
        const mappedFieldData = resolveTemplateFieldData(record.fieldData, templateFields);
        const docxBuffer = renderDocx(templateBuffer, mappedFieldData);
        const docxStored = await storagePut(`loa/generated/${project.code}/${baseFilename}.docx`, docxBuffer, "application/vnd.openxmlformats-officedocument.wordprocessingml.document");
        const pdfBuffer = await convertDocxToPdf(docxBuffer, baseFilename);
        const pdfStored = await storagePut(`loa/generated/${project.code}/${baseFilename}.pdf`, pdfBuffer, "application/pdf");
        await db.updateLoaRecord(input.id, {
          status: "generated",
          conversionStatus: "completed",
          generatedAt: new Date(),
          generatedDocxKey: docxStored.key,
          generatedDocxUrl: docxStored.url,
          generatedPdfKey: pdfStored.key,
          generatedPdfUrl: pdfStored.url,
          filename: baseFilename,
        });
        await db.addLoaEvent(input.id, ctx.user.id, "documents_generated", "Approved template rendered to DOCX and PDF.");
        return { success: true, pdfUrl: pdfStored.url, filename: `${baseFilename}.pdf` };
      } catch (error) {
        const message = error instanceof Error ? error.message : "Document generation failed.";
        await db.updateLoaRecord(input.id, { status: "failed", conversionStatus: "failed", errorMessage: message });
        await db.addLoaEvent(input.id, ctx.user.id, "generation_failed", message);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message });
      }
    }),
    prepareHandoff: protectedProcedure
      .input(z.object({ id: z.string().uuid(), intendedSharePointPath: z.string().trim().min(3).max(500) }))
      .mutation(async ({ input, ctx }) => {
        const record = assertRecordAccess(await db.getLoaRecord(input.id), ctx.user.id, ctx.user.role === "admin");
        if (!canPrepareHandoff(record.status)) throw new TRPCError({ code: "BAD_REQUEST", message: "Generate the signing-ready PDF before preparing handoff." });
        await db.updateLoaRecord(input.id, { status: "handoff_ready", handoffStatus: "prepared", intendedSharePointPath: input.intendedSharePointPath });
        await db.addLoaEvent(input.id, ctx.user.id, "handoff_prepared", `SharePoint destination: ${input.intendedSharePointPath}`);
        return { success: true };
      }),
    uploadToSharePoint: protectedProcedure.input(z.object({ id: z.string().uuid() })).mutation(async ({ input, ctx }) => {
      const record = assertRecordAccess(await db.getLoaRecord(input.id), ctx.user.id, ctx.user.role === "admin");
      if (!canMarkUploaded(record.status, record.handoffStatus) || !record.generatedPdfKey || !record.filename) throw new TRPCError({ code: "BAD_REQUEST", message: "Prepare this LOA for handoff before direct SharePoint upload." });
      try {
        const uploaded = await uploadPdfToSharePoint({ storageKey: record.generatedPdfKey, filename: `${record.filename}.pdf` });
        await db.updateLoaRecord(input.id, { status: "sent_to_sharepoint", handoffStatus: "uploaded" });
        await db.addLoaEvent(input.id, ctx.user.id, "sharepoint_uploaded", `Microsoft Graph item: ${uploaded.itemId}${uploaded.webUrl ? ` · ${uploaded.webUrl}` : ""}`);
        return { success: true };
      } catch (error) {
        const message = error instanceof Error ? error.message : "SharePoint upload failed.";
        await db.addLoaEvent(input.id, ctx.user.id, "sharepoint_upload_failed", message);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message });
      }
    }),
    markSharePointUploaded: protectedProcedure.input(z.object({ id: z.string().uuid() })).mutation(async ({ input, ctx }) => {
      const record = assertRecordAccess(await db.getLoaRecord(input.id), ctx.user.id, ctx.user.role === "admin");
      if (!canMarkUploaded(record.status, record.handoffStatus)) throw new TRPCError({ code: "BAD_REQUEST", message: "Prepare this LOA for SharePoint handoff before recording upload." });
      await db.updateLoaRecord(input.id, { status: "sent_to_sharepoint", handoffStatus: "uploaded" });
      await db.addLoaEvent(input.id, ctx.user.id, "sharepoint_upload_recorded", "SharePoint upload recorded manually.");
      return { success: true };
    }),
    markSigned: protectedProcedure.input(z.object({ id: z.string().uuid() })).mutation(async ({ input, ctx }) => {
      const record = assertRecordAccess(await db.getLoaRecord(input.id), ctx.user.id, ctx.user.role === "admin");
      if (!canMarkSigned(record.status, record.handoffStatus)) throw new TRPCError({ code: "BAD_REQUEST", message: "Record the SharePoint upload before marking this LOA signed." });
      await db.updateLoaRecord(input.id, { handoffStatus: "signed" });
      await db.addLoaEvent(input.id, ctx.user.id, "signing_recorded", "LOA marked signed.");
      return { success: true };
    }),
    markDownloaded: protectedProcedure.input(z.object({ id: z.string().uuid() })).mutation(async ({ input, ctx }) => {
      const record = assertRecordAccess(await db.getLoaRecord(input.id), ctx.user.id, ctx.user.role === "admin");
      if (!record.generatedPdfUrl) throw new TRPCError({ code: "BAD_REQUEST", message: "No generated PDF is available." });
      await db.updateLoaRecord(input.id, { handoffStatus: "downloaded" });
      await db.addLoaEvent(input.id, ctx.user.id, "handoff_downloaded", "Signing-ready PDF downloaded for SharePoint handoff.");
      return { success: true };
    }),
  }),
});

export type AppRouter = typeof appRouter;
