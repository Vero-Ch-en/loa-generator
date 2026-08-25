import { AUTHORISED_USER_LOA_FIELDS } from "./authorisedUserLoaFields";

export function buildAuthorisedUserReviewRows(values: Record<string, string>) {
  return AUTHORISED_USER_LOA_FIELDS.map(field => ({
    label: field.label,
    value: values[field.key] || "—",
  }));
}
