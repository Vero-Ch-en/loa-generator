# Hosted LOA template mapping

The hosted LOA Generator remains the primary workflow. The project source is versioned in GitHub and the published application stores approved DOCX files and mapping metadata in the hosted database and file storage.

## How mapping works

Each approved template has document tags, such as `{{candidate_name}}` or `{{pay_rate}}`. In **Templates → Map document fields**, an administrator records the document tag and selects the fixed form field that supplies its value. The consultant continues to complete the same 15-field LOA form; the generator copies the selected form value into the template's document tag before DOCX and PDF rendering.

| Template tag example | Maps to fixed form field | Result |
| --- | --- | --- |
| `{{candidate_name}}` | Employee Full Name | The employee name is inserted into `candidate_name`. |
| `{{pay_rate}}` | Salary Amount | The entered salary amount is inserted into `pay_rate`. |
| `{{employment_start}}` | Start Date | The entered start date is inserted into `employment_start`. |
| `{{pay_cycle_text}}` | Payment Date | The selected payment-date value is inserted into `pay_cycle_text`. |

A document tag that has no fixed-form mapping is shown as **unmapped** and remains available as a template-specific field. If that field is marked required, the consultant must complete it before review. This allows project-specific templates to use additional fields without changing the shared consultant form.

## Recommended administrator sequence

Create the project and template, add one document field for every merge tag in the DOCX, and choose a fixed-form mapping wherever the tag represents one of the standard LOA values. Upload the DOCX version only after the tags and mappings are configured, then approve the exact version that consultants may use. Keep each tag contiguous in a Word text run and use straight double braces, for example `{{candidate_name}}`.

## Generation behavior

The consultant form submits the canonical fixed-field values plus any unmapped template-specific values. During generation, the server resolves the stored template mappings and renders the document with both canonical keys and mapped document keys. The approved version, review confirmation, generated DOCX, generated PDF, and mapping-aware audit event remain associated with the LOA record.
