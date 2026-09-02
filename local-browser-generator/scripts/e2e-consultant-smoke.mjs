const base = process.env.LOCAL_LOA_BASE_URL || "http://127.0.0.1:8787";
const templatePath = process.env.SMOKE_TEMPLATE_PATH || new URL("../templates/LOA-Smoke.docx", import.meta.url);

async function request(path, options) {
  const response = await fetch(`${base}${path}`, options);
  const body = await response.json().catch(() => ({}));
  if (!response.ok && !(path === "/api/generate" && String(body.error || "").includes("runs on Windows"))) {
    throw new Error(`${path} returned ${response.status}: ${JSON.stringify(body)}`);
  }
  return { response, body };
}

const status = await request("/api/status");
if (!status.body.local || !status.body.noLogin) throw new Error("The local no-login status contract is not active.");
const page = await fetch(`${base}/`);
const pageText = await page.text();
if (!pageText.includes("{{employee_full_name}}") || !pageText.includes("Review details")) throw new Error("The running app is missing merge-tag help or the review action.");

if (templatePath) {
  const fs = await import("node:fs/promises");
  const file = await fs.readFile(templatePath);
  const filename = templatePath instanceof URL ? templatePath.pathname.split("/").pop() : templatePath.split(/[\\\\/]/).pop();
  await request("/api/templates", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ filename, documentBase64: file.toString("base64") }),
  });
}

const templates = await request("/api/templates");
const selected = templates.body.find(item => item.status === "approved");
if (!selected) throw new Error("No approved template is available for the smoke test.");

const values = {
  template: selected.filename,
  projectCode: "SMOKE",
  referenceNumber: `SMOKE-${Date.now()}`,
  title: "Smoke Employee_Employment Contract_2026-09-02_12-00",
  reviewConfirmed: true,
  generateLoa: true,
  employee: {
    signDate: "2026-09-02",
    fullName: "Smoke Employee",
    email: "smoke.employee@example.com",
    nric: "S0000000A",
    phone: "90000000",
    jobTitle: "Smoke Role",
    salaryType: "Monthly",
    salaryAmount: "1000",
    startDate: "2026-09-15",
    contract: "Fixed-term",
    employmentPeriod: "6 months",
    paymentDate: "2026-09-30",
    remarks: "Smoke test only",
  },
  consultant: { fullName: "Smoke Consultant", email: "smoke.consultant@example.com" },
  customFields: Object.fromEntries(selected.fields.map(field => [field, field === "employee_full_name" ? "Smoke Employee" : "Smoke value"])),
};

const before = await request("/api/history");
const generation = await request("/api/generate", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(values),
});
const after = await request("/api/history");
if (!generation.body.pdfPath || !generation.body.id || !after.body.some(item => item.id === generation.body.id) || after.body.length <= before.body.length) {
  throw new Error("Generation did not produce a PDF result and new local history entry.");
}
console.log(JSON.stringify({ selectedTemplate: selected.filename, reviewConfirmed: values.reviewConfirmed, historyBefore: before.body.length, historyAfter: after.body.length, historyEntryId: generation.body.id, pdfPath: generation.body.pdfPath, generationStatus: "PDF generated" }, null, 2));
