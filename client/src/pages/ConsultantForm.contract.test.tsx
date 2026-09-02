import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { AUTHORISED_USER_LOA_FIELDS } from "@shared/authorisedUserLoaFields";

function ConsultantFormContract() {
  return React.createElement(
    "form",
    null,
    React.createElement("select", { "data-testid": "approved-template", "aria-label": "Approved template" }),
    React.createElement("input", { "data-testid": "loa-title", "aria-label": "LOA title", defaultValue: "Employee_Employment Contract_Date_Time" }),
    ...AUTHORISED_USER_LOA_FIELDS.map(field => React.createElement("input", { key: field.key, "data-consultant-field": field.key, "aria-label": field.label, required: field.required })),
  );
}

describe("consultant form contract", () => {
  it("exposes only the requested 15 fields plus template selection and editable title", () => {
    const markup = renderToStaticMarkup(React.createElement(ConsultantFormContract));
    expect((markup.match(/data-consultant-field=/g) || []).length).toBe(15);
    expect(markup).toContain('data-testid="approved-template"');
    expect(markup).toContain('data-testid="loa-title"');
    expect(markup).toContain("Employee_Employment Contract_Date_Time");
    expect((markup.match(/required=""/g) || []).length).toBe(14);
  });
});
