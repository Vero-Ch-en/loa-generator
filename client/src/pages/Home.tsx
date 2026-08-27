import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { ArrowRight, CheckCircle2, Clock3, FileText, FolderCog, ShieldCheck } from "lucide-react";
import { useLocation } from "wouter";

const statusLabel: Record<string, string> = { in_review: "In review", generated: "Generated", handoff_ready: "Handoff ready", sent_to_sharepoint: "In SharePoint", failed: "Attention needed", draft: "Draft" };

export default function Home() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { data, isLoading } = trpc.workspace.overview.useQuery();
  const records = data?.records ?? [];
  const approved = (data?.templateVersions ?? []).filter(version => version.status === "approved");
  const active = records.filter(record => ["in_review", "generated", "handoff_ready"].includes(record.status));

  const isAdmin = user?.role === "admin";
  return <DashboardLayout><section className="mx-auto max-w-5xl"><div className="rounded-3xl border border-[#e0e6df] bg-white p-7 shadow-[0_16px_46px_rgba(25,61,55,0.06)] sm:p-10"><p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#5f7f68]">LOA generator</p><h1 className="mt-3 max-w-2xl font-serif text-4xl tracking-tight text-[#193d37] sm:text-5xl">Create a signing-ready LOA in three clear steps.</h1><p className="mt-4 max-w-xl text-sm leading-6 text-[#63716a]">Choose an approved template, complete the form, and review the information before the PDF is generated.</p><div className="mt-8 grid gap-3 sm:grid-cols-3"><Step number="1" title="Choose template" detail="Select the appropriate approved LOA." /><Step number="2" title="Complete details" detail="Enter employee and consultant information." /><Step number="3" title="Review & generate" detail="Download the signing-ready PDF." /></div><Button onClick={() => setLocation("/create")} className="mt-8 h-11 bg-[#193d37] px-5 hover:bg-[#0f2c27]"><FileText className="mr-2 h-4 w-4" />Start an LOA</Button></div>{!isLoading && approved.length === 0 ? <div className="mt-6 rounded-2xl border border-[#d9e2db] bg-[#edf5ee] p-6"><p className="font-serif text-xl font-semibold text-[#193d37]">No approved templates are available yet.</p><p className="mt-1 text-sm text-[#567060]">{isAdmin ? "Upload and approve a DOCX template before consultants begin creating LOAs." : "Please contact an administrator to upload and approve the appropriate LOA template."}</p>{isAdmin ? <Button variant="outline" onClick={() => setLocation("/templates")} className="mt-4 border-[#8aa391] bg-white text-[#193d37] hover:bg-[#f7fbf7]">Manage templates <ArrowRight className="ml-2 h-4 w-4" /></Button> : null}</div> : null}{isAdmin ? <div className="mt-6 grid gap-4 sm:grid-cols-3"><Metric icon={FolderCog} label="Approved templates" value={isLoading ? "—" : String(approved.length)} detail="Available to consultants" /><Metric icon={Clock3} label="Active LOAs" value={isLoading ? "—" : String(active.length)} detail="Awaiting completion" /><Metric icon={ShieldCheck} label="PDF records" value={isLoading ? "—" : String(records.filter(r => r.generatedPdfUrl).length)} detail="Visible in administration" /></div> : null}</section></DashboardLayout>;
}

function Step({ number, title, detail }: { number: string; title: string; detail: string }) { return <div className="rounded-2xl bg-[#f4f7f2] p-4"><span className="text-xs font-bold text-[#356e56]">{number}</span><p className="mt-2 font-medium text-[#233a33]">{title}</p><p className="mt-1 text-xs leading-5 text-[#718077]">{detail}</p></div>; }
function Metric({ icon: Icon, label, value, detail }: { icon: typeof FileText; label: string; value: string; detail: string }) { return <div className="rounded-2xl border border-[#e0e6df] bg-white p-5"><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#edf5ee] text-[#2f6a55]"><Icon className="h-4 w-4" /></span><p className="mt-5 text-xs font-semibold uppercase tracking-[0.12em] text-[#809087]">{label}</p><p className="mt-1 font-serif text-3xl text-[#193d37]">{value}</p><p className="mt-1 text-xs text-[#7a857e]">{detail}</p></div>; }
export function StatusPill({ status }: { status: string }) { const palette: Record<string, string> = { generated: "bg-[#eaf4ec] text-[#256345]", handoff_ready: "bg-[#eaf0f8] text-[#355b7d]", in_review: "bg-[#fbf3dd] text-[#806116]", failed: "bg-[#fae9e7] text-[#9b4037]" }; return <span className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold ${palette[status] || "bg-stone-100 text-stone-600"}`}>{statusLabel[status] || status}</span>; }
