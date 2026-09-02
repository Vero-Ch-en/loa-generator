# Project TODO

- [x] Add a separate local review step before PDF generation and verify the form transitions through review to completion.
- [x] Superseded by the GitHub-hosted workflow; portable Windows validation remains optional rather than a release requirement.

- [x] Convert the simplified consultant workspace into a standalone local browser application with no login requirement.
- [x] Preserve the consultant template-choice, fill-in, review, and signing-ready PDF flow in the local version.
- [x] Provide simple local template administration and local history without hosted accounts or database access.
- [x] Package and test the no-login Windows local consultant version with the default folders.

- [x] Run and confirm the router-level LOA generation integration test returns the consultant PDF URL and filename.

- [x] Add integration-level coverage for successful approved-template generation returning a PDF URL and transitioning the consultant flow to the completion screen.

- [x] Exercise a successful approved-template generation and verify the consultant sees the PDF completion and download state.

- [x] Verify direct route redirects prevent consultants from accessing templates, roles, and history administration.
- [x] Verify consultant template filtering and post-generation PDF completion state through the implemented workflow helpers and UI build.

- [x] Add route-level administrator guards for templates, access roles, and history administration, while keeping the consultant workspace and creation form accessible.
- [x] Add higher-level tests for consultant route access, approved-template-only selection, and PDF completion state.

- [x] Simplify navigation and the landing screen around a consultant’s primary task: create an LOA.
- [x] Present approved template selection as the first step in a focused consultant form.
- [x] Show only the fields required by the selected template plus standard consultant inputs.
- [x] Keep template upload, field mapping, access controls, and history administration restricted to administrators.
- [x] Generate and present the signing-ready PDF as the consultant-facing completion outcome.
- [x] Add tests for consultant access, approved-template selection, and PDF-only completion messaging.

- [x] Resolve the title-helper import, verify editable default-title behavior, and run its test coverage.

- [x] Default the editable LOA title to Employee Full Name_Employment Contract_Date_Time, with sensible missing-value fallbacks.
- [x] Add tests for the default LOA title composition and manual override behavior.

- [x] Verify the authorised-user review-data and duplicate normalized-key conflict tests run successfully.

- [x] Add test coverage for authorised-user data included in the review step.
- [x] Add server-level test coverage for duplicate normalized template field keys.

- [x] Add authorised-user inputs for sign date, employee identity and contact, NRIC, job, salary, start date, contract, employment period, payment date, and remarks.
- [x] Map consultant full name and email alongside the authorised-user template values.
- [x] Add tests that verify the required authorised-user field mapping and review data.

- [x] Normalize template field keys from common labels and merge-tag-style input before validation, with clear admin feedback.
- [x] Add validation tests for field-key normalization and duplicate-key handling.

- [x] Verify all OpenSign wording replaces BoldSign references and rebuild the portable Windows bundle after the signing-handoff update.

- [x] Replace BoldSign-specific handoff wording and checklist steps with OpenSign instructions and terminology.

- [x] Confirm the audit helper is exported, test regeneration audit retention, and rebuild the portable Windows bundle after the fix.

- [x] Preserve prior audit events when regeneration is requested and add tests for the retained audit trail.

- [x] Add candidate employment-detail capture matching the reference workflow, including contact, role, salary, dates, and contract period.
- [x] Add consultant details and explicit Generate LOA / Send for Signature choices.
- [x] Add local draft, signature-ready, and signature-status transitions with reference-style status fields.
- [x] Organize generated files into local Draft and For Signing project folders and provide a manual signing checklist.
- [x] Add a controlled regeneration action that resets the local generation state and preserves audit history.

- [x] Superseded by the GitHub-hosted workflow; portable Windows validation remains optional rather than a release requirement.

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
- [x] Superseded by the GitHub-hosted workflow; hosted conversion is the primary release path and Windows Word rendering is optional.

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

- [x] Reduce the consultant-facing form to exactly the requested 15 fields plus approved-template selection and editable automatic title.
- [x] Derive internal project and reference metadata instead of asking consultants for extra inputs.
- [x] Add tests that confirm the exact consultant field list and no extra required inputs.
- [x] Validate the reduced form on the hosted workspace and refresh the no-login local version.
- [x] Confirm the generated PDF completion outcome remains unchanged after the form reduction.
- [x] Superseded by the GitHub-hosted workflow; the portable launcher is optional.
- [x] Superseded by the GitHub-hosted workflow; hosted conversion is the primary release path and Windows Word rendering is optional.
- [x] Superseded by the GitHub-hosted workflow; portable Windows validation remains optional rather than a release requirement.
- [x] Superseded by the GitHub-hosted workflow; portable Windows validation remains optional rather than a release requirement.

Completed verification history remains above; the repeated Windows checks are retained as separate historical checklist entries.

- [x] Add explicit automated assertions that the consultant form exposes only the 15 requested fields plus template selection and editable title.
- [x] Rebuild and smoke-test the no-login local consultant generator after the field reduction, including template selection, review, and PDF-generation request behavior.

- [x] Add a rendered UI test asserting exactly the 15 requested fields, approved template selection, and editable LOA title are visible.
- [x] Smoke-test the rebuilt local app through template selection, review transition, and a local `/api/generate` request using a sample template or controlled fixture.

- [x] Configure DOCX rendering to support the documented double-brace merge tags and re-run the local generation-path smoke test with a valid fixture.
- [x] Preserve compatibility guidance for templates using the approved merge-tag convention.

- [x] Add a test that renders the real consultant form page and asserts only the 15 requested fields, approved-template selector, and editable LOA title are present.
- [x] Exercise the local app workflow through actual template upload/selection, review transition, generation request, and history behavior.
- [x] Document the supported `{{field_name}}` merge-tag convention and approved-template compatibility expectations in the local generator README and UI help.

- [x] Add an end-to-end local-app smoke script covering template upload/selection, review transition, generation attempt, and local history behavior.
- [x] Add in-app merge-tag and approved-template compatibility guidance on the local consultant/template screen.
- [x] Capture evidence that the running local app records the history event after the generation attempt.

- [x] Document and support the GitHub-connected hosted LOA workflow as the primary experience instead of requiring the portable local launcher.
- [x] Add persistent per-template field mappings from DOCX merge tags to the fixed LOA form fields.
- [x] Add mapping management UI for approved templates, including validation and clear unmapped-field warnings.
- [x] Resolve mapped fields during generation and review so different project templates can use different tag names safely.
- [x] Add automated tests and documentation for template mapping, hosted deployment behavior, and mapped PDF generation.
