# Local LOA Generator for Windows

This is a **local browser application**. It does not need a desktop installer and does not send templates or generated documents to a website. It runs from the folder where it is saved and opens at `http://127.0.0.1:8787` on the same Windows computer. If that port is already in use, set the optional Windows environment variable `LOCAL_LOA_PORT` before launching.

## First use

The supplied **portable Windows build** does not require Node.js or a desktop installer. In the `dist` folder, double-click `Start-LOA-Generator.bat`; it starts `Local-LOA-Generator.exe` locally and opens the tool in your browser. The `.exe`, `public` folder, batch launcher, and `README.md` must remain together.

For development only, you can install the current **Node.js LTS** release from [nodejs.org](https://nodejs.org/) and run `Start-LOA-Generator.ps1` from the source folder.

The tool creates these local folders beside itself:

| Folder | Purpose |
| --- | --- |
| `templates` | Store approved `.docx` LOA templates only. |
| `output` | Stores generated DOCX and PDF pairs, grouped by project code. This can be changed to a SharePoint-synced folder from **Folders**. |
| `data` | Stores local settings and an auditable generation history. |

## Preparing templates

Use merge tags in the approved Word template, for example `{appointee_name}`, `{effective_date}`, or `{appointment_scope}`. The generator detects the tags and presents the required input fields after you select that template. It also provides `project_code`, `reference_number`, `loa_title`, and `generated_date` automatically.

## PDF fidelity

The generator uses the locally installed **Microsoft Word** application to render the finished DOCX into PDF. This ensures the conversion takes place in the same Office environment used to approve the template and is intended to preserve layout more faithfully than a generic converter.

## SharePoint handoff

For a local SharePoint workflow, use **Folders** and select a SharePoint-synced directory such as `C:\Users\YourName\Company\Shared Documents\LOAs`. Each completed DOCX/PDF pair will appear there for your existing signing process.
