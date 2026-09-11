// Pure, deterministic server renderer. Browser editing never supplies HTML.
import { z } from "zod";
import { fontStacks, httpsUrl, parseEmailDocument, type EmailBlock, type Inline } from "./document.ts";

const escape = (value: string) => value.replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
const contextSchema = z.object({
  subject: z.string().max(180), preheader: z.string().max(220),
  personalization: z.object({ first_name: z.string().max(120), preferred_name: z.string().max(120), consultant_name: z.string().max(120) }).strict(),
  compliance: z.object({ sender: z.string().min(1).max(200), postalAddress: z.string().min(1).max(500), unsubscribeUrl: httpsUrl }).strict(),
  preview: z.boolean(),
}).strict();
export type RenderContext = z.infer<typeof contextSchema>;
export function renderStudioEmail(value: unknown, context: RenderContext) {
  const email = parseEmailDocument(value), ctx = contextSchema.parse(context);
  const vars = { ...ctx.personalization, preferred_name: ctx.personalization.preferred_name || ctx.personalization.first_name };
  const personalize = (s: string) => s.replace(/{{\s*(first_name|preferred_name|consultant_name)\s*}}/g, (_, key: keyof typeof vars) => vars[key]);
  const inlineText = (nodes: Inline[] = []) => nodes.map(n => n.type === "hardBreak" ? "\n" : n.type === "mergeField" ? vars[n.attrs.field] : n.text).join("");
  const link = (url: string, content: string, style = "") => ctx.preview ? `<span style="${style};text-decoration:underline">${content}</span>` : `<a href="${escape(url)}" style="${style}">${content}</a>`;
  const inlineHtml = (nodes: Inline[] = []): string => nodes.map(n => {
    if (n.type === "hardBreak") return "<br>";
    let html = escape(n.type === "mergeField" ? vars[n.attrs.field] : n.text);
    for (const m of n.marks ?? []) {
      if (m.type === "bold") html = `<strong>${html}</strong>`;
      else if (m.type === "italic") html = `<em>${html}</em>`;
      else if (m.type === "underline") html = `<u>${html}</u>`;
      else if (m.type === "link") html = link(m.attrs.href, html);
      else {
        const a = m.attrs;
        html = `<span style="${a.font ? `font-family:${escape(fontStacks[a.font])};` : ""}${a.size ? `font-size:${a.size}px;` : ""}${a.color ? `color:${a.color};` : ""}">${html}</span>`;
      }
    }
    return html;
  }).join("");
  const text = (node: EmailBlock): string => {
    switch (node.type) {
      case "paragraph": case "heading": return inlineText(node.content);
      case "bulletList": case "orderedList": return node.content.map((item, i) => `${node.type === "bulletList" ? "•" : `${node.attrs.start + i}.`} ${item.content.map(p => inlineText(p.content)).join("\n")}`).join("\n");
      case "button": return `${personalize(node.attrs.label)}: ${node.attrs.href}`;
      case "signature": return Object.values(node.attrs).filter(Boolean).join("\n");
      case "emailImage": return `[Image: ${node.attrs.alt || "Media not yet available"}]${node.attrs.href ? ` ${node.attrs.href}` : ""}`;
      case "imageText": return [text(node.content[0]), ...node.content[1].content.map(text)].join("\n\n");
      case "divider": return "────────";
      case "spacer": return "";
    }
  };
  const html = (node: EmailBlock): string => {
    switch (node.type) {
      case "paragraph": return `<p style="margin:0 0 16px;text-align:${node.attrs.textAlign}">${inlineHtml(node.content) || "<br>"}</p>`;
      case "heading": return `<h${node.attrs.level} style="margin:0 0 16px;font-size:${[0, 32, 24, 20][node.attrs.level]}px;line-height:1.25;text-align:${node.attrs.textAlign}">${inlineHtml(node.content)}</h${node.attrs.level}>`;
      case "bulletList": case "orderedList": {
        const tag = node.type === "bulletList" ? "ul" : "ol";
        return `<${tag}${node.type === "orderedList" ? ` start="${node.attrs.start}"` : ""} style="margin:0 0 16px;padding-left:24px">${node.content.map(item => `<li>${item.content.map(html).join("")}</li>`).join("")}</${tag}>`;
      }
      case "button": return `<table role="presentation" align="${node.attrs.alignment}" cellpadding="0" cellspacing="0" style="margin-bottom:16px"><tr><td bgcolor="${email.theme.accentColor}" style="padding:12px 24px;border-radius:6px">${link(node.attrs.href, escape(personalize(node.attrs.label)), "color:#FFFFFF;font-weight:bold;text-decoration:none")}</td></tr></table><div style="clear:both"></div>`;
      case "divider": return '<table role="presentation" width="100%"><tr><td style="border-top:1px solid #CBD5E1;height:16px"></td></tr></table>';
      case "spacer": return `<table role="presentation" width="100%"><tr><td height="${node.attrs.height}" style="height:${node.attrs.height}px;font-size:1px;line-height:1px">&#160;</td></tr></table>`;
      case "signature": return `<p style="margin:16px 0">${Object.values(node.attrs).filter(Boolean).map(escape).join("<br>")}</p>`;
      case "emailImage":
        // No asset resolver or remote URL acceptance in 001A. Fail closed for non-preview use.
        if (!ctx.preview) throw new Error("Media resolution is not enabled.");
        return `<table role="presentation" align="${node.attrs.alignment}" width="${node.attrs.width}" style="width:100%;max-width:${node.attrs.width}px;margin-bottom:16px"><tr><td style="padding:24px;background:#F1F5F9;color:#475569;text-align:center">${escape(node.attrs.alt || "Image placeholder")}<br><small>Media library forthcoming</small></td></tr></table>`;
      case "imageText": return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td class="email-column" width="40%" valign="top" style="padding-right:16px">${html(node.content[0])}</td><td class="email-column" width="60%" valign="top">${node.content[1].content.map(html).join("")}</td></tr></table>`;
    }
  };
  const body = email.document.content.map(html).join("");
  const footer = `<footer style="margin-top:24px;border-top:1px solid #CBD5E1;padding-top:20px;font-size:14px;color:#475569">${escape(ctx.compliance.sender)}<br>${escape(ctx.compliance.postalAddress).replace(/\n/g, "<br>")}<p>${link(ctx.compliance.unsubscribeUrl, "Unsubscribe")}</p></footer>`;
  const output = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">${ctx.preview ? '<meta http-equiv="Content-Security-Policy" content="default-src &#39;none&#39;; style-src &#39;unsafe-inline&#39;; img-src &#39;none&#39;; form-action &#39;none&#39;; base-uri &#39;none&#39;">' : ""}<style>@media screen and (max-width:600px){.email-column{display:block!important;width:100%!important;padding:0!important}.email-padding{padding:20px!important}}</style></head><body style="margin:0;background:#F1F5F9"><div style="display:none;max-height:0;overflow:hidden;mso-hide:all">${escape(personalize(ctx.preheader))}</div><table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center"><!--[if mso]><table role="presentation" width="600"><tr><td><![endif]--><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#FFFFFF"><tr><td class="email-padding" style="padding:32px;font-family:${escape(fontStacks[email.theme.fontFamily])};font-size:${email.theme.fontSize}px;color:${email.theme.textColor};line-height:1.6;overflow-wrap:anywhere">${body}${footer}</td></tr></table><!--[if mso]></td></tr></table><![endif]--></td></tr></table></body></html>`;
  if (new TextEncoder().encode(output).length > 100000) throw new Error("Rendered email exceeds the 100 KB safety limit. Shorten the document.");
  return { html: output, text: [...email.document.content.map(text), ctx.compliance.sender, ctx.compliance.postalAddress, `Unsubscribe: ${ctx.compliance.unsubscribeUrl}`].filter(Boolean).join("\n\n"), subject: personalize(ctx.subject) };
}
