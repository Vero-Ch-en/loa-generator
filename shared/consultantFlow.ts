export function isConsultantTemplateAvailable(status: string) {
  return status === "approved";
}

export function getWorkspaceNavigation(role?: string) {
  const consultantNavigation = ["/", "/create"];
  return role === "admin" ? [...consultantNavigation, "/history", "/templates", "/admin"] : consultantNavigation;
}

export function canAccessWorkspaceRoute(role: string | undefined, path: string) {
  return getWorkspaceNavigation(role).includes(path);
}

export function getConsultantApprovedTemplates<T extends { status: string }>(versions: T[]) {
  return versions.filter(version => isConsultantTemplateAvailable(version.status));
}

export function pdfCompletionMessage(filename: string) {
  return `${filename} is ready as a signing-ready PDF.`;
}

export function getPdfCompletionOutcome(filename: string, pdfUrl: string) {
  return { filename, pdfUrl, message: pdfCompletionMessage(filename) };
}
