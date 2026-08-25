import { TRPCError } from "@trpc/server";

export function assertTemplateFieldKeyIsAvailable(existingFields: Array<{ fieldKey: string }>, fieldKey: string) {
  if (existingFields.some(field => field.fieldKey === fieldKey)) {
    throw new TRPCError({ code: "CONFLICT", message: `The merge field {{${fieldKey}}} is already configured for this template.` });
  }
}
