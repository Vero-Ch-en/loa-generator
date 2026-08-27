import { describe, expect, it } from "vitest";
import { canAccessWorkspaceRoute, getConsultantApprovedTemplates, getPdfCompletionOutcome, getWorkspaceNavigation, isConsultantTemplateAvailable, pdfCompletionMessage } from "../shared/consultantFlow";

describe("consultant LOA flow", () => {
  it("shows consultants only the simple workspace and create-LOA navigation", () => {
    expect(getWorkspaceNavigation("user")).toEqual(["/", "/create"]);
    expect(getWorkspaceNavigation("admin")).toContain("/templates");
    expect(canAccessWorkspaceRoute("user", "/templates")).toBe(false);
    expect(canAccessWorkspaceRoute("user", "/history")).toBe(false);
    expect(canAccessWorkspaceRoute("user", "/create")).toBe(true);
  });

  it("only makes approved template versions available for consultant selection", () => {
    expect(isConsultantTemplateAvailable("approved")).toBe(true);
    expect(isConsultantTemplateAvailable("draft")).toBe(false);
    expect(isConsultantTemplateAvailable("superseded")).toBe(false);
    expect(getConsultantApprovedTemplates([{ id: "1", status: "draft" }, { id: "2", status: "approved" }])).toEqual([{ id: "2", status: "approved" }]);
  });

  it("provides a PDF-specific completion message", () => {
    expect(pdfCompletionMessage("Veronica_Employment_Contract.pdf")).toBe("Veronica_Employment_Contract.pdf is ready as a signing-ready PDF.");
    expect(getPdfCompletionOutcome("LOA.pdf", "https://example.com/LOA.pdf")).toEqual({ filename: "LOA.pdf", pdfUrl: "https://example.com/LOA.pdf", message: "LOA.pdf is ready as a signing-ready PDF." });
  });
});
