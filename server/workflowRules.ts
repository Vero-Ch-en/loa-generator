export type ConfiguredField = {
  fieldKey: string;
  label: string;
  isRequired: boolean;
};

export function validateRequiredFields(fields: ConfiguredField[], values: Record<string, string>) {
  return fields
    .filter(field => field.isRequired && !values[field.fieldKey]?.trim())
    .map(field => field.label);
}

export function canGenerateFromRecord(templateStatus: string, reviewConfirmed: boolean) {
  return templateStatus === "approved" && reviewConfirmed;
}

export function canPrepareHandoff(status: string) {
  return status === "generated";
}

export function canMarkUploaded(status: string, handoffStatus: string) {
  return status === "handoff_ready" && ["prepared", "downloaded"].includes(handoffStatus);
}

export function canMarkSigned(status: string, handoffStatus: string) {
  return status === "sent_to_sharepoint" && handoffStatus === "uploaded";
}
