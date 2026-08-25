import { describe, expect, it } from "vitest";
import { normalizeTemplateFieldKey } from "./templateFieldKey";

describe("template field key normalization", () => {
  it("accepts a merge-tag style field key", () => {
    expect(normalizeTemplateFieldKey("{{ Candidate Full Name }}")).toBe("candidate_full_name");
  });

  it("converts labels and camel-case keys to a safe merge field", () => {
    expect(normalizeTemplateFieldKey("StartDate")).toBe("start_date");
    expect(normalizeTemplateFieldKey("Basic Salary (Monthly)")).toBe("basic_salary_monthly");
  });

  it("prefixes values that begin with a number and rejects empty keys", () => {
    expect(normalizeTemplateFieldKey("2026 Start Date")).toBe("field_2026_start_date");
    expect(normalizeTemplateFieldKey("{{ }}")).toBe("");
  });
});
