import { describe, expect, it } from "vitest";
import { AUTHORISED_USER_LOA_FIELDS, missingRequiredAuthorisedUserFields } from "../shared/authorisedUserLoaFields";
import { buildAuthorisedUserReviewRows } from "../shared/loaReview";

describe("authorised-user LOA field mapping", () => {
  it("includes every requested candidate, payment, and consultant merge field", () => {
    expect(AUTHORISED_USER_LOA_FIELDS.map(field => field.key)).toEqual([
      "sign_date", "employee_full_name", "employee_email", "nric", "phone_number", "job_title", "salary_type", "salary_amount", "start_date", "contract", "period_of_employment", "payment_date", "remarks", "consultant_full_name", "consultant_email",
    ]);
  });

  it("exposes exactly the requested 15 fields with no extra required consultant input", () => {
    expect(AUTHORISED_USER_LOA_FIELDS).toHaveLength(15);
    expect(AUTHORISED_USER_LOA_FIELDS.map(field => field.label)).toEqual([
      "Date", "Employee Full Name", "Employee Email", "NRIC", "Phone Number", "Job Title", "Salary Type", "Salary Amount", "Start Date", "Contract", "Period of Employment", "Payment Date", "Remarks", "Consultant Full Name", "Consultant Email",
    ]);
    expect(AUTHORISED_USER_LOA_FIELDS.filter(field => !field.required).map(field => field.label)).toEqual(["Remarks"]);
  });

  it("identifies missing required authorised-user values before generation", () => {
    const values = Object.fromEntries(AUTHORISED_USER_LOA_FIELDS.map(field => [field.key, field.required ? "Provided" : ""]));
    values.nric = "";
    values.consultant_email = "";
    expect(missingRequiredAuthorisedUserFields(values)).toEqual(["NRIC", "Consultant Email"]);
  });

  it("includes supplied authorised-user values in the review data before generation", () => {
    const rows = buildAuthorisedUserReviewRows({ employee_full_name: "Veronica Chen", nric: "S1234567A", consultant_email: "consultant@example.com" });
    expect(rows).toHaveLength(15);
    expect(rows).toContainEqual({ label: "Employee Full Name", value: "Veronica Chen" });
    expect(rows).toContainEqual({ label: "NRIC", value: "S1234567A" });
    expect(rows).toContainEqual({ label: "Consultant Email", value: "consultant@example.com" });
    expect(rows).toContainEqual({ label: "Payment Date", value: "—" });
  });
});
