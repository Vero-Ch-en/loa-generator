# Local LOA Generator for Windows

This is a **no-login local browser application** for consultants. It runs on a Windows computer, uses local approved DOCX templates, and generates a signing-ready PDF through the installed Microsoft Word application.

## First use

1. Keep `Local-LOA-Generator.exe`, the `public` folder, and `Start-LOA-Generator.bat` together in the same folder.
2. Double-click `Start-LOA-Generator.bat`. The application opens only on that computer at `http://127.0.0.1:8787`.
3. In **Template library**, upload an approved `.docx` LOA template. You can also add templates directly to the `templates` folder.
4. In **Create LOA**, select the approved template, complete the consultant form, confirm the details, and generate the signing-ready PDF.
5. The PDF is saved under `output/<project-code>/PDF`. Upload it to OpenSign when ready.

## Approved template compatibility

Use double-brace merge tags in approved DOCX templates, for example `{{employee_full_name}}`, `{{salary_amount}}`, or `{{payment_date}}`. The text inside the braces must match the template field key configured in the template library. Keep tags in ordinary text runs where possible; complex tags split across multiple Word runs may need to be retyped as one contiguous tag. The local renderer preserves the approved DOCX layout as closely as Microsoft Word permits during PDF export.

## Local folders

| Folder | Purpose |
| --- | --- |
| `templates` | Approved DOCX templates consultants can select. |
| `output` | Generated signing-ready PDFs. |
| `data` | Local settings and generation history. |

The **Folders** screen can point templates or outputs to another local folder, including a SharePoint-synced folder. No user login, hosted account, or cloud database is used by this local application.

## Windows acceptance check

The portable archive should contain `Local-LOA-Generator.exe`, `Start-LOA-Generator.bat`, `public`, and this README in one folder. On the target Windows computer, start the batch file, confirm the browser opens at `http://127.0.0.1:8787`, upload or place a DOCX in `templates`, and confirm it appears in **Template library**. Complete one LOA, use **Review details**, confirm the values, and generate the PDF. Verify that the PDF is created under `output/<project-code>/PDF`, that a matching entry appears under **Generated PDFs**, and that the PDF opens with the original Word layout. Finally, upload the PDF to OpenSign and follow the consultant-first, candidate-second signing order.

The Linux development sandbox has verified archive integrity, fixture upload, template discovery, merge-tag rendering, review-confirmed generation routing, PDF output through an opt-in LibreOffice smoke converter, and local history recording. It cannot execute the Windows executable or Microsoft Word COM automation. The Microsoft Word rendering and portable-launcher checks must therefore be completed on a Windows computer with Word installed, using the acceptance sequence above.
