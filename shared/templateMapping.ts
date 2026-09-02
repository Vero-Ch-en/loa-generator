import { AUTHORISED_USER_LOA_FIELDS } from "./authorisedUserLoaFields";

export const TEMPLATE_MAPPING_TARGETS = AUTHORISED_USER_LOA_FIELDS.map(field => ({ key: field.key, label: field.label }));

const aliases: Record<string, string> = {
  phone: "phone_number",
  period: "period_of_employment",
  employment_period: "period_of_employment",
};

export function normalizeMappingTarget(value: string | null | undefined) {
  const normalized = String(value || "").trim().toLowerCase().replace(/^\{+|\}+$/g, "").replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
  const target = aliases[normalized] || normalized;
  return AUTHORISED_USER_LOA_FIELDS.some(field => field.key === target) ? target : "";
}

export function resolveTemplateFieldData(fieldData: Record<string, string>, mappings: Array<{ fieldKey: string; formFieldKey: string | null }>) {
  const resolved = { ...fieldData };
  for (const mapping of mappings) {
    if (mapping.formFieldKey && fieldData[mapping.formFieldKey] !== undefined) resolved[mapping.fieldKey] = fieldData[mapping.formFieldKey];
  }
  return resolved;
}

export function getUnmappedTemplateFields(fields: Array<{ fieldKey: string; formFieldKey?: string | null }>) {
  return fields.filter(field => !field.formFieldKey).map(field => field.fieldKey);
}
