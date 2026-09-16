"use client";
import ComposerWorkspace from "./ComposerWorkspace";
import StudioDeliveryPanel from '../delivery/StudioDeliveryPanel';
import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { AudiencePreview, Campaign, MarketingOptions } from "../models/Marketing";
import { previewAudienceAction, previewStudioResultAction, saveStudioDraftAction, duplicateCampaignAction } from "../actions/marketing-actions";
import { AudienceStats } from "../components/AudienceStats";
import { emptyEmailDocument, parseEmailDocument } from "./document";
import BrandingPanel from '../media/BrandingPanel';
import type {BrandingSnapshot} from '../media/model';
import VisualEditor from "./VisualEditor";
import { studioErrorMessage } from "./errors";

export default function MarketingStudio({ campaign, options, initialAudience }: { campaign?: Campaign; options: MarketingOptions; initialAudience?: { type: "segment" | "list"; id: string } }) {
  const [branding,setBranding]=useState<BrandingSnapshot|null|undefined>(campaign?.brandingSnapshot),[refreshBranding,setRefreshBranding]=useState(false);
  const router = useRouter(), [pending, start] = useTransition();
  const [document, setDocument] = useState(() => campaign?.content.version === 2 ? campaign.content : emptyEmailDocument());
  const [form, setForm] = useState({ name: campaign?.name ?? "", description: campaign?.description ?? "", subject: campaign?.subject ?? "", previewText: campaign?.previewText ?? "", senderName: campaign?.senderName ?? "", replyTo: campaign?.replyTo ?? "", audienceType: campaign?.audienceType ?? initialAudience?.type ?? "segment", audienceId: campaign?.audienceId ?? initialAudience?.id ?? "" });
  const [error, setError] = useState(""), [dirty, setDirty] = useState(false), dirtyRef = useRef(false);
  const [preview, setPreview] = useState<{ html: string; text: string; subject: string }>(), [previewStale, setPreviewStale] = useState(false), [mobile, setMobile] = useState(false), [audience, setAudience] = useState<AudiencePreview>();
  const [previewing, setPreviewing] = useState(false);
  const changed = () => { dirtyRef.current = true; setDirty(true); setPreviewStale(true); };
  useEffect(() => {
    const unload = (event: BeforeUnloadEvent) => { if (dirtyRef.current) { event.preventDefault(); event.returnValue = ""; } };
    const navigation = (event: MouseEvent) => { if (!(event.target instanceof Element)) return; const link = event.target.closest("a[href]"); if (link && dirtyRef.current && !window.confirm("Leave this campaign and discard unsaved changes?")) { event.preventDefault(); event.stopPropagation(); } };
    window.addEventListener("beforeunload", unload); window.document.addEventListener("click", navigation, true);
    return () => { window.removeEventListener("beforeunload", unload); window.document.removeEventListener("click", navigation, true); };
  }, []);
  const update = (key: keyof typeof form, value: string) => { setForm(old => ({ ...old, [key]: value })); changed(); };
  const run = (action: () => Promise<void>) => start(async () => { try { setError(""); await action(); } catch (e) { setError(studioErrorMessage(e)); } });
  const save = () => run(async () => { const content = parseEmailDocument(document); const result = await saveStudioDraftAction({ ...form, id: campaign?.id ?? "", content, refreshBranding, status: "draft", expectedUpdatedAt: campaign?.updatedAt }); if (!result.ok) { setError(result.error); return; } dirtyRef.current = false; setDirty(false); router.push(`/crm/campaigns/${result.id}`); router.refresh(); });
  const showPreview = () => run(async () => { const result = await previewStudioResultAction(parseEmailDocument(document), form.subject, form.previewText, form.senderName,campaign?.id,refreshBranding); if (!result.ok) { setError(result.error); return; } setPreview(result.preview); setPreviewStale(false); setPreviewing(true); });
  const field = (label: string, key: keyof typeof form, type = "text") => <label className="grid min-w-0 gap-1.5 text-sm font-bold text-slate-700">{label}<input aria-label={label} disabled={pending} type={type} value={form[key]} onChange={e => update(key, e.target.value)} className="min-w-0 rounded-xl border border-slate-300 bg-white px-3 py-2.5 font-normal outline-blue-600" /></label>;
  const controls = <><details open className="composer-disclosure"><summary>Campaign details &amp; audience</summary>    <div className="rounded-2xl border bg-white p-4 sm:p-6"><div className="grid gap-4">{field("Campaign name", "name")}{field("Internal notes", "description")}{field("Subject line", "subject")}{field("Preheader", "previewText")}{field("Sender display name", "senderName")}{field("Reply-to address", "replyTo", "email")}</div><fieldset className="mt-5"><legend className="text-sm font-bold">Audience</legend><div className="mt-2 flex flex-wrap gap-2"><select disabled={pending} aria-label="Audience type" value={form.audienceType} onChange={e => { setForm(old => ({ ...old, audienceType: e.target.value as "segment" | "list", audienceId: "" })); setAudience(undefined); changed(); }} className="rounded-xl border p-2"><option value="segment">Dynamic Segment</option><option value="list">Static List</option></select><select disabled={pending} aria-label="Campaign audience" value={form.audienceId} onChange={e => { update("audienceId", e.target.value); setAudience(undefined); }} className="min-w-0 flex-1 rounded-xl border p-2"><option value="">Choose audience…</option>{(form.audienceType === "segment" ? options.segments : options.lists).map(item => <option key={item.id} value={item.id}>{item.name}</option>)}</select><button disabled={pending || !form.audienceId} onClick={() => run(async () => { setAudience(await previewAudienceAction(form.audienceType as "segment" | "list", form.audienceId)); })} className="rounded-xl border px-3 py-2 text-sm font-bold">Refresh counts</button></div></fieldset>{audience && <div className="mt-4"><AudienceStats value={audience} /></div>}</div>
</details>    <BrandingPanel snapshot={branding} onInitial={b=>{if(!branding)setBranding(b);}} onRefresh={b=>{setBranding(b);setRefreshBranding(true);setDocument(old=>({...old,theme:{...old.theme,fontFamily:b.font,textColor:b.primaryColor,accentColor:b.accentColor}}));changed();}} />

    {campaign && <button disabled={pending || dirty} onClick={() => run(async () => { const id = await duplicateCampaignAction(campaign.id); router.push(`/crm/campaigns/${id}`); })} className="studio-tool">Duplicate</button>}
  </>;
  const renderedPreview = preview && <section className="min-w-0 rounded-2xl border bg-slate-100 p-3 sm:p-5" aria-label="Rendered email preview"><div className="mb-4 flex flex-wrap items-center justify-between gap-3"><div><h3 className="font-black">Email preview</h3><p className="text-xs text-slate-600">Sample recipient: Jordan · Links disabled · Email clients may vary</p></div><div className="flex gap-2"><button aria-pressed={!mobile} onClick={() => setMobile(false)} className="rounded-lg border bg-white px-3 py-2 text-sm font-bold">Desktop preview</button><button aria-pressed={mobile} onClick={() => setMobile(true)} className="rounded-lg border bg-white px-3 py-2 text-sm font-bold">Mobile preview</button></div></div>{previewStale && <p role="status" className="mb-3 text-sm font-bold text-amber-800">Content changed. Select Preview email to refresh.</p>}<p className="mb-3 text-sm font-bold">Subject: {preview.subject || "Not set"}</p><iframe title="Email preview" sandbox="" referrerPolicy="no-referrer" srcDoc={preview.html} className="mx-auto block h-[700px] w-full rounded-xl border bg-white" style={{ maxWidth: mobile ? 390 : 680 }} /><details className="mt-4"><summary className="cursor-pointer text-sm font-bold">Plain-text alternative</summary><pre className="mt-3 whitespace-pre-wrap break-words rounded-xl bg-white p-4 text-sm">{preview.text}</pre></details></section>;
  return <ComposerWorkspace name={form.name} status={pending ? "Working..." : dirty ? "Unsaved changes" : campaign ? "Draft saved" : "New draft"} actions={<>
    <button disabled={pending} onClick={save} className="composer-save">Save Draft</button>
    <button disabled={pending} onClick={showPreview} className="studio-tool">Preview email</button>
    {campaign ? <div className="composer-delivery"><StudioDeliveryPanel campaignId={campaign.id} revision={campaign.updatedAt} dirty={dirty || pending} /></div> : <span className="composer-save-hint">Save Draft to enable test email and audience review.</span>}
  </>}>
    {error && <p role="alert" className="border border-red-200 bg-red-50 p-3 text-sm text-red-800">{error}</p>}
    <VisualEditor branding={branding} disabled={pending} value={document} onChange={value => { setDocument(value); changed(); }} controls={controls} preview={renderedPreview} previewing={previewing} onEdit={() => setPreviewing(false)} />
  </ComposerWorkspace>;
}
