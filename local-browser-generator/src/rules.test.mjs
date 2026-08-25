import { describe, expect, it } from "vitest";
import { appendAuditEvent, composeFilename, deriveWorkflowState, extractTemplateFields, validateGenerationInput } from "./rules.mjs";

describe("local LOA workflow rules", () => {
  it("produces a predictable local output filename", () => { expect(composeFilename("Alpha Project", "LOA / 2026: 001", "Appointment of A. Smith")).toBe("Alpha-Project_LOA-2026-001_Appointment-of-A-Smith"); });
  it("extracts both one- and two-brace merge tags", () => { expect(extractTemplateFields("{appointee_name} and {{effective_date}}")).toEqual(["appointee_name", "effective_date"]); });
  it("routes draft and signature-ready documents to their reference-aligned local states", () => { expect(deriveWorkflowState({ generateLoa: true, sendForSignature: false })).toMatchObject({ folder: "Draft", loaGenerationStatus: "Monthly Draft Generated" }); expect(deriveWorkflowState({ generateLoa: true, sendForSignature: true })).toMatchObject({ folder: "For-Signing", signatureStatus: "Pending" }); });
  it("retains an awaiting-generation status when document generation is not selected", () => { expect(deriveWorkflowState({ generateLoa: false, sendForSignature: false })).toMatchObject({ loaGenerationStatus: "Awaiting generation", signatureStatus: "Not sent" }); });
  it("preserves existing audit history when adding a regeneration event", () => { const history = [{ action: "Monthly Draft Generated" }]; const next = appendAuditEvent(history, { action: "Regeneration required" }); expect(next).toEqual([{ action: "Monthly Draft Generated" }, { action: "Regeneration required" }]); expect(history).toEqual([{ action: "Monthly Draft Generated" }]); });
  it("requires candidate, consultant, and action details at the right point in the flow", () => { expect(validateGenerationInput({ template: "letter.docx", projectCode: "ABC", referenceNumber: "1", candidate: { fullName: "John Doe", email: "john@example.com", jobTitle: "Operator" }, consultant: { fullName: "", email: "" }, generateLoa: true, sendForSignature: true, customFields: {} }, [])).toContain("Enter the consultant's full name and email before preparing a signature packet."); });
});
