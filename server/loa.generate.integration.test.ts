import { beforeEach, describe, expect, it, vi } from "vitest";
import type { TrpcContext } from "./_core/context";

vi.mock("./db", () => ({
  getLoaRecord: vi.fn(),
  getTemplateVersion: vi.fn(),
  getWorkspaceOverview: vi.fn(),
  updateLoaRecord: vi.fn(),
  addLoaEvent: vi.fn(),
}));
vi.mock("./documents", () => ({
  composeLoaFilename: vi.fn(() => "VERONICA_Employment-Contract_2026-08-27_08-50"),
  loadApprovedTemplate: vi.fn(async () => Buffer.from("template")),
  renderDocx: vi.fn(() => Buffer.from("rendered-docx")),
  convertDocxToPdf: vi.fn(async () => Buffer.from("rendered-pdf")),
}));
vi.mock("./storage", () => ({
  storagePut: vi.fn(),
}));

import * as db from "./db";
import { appRouter } from "./routers";
import { storagePut } from "./storage";

const recordId = "00000000-0000-4000-8000-000000000001";
const templateVersionId = "00000000-0000-4000-8000-000000000002";
const projectId = "00000000-0000-4000-8000-000000000003";

function createCaller() {
  const ctx = {
    user: { id: 7, role: "user" },
    req: {},
    res: {},
  } as unknown as TrpcContext;
  return appRouter.createCaller(ctx);
}

describe("LOA generation completion response", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(db.getLoaRecord).mockResolvedValue({
      id: recordId,
      projectId,
      templateVersionId,
      createdById: 7,
      title: "Veronica Chen_Employment Contract_2026-08-27_08-50",
      referenceNumber: "LOA-001",
      fieldData: { employee_full_name: "Veronica Chen" },
      reviewConfirmed: true,
    } as Awaited<ReturnType<typeof db.getLoaRecord>>);
    vi.mocked(db.getTemplateVersion).mockResolvedValue({ status: "approved", docxStorageKey: "templates/approved.docx" } as Awaited<ReturnType<typeof db.getTemplateVersion>>);
    vi.mocked(db.getWorkspaceOverview).mockResolvedValue({ projects: [{ id: projectId, code: "VERONICA" }] } as Awaited<ReturnType<typeof db.getWorkspaceOverview>>);
    vi.mocked(storagePut)
      .mockResolvedValueOnce({ key: "generated/loa.docx", url: "https://files.example.com/loa.docx" })
      .mockResolvedValueOnce({ key: "generated/loa.pdf", url: "https://files.example.com/loa.pdf" });
  });

  it("returns the generated PDF URL and filename used by the consultant completion screen", async () => {
    const result = await createCaller().loas.generate({ id: recordId });

    expect(result).toEqual({
      success: true,
      pdfUrl: "https://files.example.com/loa.pdf",
      filename: "VERONICA_Employment-Contract_2026-08-27_08-50.pdf",
    });
    expect(db.updateLoaRecord).toHaveBeenCalledWith(recordId, expect.objectContaining({ generatedPdfUrl: "https://files.example.com/loa.pdf", conversionStatus: "completed" }));
  });
});
