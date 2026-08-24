import { storageGetSignedUrl } from "./storage";

export type SharePointUploadConfig = {
  accessToken?: string;
  driveId?: string;
  parentItemId?: string;
};

export type SharePointUploadResult = {
  itemId: string;
  webUrl?: string;
};

export function getSharePointUploadConfig(): SharePointUploadConfig {
  return {
    accessToken: process.env.MICROSOFT_GRAPH_ACCESS_TOKEN,
    driveId: process.env.MICROSOFT_SHAREPOINT_DRIVE_ID,
    parentItemId: process.env.MICROSOFT_SHAREPOINT_PARENT_ITEM_ID,
  };
}

export function isSharePointUploadConfigured() {
  const config = getSharePointUploadConfig();
  return Boolean(config.accessToken && config.driveId && config.parentItemId);
}

export async function uploadPdfToSharePoint(input: {
  storageKey: string;
  filename: string;
}): Promise<SharePointUploadResult> {
  const config = getSharePointUploadConfig();
  if (!config.accessToken || !config.driveId || !config.parentItemId) {
    throw new Error("Direct SharePoint upload is not configured. Add Microsoft 365 authorization and the target drive details before using this action.");
  }

  const sourceUrl = await storageGetSignedUrl(input.storageKey);
  const sourceResponse = await fetch(sourceUrl);
  if (!sourceResponse.ok) throw new Error("The signing-ready PDF could not be retrieved for SharePoint upload.");
  const pdfBytes = Buffer.from(await sourceResponse.arrayBuffer());
  const destination = `https://graph.microsoft.com/v1.0/drives/${encodeURIComponent(config.driveId)}/items/${encodeURIComponent(config.parentItemId)}:/${encodeURIComponent(input.filename)}:/content`;
  const response = await fetch(destination, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${config.accessToken}`,
      "Content-Type": "application/pdf",
    },
    body: pdfBytes,
  });
  if (!response.ok) {
    const detail = await response.text().catch(() => response.statusText);
    throw new Error(`SharePoint upload failed (${response.status}): ${detail}`);
  }
  const item = (await response.json()) as { id?: string; webUrl?: string };
  if (!item.id) throw new Error("SharePoint did not return a file identifier.");
  return { itemId: item.id, webUrl: item.webUrl };
}
