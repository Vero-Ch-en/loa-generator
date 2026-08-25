export function safeSegment(value, fallback = "LOA") {
  return (String(value || "").trim().replace(/[^a-zA-Z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 70) || fallback);
}

export function composeFilename(projectCode, referenceNumber, title) {
  return `${safeSegment(projectCode, "PROJECT")}_${safeSegment(referenceNumber, "REFERENCE")}_${safeSegment(title)}`;
}

export function extractTemplateFields(fullText) {
  const fields = new Set();
  const pattern = /\{\{?\s*([a-zA-Z][a-zA-Z0-9_]*)\s*\}?\}/g;
  for (const match of fullText.matchAll(pattern)) fields.add(match[1]);
  return Array.from(fields).sort();
}

export function deriveWorkflowState({ generateLoa, sendForSignature }) {
  if (!generateLoa) return { folder: "Draft", loaGenerationStatus: "Awaiting generation", sentForSignature: "No", signatureStatus: "Not sent" };
  if (sendForSignature) return { folder: "For-Signing", loaGenerationStatus: "Prepared for signature", sentForSignature: "Ready for BoldSign", signatureStatus: "Pending" };
  return { folder: "Draft", loaGenerationStatus: "Monthly Draft Generated", sentForSignature: "No", signatureStatus: "Not sent" };
}

export function validateGenerationInput(input, configuredFields) {
  const issues = [];
  if (!input.template) issues.push("Select an approved DOCX template.");
  if (!String(input.projectCode || "").trim()) issues.push("Enter a project code.");
  if (!String(input.referenceNumber || "").trim()) issues.push("Enter a reference number.");
  if (!String(input.candidate?.fullName || "").trim()) issues.push("Enter the candidate's full name.");
  if (!String(input.candidate?.email || "").trim()) issues.push("Enter the candidate's email.");
  if (!String(input.candidate?.jobTitle || "").trim()) issues.push("Enter the candidate's job title.");
  if (input.sendForSignature && !input.generateLoa) issues.push("Select Generate LOA before preparing a document for signature.");
  if (input.sendForSignature && (!String(input.consultant?.fullName || "").trim() || !String(input.consultant?.email || "").trim())) issues.push("Enter the consultant's full name and email before preparing a signature packet.");
  for (const field of configuredFields) {
    if (!String(input.customFields?.[field] || input.fieldData?.[field] || "").trim() && !knownFieldValue(field, input)) issues.push(`Complete ${field.replaceAll("_", " ")}.`);
  }
  return issues;
}

export function knownFieldValue(field, input) {
  const candidate = input.candidate || {};
  const consultant = input.consultant || {};
  const values = {
    employee_full_name: candidate.fullName,
    candidate_full_name: candidate.fullName,
    employee_email: candidate.email,
    candidate_email: candidate.email,
    phone: candidate.phone,
    phone_number: candidate.phone,
    job_title: candidate.jobTitle,
    salary: candidate.salaryAmount,
    salary_amount: candidate.salaryAmount,
    salary_type: candidate.salaryType,
    sign_date: candidate.signDate,
    start_date: candidate.startDate,
    employment_period: candidate.employmentPeriod,
    consultant_full_name: consultant.fullName,
    consultant_email: consultant.email,
    project_code: input.projectCode,
    reference_number: input.referenceNumber,
    loa_title: input.title,
  };
  return values[field] || "";
}

export function appendAuditEvent(existingAudit, event) {
  return [...(Array.isArray(existingAudit) ? existingAudit : []), event];
}
