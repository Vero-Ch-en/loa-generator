# Hosted workflow

The LOA Generator is designed to use the hosted application as the primary experience. The project source is connected to the GitHub repository, while the published web application runs at the project’s hosted domain. Consultants use the hosted `/create` flow and do not need the Windows portable launcher.

Administrators use `/templates` to configure projects, upload approved DOCX versions, and map each document merge tag to a fixed LOA form field. The hosted database stores template metadata, mappings, review records, and audit events; hosted file storage stores source and generated documents. The portable Windows bundle remains available for organizations that specifically need local Microsoft Word conversion or offline folder handling.

For each new version, push or sync the source to the connected GitHub repository and publish the project through the configured hosting workflow. After deployment, verify `/create`, `/templates`, and one mapped generation path using a non-production template before approving the version for consultant use.
