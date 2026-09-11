"use client";

import { useEffect, useState, type CSSProperties } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import { NodeSelection } from "@tiptap/pm/state";
import type { JSONContent } from "@tiptap/core";
import { colors, fontIds, fontNames, fontSizes, fontStacks, httpsUrl, mergeFields, parseEmailDocument, type EmailDocument } from "./document";
import { imagePlaceholder, studioExtensions } from "./extensions";
import "./studio.css";
import MediaLibrary from '../media/MediaLibrary';
import type { BrandingSnapshot } from '../media/model';

export default function VisualEditor({ value, onChange, disabled = false, branding }: { value: EmailDocument; onChange: (value: EmailDocument) => void; disabled?: boolean; branding?:BrandingSnapshot|null }) {
  const [library,setLibrary]=useState<{from:number;to:number}|null|false>(false);
  const [notice, setNotice] = useState("");
  const [linkUrl, setLinkUrl] = useState("https://");
  const [, refresh] = useState(0);
  const editor = useEditor({
    immediatelyRender: false, extensions: studioExtensions(), content: value.document,
    editorProps: {
      attributes: { "aria-label": "Email canvas", role: "textbox", "aria-multiline": "true", spellcheck: "true" },
      handlePaste: (view, event) => {
        event.preventDefault();
        let text = event.clipboardData?.getData("text/plain") ?? "";
        if (!text && event.clipboardData?.getData("text/html")) {
          const document = new DOMParser().parseFromString(event.clipboardData.getData("text/html"), "text/html");
          document.querySelectorAll("script,style,iframe,object,svg,form").forEach(node => node.remove());
          text = document.body.textContent ?? "";
        }
        if (text.length > 20000) { setNotice("Paste is too large. Paste no more than 20,000 characters at once."); return true; }
        view.dispatch(view.state.tr.insertText(text));
        setNotice("Pasted as plain text. Apply supported formatting with the toolbar.");
        return true;
      },
      handleDrop: (_view, event) => { event.preventDefault(); setNotice("Drag-and-drop import is unavailable. Use the block controls."); return true; },
    },
    onUpdate: ({ editor }) => {
      try { onChange(parseEmailDocument({ ...value, document: editor.getJSON() })); setNotice(""); }
      catch { setNotice("This edit exceeds the supported document limits. Undo it before saving or previewing."); onChange({ ...value, document: editor.getJSON() } as EmailDocument); }
    },
    onSelectionUpdate: () => refresh(n => n + 1),
    onTransaction: () => refresh(n => n + 1),
  });
  useEffect(() => { editor?.setEditable(!disabled, false); }, [editor, disabled]);
  if (!editor) return <div className="p-10 text-slate-500">Opening your email canvas…</div>;
  const selected = editor.state.selection instanceof NodeSelection ? editor.state.selection.node : null;
  const applyStyle = (key: string, val: string | number) => editor.chain().focus().setMark("emailStyle", { [key]: val }).run();
  const control = (label: string, action: () => void, active = false) => <button type="button" aria-label={label} aria-pressed={active} onClick={action} className={`studio-tool ${active ? "studio-tool-active" : ""}`}>{label}</button>;
  const insertNode = (node: JSONContent) => {
    const selection = editor.state.selection;
    return selection instanceof NodeSelection
      ? editor.chain().focus().insertContentAt(selection.to, node).run()
      : editor.chain().focus().insertContent(node).run();
  };
  const insert = (type: string, attrs?: Record<string, unknown>) => insertNode({ type, ...(attrs ? { attrs } : {}) });
  const property = (label: string, key: string, type = "text") => <label className="studio-property">{label}<input type={type} value={selected?.attrs[key] ?? ""} onChange={event => editor.commands.updateAttributes(selected!.type.name, { [key]: event.target.value || (key === "href" ? null : "") })} /></label>;
  return <fieldset disabled={disabled} className="studio-editor">
    <div className="studio-toolbar" role="group" aria-label="Email formatting">
      <label className="sr-only" htmlFor="studio-font">Font family</label><select id="studio-font" aria-label="Font family" value={editor.getAttributes("emailStyle").font ?? "arial"} onChange={e => applyStyle("font", e.target.value)}>{fontIds.map(id => <option key={id} value={id}>{fontNames[id]}</option>)}</select>
      <select aria-label="Font size" value={editor.getAttributes("emailStyle").size ?? 16} onChange={e => applyStyle("size", Number(e.target.value))}>{fontSizes.map(size => <option key={size} value={size}>{size}px</option>)}</select>
      <select aria-label="Text color" value={editor.getAttributes("emailStyle").color ?? "#172033"} onChange={e => applyStyle("color", e.target.value)}>{colors.map((color, i) => <option key={color} value={color}>{["Ink", "Slate", "Blue", "Green", "Rose", "Purple"][i]}</option>)}</select>
      {control("Bold", () => editor.chain().focus().toggleBold().run(), editor.isActive("bold"))}
      {control("Italic", () => editor.chain().focus().toggleItalic().run(), editor.isActive("italic"))}
      {control("Underline", () => editor.chain().focus().toggleUnderline().run(), editor.isActive("underline"))}
      <select aria-label="Text block" value={editor.isActive("heading") ? String(editor.getAttributes("heading").level) : "paragraph"} onChange={e => e.target.value === "paragraph" ? editor.chain().focus().setParagraph().run() : editor.chain().focus().setHeading({ level: Number(e.target.value) as 1 | 2 | 3 }).run()}><option value="paragraph">Paragraph</option><option value="1">Heading 1</option><option value="2">Heading 2</option><option value="3">Heading 3</option></select>
      {(["left", "center", "right"] as const).map(align => <span key={align}>{control(`Align ${align}`, () => editor.chain().focus().setTextAlign(align).run(), editor.isActive({ textAlign: align }))}</span>)}
      {control("Bulleted list", () => editor.chain().focus().toggleBulletList().run(), editor.isActive("bulletList"))}
      {control("Numbered list", () => editor.chain().focus().toggleOrderedList().run(), editor.isActive("orderedList"))}
      {control("Undo", () => editor.chain().focus().undo().run())}{control("Redo", () => editor.chain().focus().redo().run())}
    </div>
    <div className="studio-insert" role="group" aria-label="Insert email content">
      <select aria-label="Insert merge field" value="" onChange={e => { if (e.target.value) insert("mergeField", { field: e.target.value }); }}><option value="">Personalize…</option>{mergeFields.map(field => <option key={field}>{field}</option>)}</select>
      {control("Add button", () => insert("button", { label: "Explore opportunities", href: "https://example.com", alignment: "left" }))}
      {control("Add divider", () => insert("divider"))}{control("Add spacer", () => insert("spacer", { height: 24 }))}
      {control("Add signature", () => insert("signature",branding?{name:branding.name,title:branding.title,company:branding.company,email:branding.email,phone:branding.phone}:undefined))}
      {branding?.logo&&control("Insert company logo",()=>insert("emailImage",{assetId:branding.logo,alt:`${branding.company} logo`,alignment:'left',width:140,href:null}))}
      {branding?.headshot&&control("Insert headshot",()=>insert("emailImage",{assetId:branding.headshot,alt:branding.name,alignment:'left',width:120,href:null}))}
      {control("Image placeholder", () => insertNode(imagePlaceholder()))}
      {control("Image + text", () => insertNode({ type: "imageText", content: [imagePlaceholder(), { type: "emailColumn", content: [{ type: "paragraph", attrs: { textAlign: "left" }, content: [{ type: "text", text: "Tell the story behind this image." }] }] }] }))}
      {control("Media library",()=>setLibrary(null))}
    </div>
    <div className="studio-links"><label className="min-w-0 flex-1 text-xs font-bold">HTTPS link<input aria-label="HTTPS link" value={linkUrl} onChange={e => setLinkUrl(e.target.value)} placeholder="https://" className="mt-1 w-full rounded-lg border p-2 font-normal" /></label>{control("Apply link", () => { if (!httpsUrl.safeParse(linkUrl).success) { setNotice("Enter a valid HTTPS link."); return; } editor.chain().focus().setMark("link", { href: linkUrl }).run(); setNotice(""); })}{control("Remove link", () => editor.chain().focus().unsetMark("link").run())}</div>
    {selected && ["button", "signature", "emailImage", "spacer"].includes(selected.type.name) && <div className="studio-properties" aria-label="Selected block properties">
      <p className="w-full text-xs font-black uppercase text-teal-700">Selected {selected.type.name === "emailImage" ? "image placeholder" : selected.type.name}</p>
      {selected.type.name === "button" && <>{property("Button label", "label")}{property("Button destination", "href")}</>}
      {selected.type.name === "signature" && <>{property("Signature name", "name")}{property("Signature title", "title")}{property("Signature company", "company")}{property("Signature email", "email")}{property("Signature phone", "phone")}</>}
      {selected.type.name === "emailImage" && <>{property("Alt text", "alt")}<label className="studio-property">Image width<input aria-label="Image width" type="number" min="80" max="600" value={selected.attrs.width} onChange={e => editor.commands.updateAttributes("emailImage", { width: Number(e.target.value) })} /></label>{property("Image destination", "href")}<p className="text-xs text-slate-500">Asset: {selected.attrs.assetId ?? "Not connected"}</p>{control("Replace image",()=>setLibrary({from:editor.state.selection.from,to:editor.state.selection.to}))}</>}
      {["button", "emailImage"].includes(selected.type.name) && <label className="studio-property">Block alignment<select aria-label="Block alignment" value={selected.attrs.alignment} onChange={e => editor.commands.updateAttributes(selected.type.name, { alignment: e.target.value })}>{["left", "center", "right"].map(a => <option key={a}>{a}</option>)}</select></label>}
      {selected.type.name === "spacer" && <label className="studio-property">Spacer height<select aria-label="Spacer height" value={selected.attrs.height} onChange={e => editor.commands.updateAttributes("spacer", { height: Number(e.target.value) })}>{[8, 16, 24, 32, 48].map(n => <option key={n} value={n}>{n}px</option>)}</select></label>}
      {control("Remove block", () => editor.chain().focus().deleteSelection().run())}
    </div>}
    {library!==false&&<MediaLibrary onClose={()=>setLibrary(false)} onSelect={asset=>{const node={type:'emailImage',attrs:{assetId:asset.public_id,alt:asset.default_alt,alignment:'center',width:Math.min(536,Math.max(80,asset.width)),href:null}};if(library)editor.chain().focus().insertContentAt(library,node).run();else insertNode(node);setLibrary(false);}}/>}
    {notice && <p role="status" className="border-b bg-amber-50 p-3 text-sm text-amber-900">{notice}</p>}
    <div className="studio-canvas-surround"><div className="studio-canvas" style={{ fontFamily: fontStacks[value.theme.fontFamily],color:value.theme.textColor,"--studio-accent":value.theme.accentColor } as CSSProperties}><EditorContent editor={editor} /><div className="studio-compliance">Sender identity · Postal address · Unsubscribe<br /><span>Protected footer added in email preview</span></div></div></div>
  </fieldset>;
}
