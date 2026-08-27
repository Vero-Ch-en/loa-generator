# Local LOA Generator for Windows

This is a **no-login local browser application** for consultants. It runs on a Windows computer, uses local approved DOCX templates, and generates a signing-ready PDF through the installed Microsoft Word application.

## First use

1. Keep `Local-LOA-Generator.exe`, the `public` folder, and `Start-LOA-Generator.bat` together in the same folder.
2. Double-click `Start-LOA-Generator.bat`. The application opens only on that computer at `http://127.0.0.1:8787`.
3. In **Template library**, upload an approved `.docx` LOA template. You can also add templates directly to the `templates` folder.
4. In **Create LOA**, select the approved template, complete the consultant form, confirm the details, and generate the signing-ready PDF.
5. The PDF is saved under `output/<project-code>/PDF`. Upload it to OpenSign when ready.

## Local folders

| Folder | Purpose |
| --- | --- |
| `templates` | Approved DOCX templates consultants can select. |
| `output` | Generated signing-ready PDFs. |
| `data` | Local settings and generation history. |

The **Folders** screen can point templates or outputs to another local folder, including a SharePoint-synced folder. No user login, hosted account, or cloud database is used by this local application.
