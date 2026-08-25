import { describe, expect, it } from "vitest";
import { normalizeTemplateFieldKey } from "./templateFieldKey";
import { assertTemplateFieldKeyIsAvailable } from "./templateFieldValidation";

describe("template field uniqueness", () => {
  it("rejects a duplicate field after its common input is normalized", () => {
    const key = normalizeTemplateFieldKey("{{Candidate Full Name}}");
    expect(() => assertTemplateFieldKeyIsAvailable([{ fieldKey: "candidate_full_name" }], key)).toThrow("The merge field {{candidate_full_name}} is already configured for this template.");
  });

  it("allows a distinct normalized template field", () => {
    expect(() => assertTemplateFieldKeyIsAvailable([{ fieldKey: "candidate_full_name" }], "payment_date")).not.toThrow();
  });
});
