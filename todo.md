# Project TODO

- [x] Confirm the audit helper is exported, test regeneration audit retention, and rebuild the portable Windows bundle after the fix.

- [x] Preserve prior audit events when regeneration is requested and add tests for the retained audit trail.

- [x] Add candidate employment-detail capture matching the reference workflow, including contact, role, salary, dates, and contract period.
- [x] Add consultant details and explicit Generate LOA / Send for Signature choices.
- [x] Add local draft, signature-ready, and signature-status transitions with reference-style status fields.
- [x] Organize generated files into local Draft and For Signing project folders and provide a manual signing checklist.
- [x] Add a controlled regeneration action that resets the local generation state and preserves audit history.

- [ ] Run the portable Windows bundle with the default folders and verify startup, template discovery, local history, and Microsoft Word DOCX/PDF generation on the target computer.

- [x] Validate the portable generator with the confirmed default `templates`, `output`, and `data` folder structure.

- [x] Bundle a portable Windows launcher so the local browser generator does not require a separate Node.js installation.
- [x] Add native Windows folder browse actions for template and output directories, with the local history location clearly displayed.
- [x] Confirm the user’s intended template, output, and local-history folder arrangement before final Windows validation.

- [x] Use locally installed Microsoft Word for Windows DOCX-to-PDF conversion with layout-preserving output.

- [x] Build the Windows local browser generator in the user-bound folder with a simple local launch workflow.

- [x] Reconfigure the LOA generator as a local browser application with no installation requirement.

- [x] Configure the local-first generator for Windows folders and Windows-compatible PDF conversion.

- [x] Confirm the target operating system, local storage location, and packaging expectations for the desktop LOA generator.
- [x] Rework the application from hosted storage and authentication to a local-first desktop workflow.
- [x] Add local folder selection for approved DOCX templates, generated DOCX/PDF outputs, and auditable generation history.
- [x] Replace SharePoint handoff controls with optional export to a locally synchronized SharePoint folder.
- [x] Package and test the local browser generator startup, local folder settings, template discovery, and workflow rules.
- [ ] Verify Windows Word PDF rendering against each approved LOA template on the target computer.

- [x] Add administrator controls to authorize colleagues and manage workspace roles.
- [x] Support configurable shared versus project-specific fields and enforce required fields against template configuration on the server.
- [x] Expose generation creator and audit events, and support uploaded and signed handoff status transitions.
- [x] Add a Microsoft 365 SharePoint adapter interface that can accept credentials and enable direct upload later.
- [x] Expand workflow tests to cover approval enforcement, field validation, and state transitions.

- [x] Define LOA workspace domain model for projects, approved template versions, field definitions, LOA records, generated files, handoff state, and audit history.
- [x] Configure role-aware authenticated access for the current owner and future authorized colleagues.
- [x] Build an elegant internal dashboard with LOA activity, generation status, and clear next actions.
- [x] Build project and approved template version management for four initial LOA variants and future projects.
- [x] Support shared fields and project-specific fields in template configuration.
- [x] Create a guided manual LOA form with project/template selection, required-field validation, and review-before-generation.
- [x] Generate a completed DOCX from an approved template version while preserving template structure and formatting.
- [x] Convert generated DOCX files into signing-ready PDFs without unintended layout changes.
- [x] Store generated DOCX and PDF files in managed file storage and persist traceability metadata.
- [x] Create generation history with creator, project, template version, timestamps, status, and links to outputs.
- [x] Implement SharePoint-ready filename conventions, download handoff, and signing/storage status tracking.
- [x] Prepare a direct SharePoint upload integration point for later Microsoft 365 authorization.
- [x] Add unit tests for domain validation, approved-version enforcement, generation-state transitions, and filename composition.
- [x] Verify critical workspace views at desktop and mobile sizes, resolve console/build errors, and create a delivery checkpoint.

<!-- Earlier duplicate checklist entries created during initial scaffolding are retained below as completed history. -->
- [x] Define LOA workspace domain model for projects, approved template versions, field definitions, LOA records, generated files, handoff state, and audit history.
- [x] Configure role-aware authenticated access for the current owner and future authorized colleagues.
- [x] Build an elegant internal dashboard with LOA activity, generation status, and clear next actions.
- [x] Build project and approved template version management for four initial LOA variants and future projects.
- [x] Support shared fields and project-specific fields in template configuration.
- [x] Create a guided manual LOA form with project/template selection, required-field validation, and review-before-generation.
- [x] Generate a completed DOCX from an approved template version while preserving template structure and formatting.
- [x] Convert generated DOCX files into signing-ready PDFs without unintended layout changes.
- [x] Store generated DOCX and PDF files in managed file storage and persist traceability metadata.
- [x] Create generation history with creator, project, template version, timestamps, status, and links to outputs.
- [x] Implement SharePoint-ready filename conventions, download handoff, and signing/storage status tracking.
- [x] Prepare a direct SharePoint upload integration point for later Microsoft 365 authorization.
- [x] Add unit tests for domain validation, approved-version enforcement, generation-state transitions, and filename composition.
- [x] Verify critical workspace views at desktop and mobile sizes, resolve console/build errors, and create a delivery checkpoint.
- [x] Define LOA workspace domain model for projects, approved template versions, field definitions, LOA records, generated files, handoff state, and audit history.
- [x] Configure role-aware authenticated access for the current owner and future authorized colleagues.
- [x] Build an elegant internal dashboard with LOA activity, generation status, and clear next actions.
- [x] Build project and approved template version management for four initial LOA variants and future projects.
- [x] Support shared fields and project-specific fields in template configuration.
- [x] Create a guided manual LOA form with project/template selection, required-field validation, and review-before-generation.
- [x] Generate a completed DOCX from an approved template version while preserving template structure and formatting.
- [x] Convert generated DOCX files into signing-ready PDFs without unintended layout changes.
- [x] Store generated DOCX and PDF files in managed file storage and persist traceability metadata.
- [x] Create generation history with creator, project, template version, timestamps, status, and links to outputs.
- [x] Implement SharePoint-ready filename conventions, download handoff, and signing/storage status tracking.
- [x] Prepare a direct SharePoint upload integration point for later Microsoft 365 authorization.
- [x] Add unit tests for domain validation, approved-version enforcement, generation-state transitions, and filename composition.
- [x] Verify critical workspace views at desktop and mobile sizes, resolve console/build errors, and create a delivery checkpoint.
