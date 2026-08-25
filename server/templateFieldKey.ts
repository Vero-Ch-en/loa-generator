export function normalizeTemplateFieldKey(value: string) {
  const withoutTagBraces = value.trim().replace(/^\{+\s*|\s*\}+$/g, "");
  const withWordBoundaries = withoutTagBraces.replace(/([a-z0-9])([A-Z])/g, "$1_$2");
  const normalized = withWordBoundaries
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");

  if (!normalized) return "";
  return /^[a-z]/.test(normalized) ? normalized.slice(0, 80) : `field_${normalized}`.slice(0, 80);
}
