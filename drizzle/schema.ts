import {
  boolean,
  index,
  int,
  json,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  uniqueIndex,
  varchar,
} from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["admin", "user"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export const projects = mysqlTable("projects", {
  id: varchar("id", { length: 36 }).primaryKey(),
  name: varchar("name", { length: 160 }).notNull(),
  code: varchar("code", { length: 32 }).notNull().unique(),
  description: text("description"),
  isActive: boolean("isActive").default(true).notNull(),
  createdById: int("createdById").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const templates = mysqlTable(
  "templates",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    projectId: varchar("projectId", { length: 36 }).notNull(),
    name: varchar("name", { length: 160 }).notNull(),
    description: text("description"),
    isActive: boolean("isActive").default(true).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  table => [index("templates_project_idx").on(table.projectId)],
);

export const templateFields = mysqlTable(
  "templateFields",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    templateId: varchar("templateId", { length: 36 }).notNull(),
    fieldKey: varchar("fieldKey", { length: 80 }).notNull(),
    formFieldKey: varchar("formFieldKey", { length: 80 }),
    label: varchar("label", { length: 160 }).notNull(),
    fieldScope: mysqlEnum("fieldScope", ["shared", "project"]).default("project").notNull(),
    isRequired: boolean("isRequired").default(false).notNull(),
    position: int("position").default(0).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  table => [
    index("template_fields_template_idx").on(table.templateId),
    uniqueIndex("template_fields_key_unique").on(table.templateId, table.fieldKey),
  ],
);

export const templateVersions = mysqlTable(
  "templateVersions",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    templateId: varchar("templateId", { length: 36 }).notNull(),
    version: varchar("version", { length: 32 }).notNull(),
    status: mysqlEnum("status", ["draft", "approved", "superseded"]).default("draft").notNull(),
    sourceFilename: varchar("sourceFilename", { length: 255 }).notNull(),
    docxStorageKey: varchar("docxStorageKey", { length: 600 }).notNull(),
    docxUrl: varchar("docxUrl", { length: 700 }).notNull(),
    uploadedById: int("uploadedById").notNull(),
    approvedById: int("approvedById"),
    approvedAt: timestamp("approvedAt"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  table => [
    index("template_versions_template_idx").on(table.templateId),
    uniqueIndex("template_versions_unique").on(table.templateId, table.version),
  ],
);

export const loaRecords = mysqlTable(
  "loaRecords",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    projectId: varchar("projectId", { length: 36 }).notNull(),
    templateVersionId: varchar("templateVersionId", { length: 36 }).notNull(),
    createdById: int("createdById").notNull(),
    title: varchar("title", { length: 200 }).notNull(),
    referenceNumber: varchar("referenceNumber", { length: 100 }).notNull(),
    fieldData: json("fieldData").$type<Record<string, string>>().notNull(),
    status: mysqlEnum("status", ["draft", "in_review", "generated", "handoff_ready", "sent_to_sharepoint", "failed"])
      .default("draft")
      .notNull(),
    conversionStatus: mysqlEnum("conversionStatus", ["not_started", "in_progress", "completed", "failed"])
      .default("not_started")
      .notNull(),
    reviewConfirmed: boolean("reviewConfirmed").default(false).notNull(),
    reviewedAt: timestamp("reviewedAt"),
    generatedAt: timestamp("generatedAt"),
    generatedDocxKey: varchar("generatedDocxKey", { length: 600 }),
    generatedDocxUrl: varchar("generatedDocxUrl", { length: 700 }),
    generatedPdfKey: varchar("generatedPdfKey", { length: 600 }),
    generatedPdfUrl: varchar("generatedPdfUrl", { length: 700 }),
    filename: varchar("filename", { length: 255 }),
    intendedSharePointPath: varchar("intendedSharePointPath", { length: 500 }),
    handoffStatus: mysqlEnum("handoffStatus", ["not_prepared", "prepared", "downloaded", "uploaded", "signed"])
      .default("not_prepared")
      .notNull(),
    errorMessage: text("errorMessage"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  table => [
    index("loa_records_project_idx").on(table.projectId),
    index("loa_records_creator_idx").on(table.createdById),
    index("loa_records_status_idx").on(table.status),
  ],
);

export const loaEvents = mysqlTable(
  "loaEvents",
  {
    id: int("id").autoincrement().primaryKey(),
    loaRecordId: varchar("loaRecordId", { length: 36 }).notNull(),
    actorUserId: int("actorUserId"),
    action: varchar("action", { length: 100 }).notNull(),
    detail: text("detail"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  table => [index("loa_events_record_idx").on(table.loaRecordId)],
);

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type Project = typeof projects.$inferSelect;
export type Template = typeof templates.$inferSelect;
export type TemplateField = typeof templateFields.$inferSelect;
export type TemplateVersion = typeof templateVersions.$inferSelect;
export type LoaRecord = typeof loaRecords.$inferSelect;
