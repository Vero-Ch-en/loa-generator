export function safeSegment(value, fallback = "LOA") {
  return String(value || "").trim().replace(/[^a-zA-Z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 70) || fallback;
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

export function buildLocalDefaultTitle(employeeFullName, date = new Date()) {
  const employee = String(employeeFullName || "").trim() || "Employee";
  const twoDigits = value => String(value).padStart(2, "0");
  return `${employee}_Employment Contract_${date.getFullYear()}-${twoDigits(date.getMonth() + 1)}-${twoDigits(date.getDate())}_${twoDigits(date.getHours())}-${twoDigits(date.getMinutes())}`;
}

export function deriveLocalWorkflowState() {
  return { folder: "PDF", loaGenerationStatus: "PDF generated", signatureStatus: "Ready for signing" };
}

export function knownFieldValue(field, input) {
  const employee = input.employee || {};
  const consultant = input.consultant || {};
  const values = {
    sign_date: employee.signDate,
    employee_full_name: employee.fullName,
    candidate_full_name: employee.fullName,
    employee_email: employee.email,
    candidate_email: employee.email,
    nric: employee.nric,
    phone: employee.phone,
    phone_number: employee.phone,
    job_title: employee.jobTitle,
    salary: employee.salaryAmount,
    salary_amount: employee.salaryAmount,
    salary_type: employee.salaryType,
    start_date: employee.startDate,
    contract: employee.contract,
    employment_period: employee.employmentPeriod,
    period_of_employment: employee.employmentPeriod,
    payment_date: employee.paymentDate,
    remarks: employee.remarks,
    consultant_full_name: consultant.fullName,
    consultant_email: consultant.email,
    project_code: input.projectCode,
    reference_number: input.referenceNumber,
    loa_title: input.title,
  };
  return values[field] || "";
}

export function validateConsultantGeneration(input, configuredFields) {
  const issues = [];
  if (input.reviewConfirmed !== true) issues.push("Review the LOA details before generating the PDF.");
  const required = [
    [input.template, "Choose an approved DOCX template."],
    [input.projectCode, "Enter a project code."],
    [input.referenceNumber, "Enter a reference number."],
    [input.employee?.fullName, "Enter the employee’s full name."],
    [input.employee?.email, "Enter the employee’s email."],
    [input.employee?.nric, "Enter the NRIC."],
    [input.employee?.jobTitle, "Enter the job title."],
    [input.employee?.salaryType, "Choose the salary type."],
    [input.employee?.salaryAmount, "Enter the salary amount."],
    [input.employee?.startDate, "Enter the start date."],
    [input.employee?.contract, "Enter the employment contract."],
    [input.employee?.employmentPeriod, "Enter the period of employment."],
    [input.employee?.paymentDate, "Enter the payment date."],
    [input.consultant?.fullName, "Enter the consultant’s full name."],
    [input.consultant?.email, "Enter the consultant’s email."],
  ];
  for (const [value, message] of required) if (!String(value || "").trim()) issues.push(message);
  for (const field of configuredFields) {
    if (!String(input.customFields?.[field] || knownFieldValue(field, input)).trim()) issues.push(`Complete ${field.replaceAll("_", " ")}.`);
  }
  return issues;
}

export function buildConsultantReviewRows(input) {
  const employee = input.employee || {};
  const consultant = input.consultant || {};
  return [
    ["Template", input.template], ["Project code", input.projectCode], ["Reference number", input.referenceNumber], ["LOA title", input.title],
    ["Sign date", employee.signDate], ["Employee full name", employee.fullName], ["Employee email", employee.email], ["NRIC", employee.nric], ["Phone number", employee.phone],
    ["Job title", employee.jobTitle], ["Salary type", employee.salaryType], ["Salary amount", employee.salaryAmount], ["Start date", employee.startDate],
    ["Employment contract", employee.contract], ["Period of employment", employee.employmentPeriod], ["Payment date", employee.paymentDate], ["Remarks", employee.remarks],
    ["Consultant full name", consultant.fullName], ["Consultant email", consultant.email],
    ...Object.entries(input.customFields || {}).map(([key, value]) => [key.replaceAll("_", " "), value]),
  ].filter(([, value]) => String(value || "").trim());
}

export function appendAuditEvent(existingAudit, event) {
  return [...(Array.isArray(existingAudit) ? existingAudit : []), event];
}
