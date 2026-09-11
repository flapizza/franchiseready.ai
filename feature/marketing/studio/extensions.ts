import { Mark, Node } from "@tiptap/core";
import StarterKit from "@tiptap/starter-kit";
import TextAlign from "@tiptap/extension-text-align";
import { OrderedList, ListItem } from "@tiptap/extension-list";
import { fontStacks, type EmailDocument } from "./document";

const attrs = (values: Record<string, unknown>) => Object.fromEntries(Object.entries(values).map(([key, value]) => [key, { default: value }]));
export function studioExtensions() {
  return [
    StarterKit.configure({ blockquote: false, code: false, codeBlock: false, strike: false, horizontalRule: false, link: false, listItem: false, orderedList: false, heading: { levels: [1, 2, 3] }, trailingNode: false }),
    OrderedList.extend({ addAttributes: () => attrs({ start: 1 }) }),
    ListItem.extend({ content: "paragraph+" }),
    TextAlign.configure({ types: ["heading", "paragraph"], alignments: ["left", "center", "right"], defaultAlignment: "left" }),
    Mark.create({ name: "emailStyle", addAttributes: () => attrs({ font: null, size: null, color: null }), renderHTML: ({ mark }) => ["span", { style: `${mark.attrs.font ? `font-family:${fontStacks[mark.attrs.font as keyof typeof fontStacks]};` : ""}${mark.attrs.size ? `font-size:${mark.attrs.size}px;` : ""}${mark.attrs.color ? `color:${mark.attrs.color};` : ""}` }, 0] }),
    Mark.create({ name: "link", inclusive: false, addAttributes: () => attrs({ href: "https://example.com" }), renderHTML: () => ["span", { class: "studio-link" }, 0] }),
    Node.create({ name: "mergeField", inline: true, group: "inline", atom: true, addAttributes: () => attrs({ field: "first_name" }), renderHTML: ({ node }) => ["span", { class: "studio-merge" }, `{{${node.attrs.field}}}`] }),
    Node.create({ name: "button", group: "block", atom: true, addAttributes: () => attrs({ label: "Explore opportunities", href: "https://example.com", alignment: "left" }), renderHTML: ({ node }) => ["div", { class: "studio-button-wrap", style: `text-align:${node.attrs.alignment}` }, ["span", { class: "studio-button" }, node.attrs.label]] }),
    Node.create({ name: "divider", group: "block", atom: true, renderHTML: () => ["hr", { class: "studio-divider" }] }),
    Node.create({ name: "spacer", group: "block", atom: true, addAttributes: () => attrs({ height: 24 }), renderHTML: ({ node }) => ["div", { class: "studio-spacer", style: `height:${node.attrs.height}px` }, "Spacing"] }),
    Node.create({ name: "signature", group: "block", atom: true, addAttributes: () => attrs({ name: "Your name", title: "Franchise Consultant", company: "Your company", email: "", phone: "" }), renderHTML: ({ node }) => ["div", { class: "studio-signature" }, ...Object.values(node.attrs).filter(Boolean).map(value => ["div", {}, String(value)])] }),
    Node.create({ name: "emailImage", group: "block", atom: true, addAttributes: () => attrs({ assetId: null, alt: "Image description", alignment: "center", width: 536, href: null }), renderHTML: ({ node }) => ["div", { class: "studio-image", style: `max-width:${node.attrs.width}px;text-align:${node.attrs.alignment}` }, ["strong", {}, node.attrs.alt || "Image placeholder"], ["div", {}, "Media library forthcoming"]] }),
    Node.create({ name: "imageText", group: "block", content: "emailImage emailColumn", isolating: true, renderHTML: () => ["div", { class: "studio-columns" }, 0] }),
    Node.create({ name: "emailColumn", content: "(paragraph | heading | bulletList | orderedList)+", isolating: true, renderHTML: () => ["div", { class: "studio-column" }, 0] }),
  ];
}

export const imagePlaceholder = (): Extract<EmailDocument["document"]["content"][number], { type: "emailImage" }> => ({ type: "emailImage", attrs: { assetId: null, alt: "Image description", alignment: "center", width: 536, href: null } });
