import { desc, eq, inArray } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertUser,
  loaEvents,
  loaRecords,
  projects,
  templateFields,
  templateVersions,
  templates,
  users,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) _db = drizzle(process.env.DATABASE_URL);
  return _db;
}

async function requireDb() {
  const db = await getDb();
  if (!db) throw new Error("Database connection is unavailable.");
  return db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) return;
  const values: InsertUser = { openId: user.openId, lastSignedIn: new Date() };
  const updateSet: Record<string, unknown> = { lastSignedIn: new Date() };
  for (const field of ["name", "email", "loginMethod"] as const) {
    if (user[field] !== undefined) {
      values[field] = user[field] ?? null;
      updateSet[field] = user[field] ?? null;
    }
  }
  values.role = user.openId === ENV.ownerOpenId ? "admin" : user.role ?? "user";
  updateSet.role = values.role;
  await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result[0];
}

export async function getWorkspaceOverview(userId: number, isAdmin: boolean) {
  const db = await requireDb();
  const [projectRows, templateRows, fieldRows, versionRows, recordRows] = await Promise.all([
    db.select().from(projects).orderBy(projects.name),
    db.select().from(templates).orderBy(templates.name),
    db.select().from(templateFields).orderBy(templateFields.templateId, templateFields.position),
    db.select().from(templateVersions).orderBy(desc(templateVersions.createdAt)),
    db.select().from(loaRecords).where(isAdmin ? undefined : eq(loaRecords.createdById, userId)).orderBy(desc(loaRecords.updatedAt)).limit(60),
  ]);
  const recordIds = recordRows.map(record => record.id);
  const creatorIds = Array.from(new Set(recordRows.map(record => record.createdById)));
  const [memberRows, eventRows] = await Promise.all([
    isAdmin
      ? db.select({ id: users.id, name: users.name, email: users.email, role: users.role, lastSignedIn: users.lastSignedIn }).from(users).orderBy(users.name)
      : creatorIds.length
        ? db.select({ id: users.id, name: users.name, email: users.email, role: users.role, lastSignedIn: users.lastSignedIn }).from(users).where(inArray(users.id, creatorIds))
        : Promise.resolve([]),
    recordIds.length ? db.select().from(loaEvents).where(inArray(loaEvents.loaRecordId, recordIds)).orderBy(desc(loaEvents.createdAt)) : Promise.resolve([]),
  ]);
  return { projects: projectRows, templates: templateRows, templateFields: fieldRows, templateVersions: versionRows, records: recordRows, members: memberRows, events: eventRows };
}

export async function getWorkspaceMembers() {
  const db = await requireDb();
  return db.select({ id: users.id, name: users.name, email: users.email, role: users.role, lastSignedIn: users.lastSignedIn, createdAt: users.createdAt }).from(users).orderBy(users.name);
}

export async function updateUserRole(userId: number, role: "admin" | "user") {
  const db = await requireDb();
  await db.update(users).set({ role }).where(eq(users.id, userId));
}

export async function createProject(input: { id: string; name: string; code: string; description?: string; userId: number }) {
  const db = await requireDb();
  await db.insert(projects).values({ id: input.id, name: input.name, code: input.code, description: input.description || null, createdById: input.userId });
}

export async function createTemplate(input: { id: string; projectId: string; name: string; description?: string }) {
  const db = await requireDb();
  await db.insert(templates).values({ ...input, description: input.description || null });
}

export async function createTemplateField(input: { id: string; templateId: string; fieldKey: string; formFieldKey?: string | null; label: string; fieldScope: "shared" | "project"; isRequired: boolean; position: number }) {
  const db = await requireDb();
  await db.insert(templateFields).values(input);
}

export async function updateTemplateFieldMapping(id: string, formFieldKey: string | null) {
  const db = await requireDb();
  await db.update(templateFields).set({ formFieldKey }).where(eq(templateFields.id, id));
}

export async function createTemplateVersion(input: { id: string; templateId: string; version: string; sourceFilename: string; docxStorageKey: string; docxUrl: string; uploadedById: number }) {
  const db = await requireDb();
  await db.insert(templateVersions).values(input);
}

export async function approveTemplateVersion(versionId: string, userId: number) {
  const db = await requireDb();
  const versionRows = await db.select().from(templateVersions).where(eq(templateVersions.id, versionId)).limit(1);
  const version = versionRows[0];
  if (!version) throw new Error("Template version was not found.");
  await db.update(templateVersions).set({ status: "superseded" }).where(eq(templateVersions.templateId, version.templateId));
  await db.update(templateVersions).set({ status: "approved", approvedById: userId, approvedAt: new Date() }).where(eq(templateVersions.id, versionId));
}

export async function getTemplateVersion(versionId: string) {
  const db = await requireDb();
  const rows = await db.select().from(templateVersions).where(eq(templateVersions.id, versionId)).limit(1);
  return rows[0];
}

export async function getTemplateForVersion(versionId: string) {
  const db = await requireDb();
  const versionRows = await db.select().from(templateVersions).where(eq(templateVersions.id, versionId)).limit(1);
  const version = versionRows[0];
  if (!version) return undefined;
  const templateRows = await db.select().from(templates).where(eq(templates.id, version.templateId)).limit(1);
  return templateRows[0] ? { version, template: templateRows[0] } : undefined;
}

export async function getFieldsForTemplate(templateId: string) {
  const db = await requireDb();
  return db.select().from(templateFields).where(eq(templateFields.templateId, templateId)).orderBy(templateFields.position);
}

export async function createLoaRecord(input: { id: string; projectId: string; templateVersionId: string; createdById: number; title: string; referenceNumber: string; fieldData: Record<string, string> }) {
  const db = await requireDb();
  await db.insert(loaRecords).values({ ...input, status: "in_review" });
}

export async function getLoaRecord(id: string) {
  const db = await requireDb();
  const rows = await db.select().from(loaRecords).where(eq(loaRecords.id, id)).limit(1);
  return rows[0];
}

export async function updateLoaRecord(id: string, values: Partial<typeof loaRecords.$inferInsert>) {
  const db = await requireDb();
  await db.update(loaRecords).set(values).where(eq(loaRecords.id, id));
}

export async function addLoaEvent(recordId: string, actorUserId: number, action: string, detail?: string) {
  const db = await requireDb();
  await db.insert(loaEvents).values({ loaRecordId: recordId, actorUserId, action, detail: detail || null });
}
