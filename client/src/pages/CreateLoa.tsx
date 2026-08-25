import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import { AUTHORISED_USER_LOA_FIELDS, missingRequiredAuthorisedUserFields } from "@shared/authorisedUserLoaFields";
import { buildAuthorisedUserReviewRows } from "@shared/loaReview";
import { buildDefaultLoaTitle, resolveLoaTitle } from "../../../shared/loaTitle";
import { AlertCircle, ArrowLeft, CheckCircle2, FileText, Loader2, UserRoundCheck } from "lucide-react";
import { FormEvent, useMemo, useState } from "react";
import { useLocation } from "wouter";

export default function CreateLoa() {
  const [, setLocation] = useLocation();
  const utils = trpc.useUtils();
  const { data, isLoading } = trpc.workspace.overview.useQuery();
  const [versionId, setVersionId] = useState("");
  const [title, setTitle] = useState("");
  const [titleManuallyEdited, setTitleManuallyEdited] = useState(false);
  const [referenceNumber, setReferenceNumber] = useState("");
  const [values, setValues] = useState<Record<string, string>>({});
  const [reviewId, setReviewId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const createDraft = trpc.loas.createDraft.useMutation();
  const confirmReview = trpc.loas.confirmReview.useMutation();
  const generate = trpc.loas.generate.useMutation();
  const approved = useMemo(() => (data?.templateVersions ?? []).filter(version => version.status === "approved"), [data]);
  const selectedVersion = approved.find(version => version.id === versionId);
  const selectedTemplate = data?.templates.find(template => template.id === selectedVersion?.templateId);
  const selectedProject = data?.projects.find(project => project.id === selectedTemplate?.projectId);
  const configuredFields = (data?.templateFields ?? []).filter(field => field.templateId === selectedTemplate?.id);
  const standardKeySet = useMemo(() => new Set(AUTHORISED_USER_LOA_FIELDS.map(field => field.key)), []);
  const templateSpecificFields = configuredFields.filter(field => !standardKeySet.has(field.fieldKey));
  const isPending = createDraft.isPending || confirmReview.isPending || generate.isPending;
  const defaultTitle = useMemo(() => buildDefaultLoaTitle(values.employee_full_name || ""), [values.employee_full_name]);

  function updateAuthorisedUserValue(key: string, value: string) {
    setValues(current => ({ ...current, [key]: value }));
    if (key === "employee_full_name") {
      setTitle(current => resolveLoaTitle({ currentTitle: current, wasManuallyEdited: titleManuallyEdited, employeeFullName: value }));
    }
  }

  async function startReview(event: FormEvent) {
    event.preventDefault(); setError("");
    if (!selectedVersion || !selectedProject) return setError("Select an approved template version.");
    const missingAuthorised = missingRequiredAuthorisedUserFields(values);
    const missingTemplateFields = templateSpecificFields.filter(field => field.isRequired && !values[field.fieldKey]?.trim());
    if (!title.trim() || !referenceNumber.trim() || missingAuthorised.length || missingTemplateFields.length) {
      const missing = [...missingAuthorised, ...missingTemplateFields.map(field => field.label)];
      return setError(`Complete the LOA title, reference number, and required fields: ${missing.join(", ")}.`);
    }
    try { const result = await createDraft.mutateAsync({ projectId: selectedProject.id, templateVersionId: selectedVersion.id, title, referenceNumber, fieldData: values }); setReviewId(result.id); } catch (cause) { setError(cause instanceof Error ? cause.message : "The review could not be created."); }
  }
  async function generateDocuments() { if (!reviewId) return; setError(""); try { await confirmReview.mutateAsync({ id: reviewId }); await generate.mutateAsync({ id: reviewId }); await utils.workspace.overview.invalidate(); setLocation("/history"); } catch (cause) { setError(cause instanceof Error ? cause.message : "Document generation did not complete."); } }
  const reviewFields = [...buildAuthorisedUserReviewRows(values), ...templateSpecificFields.map(field => ({ label: field.label, value: values[field.fieldKey] || "—" }))];

  return <DashboardLayout><section className="mx-auto max-w-5xl"><button onClick={() => setLocation("/")} className="mb-6 inline-flex items-center text-sm font-semibold text-[#426a59] hover:text-[#193d37]"><ArrowLeft className="mr-2 h-4 w-4" />Workspace</button><div className="rounded-2xl border border-[#e0e6df] bg-white shadow-[0_12px_40px_rgba(25,61,55,0.05)]"><header className="border-b border-[#edf0ec] px-6 py-7 sm:px-9"><p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#5f7f68]">Controlled generation</p><h1 className="mt-2 font-serif text-3xl font-semibold tracking-tight text-[#193d37]">Create a Letter of Authorization</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-[#6e7b73]">The authorised user completes the employment and consultant details, then confirms the review before the approved template can generate documents.</p></header>{isLoading ? <div className="p-10 text-sm text-[#748078]">Loading approved templates…</div> : approved.length === 0 ? <div className="p-10 text-center"><AlertCircle className="mx-auto h-7 w-7 text-[#ae8725]" /><p className="mt-3 font-medium text-[#31453c]">No approved templates are available.</p><Button variant="outline" onClick={() => setLocation("/templates")} className="mt-4">Configure templates</Button></div> : reviewId ? <ReviewCard title={title} referenceNumber={referenceNumber} project={selectedProject?.name || ""} template={`${selectedTemplate?.name || ""} · ${selectedVersion?.version || ""}`} fields={reviewFields} busy={isPending} error={error} onBack={() => setReviewId(null)} onGenerate={generateDocuments} /> : <form onSubmit={startReview} className="space-y-8 px-6 py-7 sm:px-9"><div className="grid gap-5 md:grid-cols-2"><FormField label="Approved template version"><select value={versionId} onChange={event => { setVersionId(event.target.value); setValues({}); setTitle(""); setTitleManuallyEdited(false); }} className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm shadow-sm outline-none focus:border-[#64806e] focus:ring-2 focus:ring-[#dce9df]" required><option value="">Select an approved version</option>{approved.map(version => { const template = data?.templates.find(item => item.id === version.templateId); const project = data?.projects.find(item => item.id === template?.projectId); return <option key={version.id} value={version.id}>{project?.code} · {template?.name} · v{version.version}</option>; })}</select></FormField><FormField label="LOA title"><Input value={title || defaultTitle} onChange={event => { setTitle(event.target.value); setTitleManuallyEdited(true); }} placeholder="Employee_Employment Contract_Date_Time" required /><div className="flex items-center justify-between gap-3"><p className="text-xs text-[#6d7d73]">Default: <code className="rounded bg-[#edf3ee] px-1.5 py-0.5 text-[#315743]">{defaultTitle}</code></p><button type="button" onClick={() => { setTitle(defaultTitle); setTitleManuallyEdited(false); }} className="shrink-0 text-xs font-semibold text-[#2f6a55] hover:text-[#193d37]">Use default</button></div></FormField><FormField label="Reference number"><Input value={referenceNumber} onChange={event => setReferenceNumber(event.target.value)} placeholder="e.g. LOA-2026-001" required /></FormField></div>{selectedVersion ? <><section className="rounded-xl border border-[#e2e8e2] bg-[#fafcf9] p-5"><SectionHeading icon={UserRoundCheck} title="Authorised-user details" detail="Complete the employee, employment, payment, and consultant information required for this LOA." /><div className="grid gap-5 md:grid-cols-2">{AUTHORISED_USER_LOA_FIELDS.map(field => <AuthorisedField key={field.key} field={field} value={values[field.key] || ""} onChange={value => updateAuthorisedUserValue(field.key, value)} />)}</div></section>{templateSpecificFields.length ? <section className="rounded-xl border border-[#e2e8e2] bg-[#fafcf9] p-5"><SectionHeading icon={FileText} title="Template-specific details" detail="These values are unique to the selected approved template." /><div className="grid gap-5 md:grid-cols-2">{templateSpecificFields.map(field => <FormField key={field.id} label={`${field.label}${field.isRequired ? " *" : ""}`}><Input value={values[field.fieldKey] || ""} onChange={event => setValues(current => ({ ...current, [field.fieldKey]: event.target.value }))} required={field.isRequired} placeholder={`{{${field.fieldKey}}}`} /></FormField>)}</div></section> : null}</> : null}{error ? <p className="rounded-lg bg-[#fdf0ee] px-4 py-3 text-sm text-[#9b4037]">{error}</p> : null}<div className="flex justify-end border-t border-[#edf0ec] pt-6"><Button type="submit" disabled={isPending || !selectedVersion} className="bg-[#193d37] hover:bg-[#0f2c27]">Review before generating</Button></div></form>}</div></section></DashboardLayout>;
}

function FormField({ label, children }: { label: string; children: React.ReactNode }) { return <label className="grid gap-2"><Label className="text-sm font-medium text-[#3a4d44]">{label}</Label>{children}</label>; }
function SectionHeading({ icon: Icon, title, detail }: { icon: typeof FileText; title: string; detail: string }) { return <div className="mb-5 flex items-center gap-3"><span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#e8f2e9] text-[#2f6a55]"><Icon className="h-4 w-4" /></span><div><p className="font-medium text-[#233a33]">{title}</p><p className="text-xs text-[#7a857e]">{detail}</p></div></div>; }
function AuthorisedField({ field, value, onChange }: { field: typeof AUTHORISED_USER_LOA_FIELDS[number]; value: string; onChange: (value: string) => void }) { const label = `${field.label}${field.required ? " *" : ""}`; if (field.inputType === "select") return <FormField label={label}><select value={value} onChange={event => onChange(event.target.value)} required={field.required} className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm shadow-sm outline-none focus:border-[#64806e] focus:ring-2 focus:ring-[#dce9df]"><option value="">Select salary type</option>{field.options?.map(option => <option key={option} value={option}>{option}</option>)}</select></FormField>; if (field.inputType === "textarea") return <FormField label={label}><textarea value={value} onChange={event => onChange(event.target.value)} placeholder="Optional notes for the LOA" rows={3} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm outline-none focus:border-[#64806e] focus:ring-2 focus:ring-[#dce9df]" /></FormField>; return <FormField label={label}><Input type={field.inputType} value={value} onChange={event => onChange(event.target.value)} required={field.required} placeholder={field.key} /></FormField>; }
function ReviewCard({ title, referenceNumber, project, template, fields, busy, error, onBack, onGenerate }: { title: string; referenceNumber: string; project: string; template: string; fields: { label: string; value: string }[]; busy: boolean; error: string; onBack: () => void; onGenerate: () => void }) { return <div className="px-6 py-8 sm:px-9"><div className="flex items-start gap-4 rounded-xl bg-[#eaf4ec] p-5"><CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[#317451]" /><div><h2 className="font-serif text-xl font-semibold text-[#193d37]">Review before generation</h2><p className="mt-1 text-sm leading-6 text-[#517060]">Confirm the authorised-user and template details below. Generation will use only the selected approved template version.</p></div></div><div className="mt-7 grid divide-y divide-[#edf0ec] rounded-xl border border-[#e2e8e2] px-5"><ReviewRow label="Project" value={project} /><ReviewRow label="Template" value={template} /><ReviewRow label="LOA title" value={title} /><ReviewRow label="Reference number" value={referenceNumber} />{fields.map(field => <ReviewRow key={field.label} label={field.label} value={field.value} />)}</div>{error ? <p className="mt-5 rounded-lg bg-[#fdf0ee] px-4 py-3 text-sm text-[#9b4037]">{error}</p> : null}<div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end"><Button variant="outline" onClick={onBack} disabled={busy}>Return to form</Button><Button onClick={onGenerate} disabled={busy} className="bg-[#193d37] hover:bg-[#0f2c27]">{busy ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Generating documents…</> : "Confirm and generate DOCX + PDF"}</Button></div></div>; }
function ReviewRow({ label, value }: { label: string; value: string }) { return <div className="grid gap-1 py-3 sm:grid-cols-[11rem_1fr] sm:gap-4"><span className="text-xs font-semibold uppercase tracking-[0.1em] text-[#829087]">{label}</span><span className="text-sm text-[#32463d]">{value}</span></div>; }
