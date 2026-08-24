import { describe, expect, it } from "vitest";
import { composeLoaFilename } from "./documents";
import { canGenerateFromRecord, canMarkSigned, canMarkUploaded, canPrepareHandoff, validateRequiredFields } from "./workflowRules";

describe("LOA document controls", () => {
  it("creates a consistent, filesystem-safe LOA filename", () => {
    expect(composeLoaFilename("Alpha Project", "LOA / 2026: 001", "Appointment of A. Smith")).toBe("Alpha-Project_LOA-2026-001_Appointment-of-A-Smith");
  });

  it("requires both an approved template and review confirmation", () => {
    expect(canGenerateFromRecord("approved", true)).toBe(true);
    expect(canGenerateFromRecord("draft", true)).toBe(false);
    expect(canGenerateFromRecord("approved", false)).toBe(false);
  });

  it("reports missing configured fields using their human-readable labels", () => {
    expect(validateRequiredFields([
      { fieldKey: "appointee_name", label: "Appointee name", isRequired: true },
      { fieldKey: "effective_date", label: "Effective date", isRequired: true },
      { fieldKey: "notes", label: "Notes", isRequired: false },
    ], { appointee_name: "Jordan Lee", notes: "" })).toEqual(["Effective date"]);
  });

  it("enforces the ordered SharePoint handoff transitions", () => {
    expect(canPrepareHandoff("generated")).toBe(true);
    expect(canPrepareHandoff("in_review")).toBe(false);
    expect(canMarkUploaded("handoff_ready", "prepared")).toBe(true);
    expect(canMarkUploaded("generated", "not_prepared")).toBe(false);
    expect(canMarkSigned("sent_to_sharepoint", "uploaded")).toBe(true);
    expect(canMarkSigned("handoff_ready", "prepared")).toBe(false);
  });
});
