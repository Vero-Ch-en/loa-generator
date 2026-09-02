import { describe, expect, it } from "vitest";
import { getUnmappedTemplateFields, normalizeMappingTarget, resolveTemplateFieldData } from "./templateMapping";

describe("template mapping", () => {
  it("accepts canonical targets and common aliases", () => {
    expect(normalizeMappingTarget("employee_full_name")).toBe("employee_full_name");
    expect(normalizeMappingTarget("{{Phone}}")).toBe("phone_number");
    expect(normalizeMappingTarget("period")).toBe("period_of_employment");
    expect(normalizeMappingTarget("unknown_tag")).toBe("");
  });

  it("copies fixed-form values into template-specific merge tags", () => {
    expect(resolveTemplateFieldData({ employee_full_name: "Jane Tan", salary_amount: "3200" }, [
      { fieldKey: "candidate_name", formFieldKey: "employee_full_name" },
      { fieldKey: "monthly_pay", formFieldKey: "salary_amount" },
    ])).toEqual({ employee_full_name: "Jane Tan", salary_amount: "3200", candidate_name: "Jane Tan", monthly_pay: "3200" });
  });

  it("identifies tags that still need manual input", () => {
    expect(getUnmappedTemplateFields([
      { fieldKey: "candidate_name", formFieldKey: "employee_full_name" },
      { fieldKey: "special_note", formFieldKey: null },
    ])).toEqual(["special_note"]);
  });
});
