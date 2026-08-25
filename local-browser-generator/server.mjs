import { execFile } from "node:child_process";
import { createServer } from "node:http";
import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";
import Docxtemplater from "docxtemplater";
import PizZip from "pizzip";
import { appendAuditEvent, composeFilename, deriveWorkflowState, extractTemplateFields, knownFieldValue, validateGenerationInput } from "./src/rules.mjs";

const execFileAsync = promisify(execFile);
const sourceRoot = path.dirname(fileURLToPath(import.meta.url));
const root = process.pkg ? path.dirname(process.execPath) : sourceRoot;
const dataDirectory = path.join(root, "data");
const configPath = path.join(dataDirectory, "settings.json");
const historyPath = path.join(dataDirectory, "generation-history.json");
const defaultConfig = { templateDirectory: path.join(root, "templates"), outputDirectory: path.join(root, "output") };
const contentTypes = { ".html": "text/html; charset=utf-8", ".js": "application/javascript; charset=utf-8", ".css": "text/css; charset=utf-8" };

async function ensureSetup() {
  await fs.mkdir(dataDirectory, { recursive: true });
  for (const folder of Object.values(defaultConfig)) await fs.mkdir(folder, { recursive: true });
  try { await fs.access(configPath); } catch { await fs.writeFile(configPath, JSON.stringify(defaultConfig, null, 2)); }
  try { await fs.access(historyPath); } catch { await fs.writeFile(historyPath, "[]"); }
}
async function getConfig() { await ensureSetup(); return { ...defaultConfig, ...JSON.parse(await fs.readFile(configPath, "utf8")) }; }
function resolveLocalFolder(folder) { const resolved = path.resolve(String(folder || "")); if (!path.isAbsolute(resolved)) throw new Error("Use an absolute Windows folder path."); return resolved; }
async function readJson(request) { const chunks = []; for await (const chunk of request) chunks.push(chunk); try { return JSON.parse(Buffer.concat(chunks).toString("utf8") || "{}"); } catch { throw new Error("Invalid request data."); } }
async function browseForFolder(title, initialFolder) {
  if (process.platform !== "win32") throw new Error("Windows folder browsing is available when this generator runs on the target Windows computer.");
  const script = ["Add-Type -AssemblyName System.Windows.Forms", "$dialog = New-Object System.Windows.Forms.FolderBrowserDialog", `$dialog.Description = '${String(title).replace(/'/g, "''")}'`, `$dialog.SelectedPath = '${String(initialFolder || "").replace(/'/g, "''")}'`, "if ($dialog.ShowDialog() -eq [System.Windows.Forms.DialogResult]::OK) { Write-Output $dialog.SelectedPath }"].join("\n");
  const { stdout } = await execFileAsync("powershell.exe", ["-NoProfile", "-STA", "-ExecutionPolicy", "Bypass", "-Command", script], { timeout: 120000 });
  return stdout.trim();
}
async function listTemplates() {
  const { templateDirectory } = await getConfig(); await fs.mkdir(templateDirectory, { recursive: true });
  return Promise.all((await fs.readdir(templateDirectory)).filter(name => name.toLowerCase().endsWith(".docx")).map(async filename => {
    const zip = new PizZip(await fs.readFile(path.join(templateDirectory, filename)));
    const text = zip.file("word/document.xml")?.asText() || "";
    return { filename, fields: extractTemplateFields(text.replace(/<[^>]+>/g, " ")) };
  }));
}
async function getHistory() { await ensureSetup(); return JSON.parse(await fs.readFile(historyPath, "utf8")); }
async function saveHistory(history) { await fs.writeFile(historyPath, JSON.stringify(history.slice(0, 500), null, 2)); }
async function appendHistory(entry) { const history = await getHistory(); history.unshift(entry); await saveHistory(history); }
async function updateHistory(id, update) { const history = await getHistory(); const index = history.findIndex(entry => entry.id === id); if (index < 0) throw new Error("The local LOA record was not found."); history[index] = { ...history[index], ...update, updatedAt: new Date().toISOString() }; await saveHistory(history); return history[index]; }
async function convertWithWord(docxPath, pdfPath) {
  if (process.platform !== "win32") throw new Error("Microsoft Word conversion runs on Windows. Copy this portable generator to the target Windows computer to create PDFs.");
  const script = ["$ErrorActionPreference = 'Stop'", "$word = New-Object -ComObject Word.Application", "$word.Visible = $false", "try {", `  $document = $word.Documents.Open('${docxPath.replace(/'/g, "''")}')`, `  $document.SaveAs([ref]'${pdfPath.replace(/'/g, "''")}', [ref]17)`, "  $document.Close()", "} finally {", "  $word.Quit()", "  [System.Runtime.InteropServices.Marshal]::ReleaseComObject($word) | Out-Null", "}"].join("\n");
  await execFileAsync("powershell.exe", ["-NoProfile", "-NonInteractive", "-ExecutionPolicy", "Bypass", "-Command", script], { timeout: 120000 });
}
function templateData(input, fields) {
  const values = { ...input.customFields };
  for (const field of fields) values[field] = values[field] || knownFieldValue(field, input);
  return { ...values, project_code: input.projectCode, reference_number: input.referenceNumber, loa_title: input.title || "Employment Letter (LOA)", generated_date: new Date().toLocaleDateString("en-GB") };
}
async function generateLoa(input) {
  const config = await getConfig(); const templates = await listTemplates(); const selected = templates.find(template => template.filename === input.template);
  const missing = validateGenerationInput(input, selected?.fields || []); if (missing.length) throw new Error(missing.join(" "));
  const workflow = deriveWorkflowState(input);
  if (!input.generateLoa) {
    const entry = { id: crypto.randomUUID(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), candidate: input.candidate, consultant: input.consultant, projectCode: input.projectCode, referenceNumber: input.referenceNumber, title: input.title || "Employment Letter (LOA)", template: input.template, generateLoa: false, sendForSignature: false, ...workflow, docxPath: null, pdfPath: null, audit: [{ at: new Date().toISOString(), action: "Awaiting generation", detail: "Candidate and consultant details saved locally; no document was generated." }] };
    await appendHistory(entry); return entry;
  }
  const projectDirectory = path.join(config.outputDirectory, String(input.projectCode).trim().replace(/[^a-zA-Z0-9_-]/g, "_"), workflow.folder);
  await fs.mkdir(projectDirectory, { recursive: true });
  const filename = composeFilename(input.projectCode, input.referenceNumber, `${input.candidate.fullName}_Employment-LOA`);
  const docxPath = path.join(projectDirectory, `${filename}.docx`); const pdfPath = path.join(projectDirectory, `${filename}.pdf`);
  const document = new Docxtemplater(new PizZip(await fs.readFile(path.join(config.templateDirectory, selected.filename))), { paragraphLoop: true, linebreaks: true, nullGetter: () => "" });
  document.render(templateData(input, selected.fields)); await fs.writeFile(docxPath, document.getZip().generate({ type: "nodebuffer", compression: "DEFLATE" })); await convertWithWord(docxPath, pdfPath);
  const entry = { id: crypto.randomUUID(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), candidate: input.candidate, consultant: input.consultant, projectCode: input.projectCode, referenceNumber: input.referenceNumber, title: input.title || "Employment Letter (LOA)", template: input.template, generateLoa: input.generateLoa, sendForSignature: input.sendForSignature, ...workflow, docxPath, pdfPath, audit: [{ at: new Date().toISOString(), action: workflow.loaGenerationStatus, detail: `Generated in ${workflow.folder}.` }] };
  await appendHistory(entry); return entry;
}
async function regenerate(id) { const history = await getHistory(); const record = history.find(item => item.id === id); if (!record) throw new Error("The local LOA record was not found."); record.loaGenerationStatus = "Regeneration required"; record.sentForSignature = "No"; record.signatureStatus = "Not sent"; record.updatedAt = new Date().toISOString(); record.audit = appendAuditEvent(record.audit, { at: record.updatedAt, action: "Regeneration required", detail: "Previous local document remains in place; generate a new controlled version from current details." }); await saveHistory(history); return record; }
async function markSigned(id) { const history = await getHistory(); const record = history.find(item => item.id === id); if (!record) throw new Error("The local LOA record was not found."); record.signatureStatus = "Signed"; record.sentForSignature = "Completed"; record.updatedAt = new Date().toISOString(); record.audit = appendAuditEvent(record.audit, { at: record.updatedAt, action: "Signed", detail: "Signing completion recorded locally." }); await saveHistory(history); return record; }
function send(response, status, body, type = "application/json") { response.writeHead(status, { "Content-Type": type }); response.end(type === "application/json" ? JSON.stringify(body) : body); }
async function handle(request, response) {
  const url = new URL(request.url, "http://127.0.0.1");
  try {
    if (request.method === "GET" && url.pathname === "/api/status") return send(response, 200, { local: true, platform: process.platform, wordConversion: process.platform === "win32", portable: Boolean(process.pkg) });
    if (request.method === "GET" && url.pathname === "/api/settings") return send(response, 200, { ...(await getConfig()), historyPath });
    if (request.method === "POST" && url.pathname === "/api/browse-folder") { const input = await readJson(request); const config = await getConfig(); const isOutput = input.kind === "output"; return send(response, 200, { path: await browseForFolder(isOutput ? "Choose the generated LOA output folder" : "Choose the approved LOA template folder", isOutput ? config.outputDirectory : config.templateDirectory) }); }
    if (request.method === "POST" && url.pathname === "/api/settings") { const input = await readJson(request); const config = { templateDirectory: resolveLocalFolder(input.templateDirectory), outputDirectory: resolveLocalFolder(input.outputDirectory) }; await fs.mkdir(config.templateDirectory, { recursive: true }); await fs.mkdir(config.outputDirectory, { recursive: true }); await fs.writeFile(configPath, JSON.stringify(config, null, 2)); return send(response, 200, config); }
    if (request.method === "GET" && url.pathname === "/api/templates") return send(response, 200, await listTemplates());
    if (request.method === "GET" && url.pathname === "/api/history") return send(response, 200, await getHistory());
    if (request.method === "POST" && url.pathname === "/api/generate") return send(response, 201, await generateLoa(await readJson(request)));
    if (request.method === "POST" && /^\/api\/history\/[^/]+\/regenerate$/.test(url.pathname)) return send(response, 200, await regenerate(url.pathname.split("/")[3]));
    if (request.method === "POST" && /^\/api\/history\/[^/]+\/signed$/.test(url.pathname)) return send(response, 200, await markSigned(url.pathname.split("/")[3]));
    if (request.method === "GET") { const requested = url.pathname === "/" ? "/index.html" : url.pathname; const fullPath = path.resolve(root, "public", `.${requested}`); if (!fullPath.startsWith(path.resolve(root, "public"))) return send(response, 403, "Forbidden", "text/plain"); return send(response, 200, await fs.readFile(fullPath), contentTypes[path.extname(fullPath)] || "application/octet-stream"); }
    send(response, 404, { error: "Not found." });
  } catch (error) { send(response, 400, { error: error instanceof Error ? error.message : "Local generator error." }); }
}
await ensureSetup(); const port = Number(process.env.LOCAL_LOA_PORT || 8787); createServer(handle).listen(port, "127.0.0.1", () => console.log(`Local LOA Generator is running at http://127.0.0.1:${port}`));
