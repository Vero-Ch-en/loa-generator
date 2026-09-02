export type AuthorisedUserLoaField = {
  key: string;
  label: string;
  inputType: "text" | "email" | "date" | "select" | "textarea";
  required: boolean;
  options?: string[];
};

export const AUTHORISED_USER_LOA_FIELDS: AuthorisedUserLoaField[] = [
  { key: "sign_date", label: "Date", inputType: "date", required: true },
  { key: "employee_full_name", label: "Employee Full Name", inputType: "text", required: true },
  { key: "employee_email", label: "Employee Email", inputType: "email", required: true },
  { key: "nric", label: "NRIC", inputType: "text", required: true },
  { key: "phone_number", label: "Phone Number", inputType: "text", required: true },
  { key: "job_title", label: "Job Title", inputType: "text", required: true },
  { key: "salary_type", label: "Salary Type", inputType: "select", required: true, options: ["Monthly", "Hourly", "Daily"] },
  { key: "salary_amount", label: "Salary Amount", inputType: "text", required: true },
  { key: "start_date", label: "Start Date", inputType: "date", required: true },
  { key: "contract", label: "Contract", inputType: "text", required: true },
  { key: "period_of_employment", label: "Period of Employment", inputType: "text", required: true },
  { key: "payment_date", label: "Payment Date", inputType: "date", required: true },
  { key: "remarks", label: "Remarks", inputType: "textarea", required: false },
  { key: "consultant_full_name", label: "Consultant Full Name", inputType: "text", required: true },
  { key: "consultant_email", label: "Consultant Email", inputType: "email", required: true },
];

export function missingRequiredAuthorisedUserFields(values: Record<string, string>) {
  return AUTHORISED_USER_LOA_FIELDS
    .filter(field => field.required && !values[field.key]?.trim())
    .map(field => field.label);
}
