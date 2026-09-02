import { execFile } from "node:child_process";
import { promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";
import { promisify } from "node:util";
import Docxtemplater from "docxtemplater";
import PizZip from "pizzip";
import { storageGetSignedUrl } from "./storage";

const execFileAsync = promisify(execFile);

export function composeLoaFilename(projectCode: string, referenceNumber: string, title: string) {
  const clean = (value: string) =>
    value
      .trim()
      .replace(/[^a-zA-Z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 70) || "LOA";

  return `${clean(projectCode)}_${clean(referenceNumber)}_${clean(title)}`;
}

export async function loadApprovedTemplate(storageKey: string) {
  const signedUrl = await storageGetSignedUrl(storageKey);
  const response = await fetch(signedUrl);
  if (!response.ok) throw new Error("The approved template could not be downloaded.");
  return Buffer.from(await response.arrayBuffer());
}

export function renderDocx(templateBuffer: Buffer, fieldData: Record<string, string>) {
  try {
    const zip = new PizZip(templateBuffer);
    const document = new Docxtemplater(zip, {
      paragraphLoop: true,
      linebreaks: true,
      delimiters: { start: "{{", end: "}}" },
      nullGetter: () => "",
    });
    document.render(fieldData);
    return document.getZip().generate({ type: "nodebuffer", compression: "DEFLATE" });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Template rendering failed.";
    throw new Error(`The approved DOCX could not be populated: ${message}`);
  }
}

export async function convertDocxToPdf(docxBuffer: Buffer, outputFilename: string) {
  const workDir = await fs.mkdtemp(path.join(os.tmpdir(), "loa-render-"));
  const docxPath = path.join(workDir, `${outputFilename}.docx`);
  const pdfPath = path.join(workDir, `${outputFilename}.pdf`);

  try {
    await fs.writeFile(docxPath, docxBuffer);
    await execFileAsync(
      "soffice",
      ["--headless", "--convert-to", "pdf:writer_pdf_Export", "--outdir", workDir, docxPath],
      { timeout: 120_000, maxBuffer: 1024 * 1024 },
    );
    return await fs.readFile(pdfPath);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Office conversion failed.";
    throw new Error(`The signing-ready PDF could not be created: ${message}`);
  } finally {
    await fs.rm(workDir, { recursive: true, force: true });
  }
}
