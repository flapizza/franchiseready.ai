import { z } from 'zod';
import { brandingSchema, brandingDeliveryErrors, imageReferences } from '../media/model.ts';
import { parseEmailDocument } from '../studio/document.ts';
import { renderStudioEmail } from '../studio/render.ts';

export const STUDIO_RENDERER_VERSION = 'studio-001c-1';
const identity = z.string().trim().min(1).max(120).refine(v=>!/[\r\n\x00-\x1f]/.test(v));
export const deliveryAddress = z.email().max(254).refine(v=>!/(?:@|\.)(?:example|invalid|test|localhost)$|@example\.(?:com|org|net)$/i.test(v),'Use a real test email address.');
const asset = z.object({deliveryPath:z.string().regex(/^[a-f0-9-]{36}\/asset_[a-f0-9]{32}\/1\/email\.png$/),checksum:z.string().regex(/^[a-f0-9]{64}$/),width:z.number().int().positive(),height:z.number().int().positive(),version:z.literal(1)}).strict();
export const studioSnapshotSchema = z.object({
  version:z.literal(1),rendererVersion:z.literal(STUDIO_RENDERER_VERSION),personalizationVersion:z.literal(1),
  branding:brandingSchema,assets:z.record(z.string(),asset),
  mediaOrigin:z.url(),publicOrigin:z.url(),audienceFingerprint:z.string().regex(/^[a-f0-9]{64}$/),
}).strict();
export type StudioSnapshot = z.infer<typeof studioSnapshotSchema>;
export type StudioSendSource = {content:unknown;subject:string;preview_text:string;sender_name:string;reply_to:string;studio_snapshot:unknown};

export function validateStudioSend(source:StudioSendSource) {
  const content=parseEmailDocument(source.content),snapshot=studioSnapshotSchema.parse(source.studio_snapshot);
  if(!source.subject.trim()||source.subject.length>180||/[\r\n\x00-\x1f]/.test(source.subject))throw Error('A valid subject is required.');
  identity.parse(source.sender_name);z.email().max(254).parse(source.reply_to);
  const missing=brandingDeliveryErrors(snapshot.branding);if(missing.length)throw Error('Complete company branding: '+missing.join(', ')+'.');
  if(source.sender_name.trim()!==snapshot.branding.name.trim()||source.reply_to.trim().toLowerCase()!==snapshot.branding.email.trim().toLowerCase())throw Error('Use the sender name and professional email from the saved campaign branding.');
  for(const origin of [snapshot.publicOrigin,snapshot.mediaOrigin]){const u=new URL(origin);if(u.origin!==origin||u.protocol!=='https:')throw Error('A secure public delivery origin is required.');}
  for(const id of imageReferences(content,snapshot.branding)){if(!snapshot.assets[id])throw Error('An image is unavailable for delivery.');}
  for(const block of content.document.content){const image=block.type==='emailImage'?block:block.type==='imageText'?block.content[0]:undefined;if(image&&!image.attrs.assetId)throw Error('Replace image placeholders before delivery.');}
  return {content,snapshot};
}

export function studioPersonalization(values:Record<string,unknown>,consultant:string) {
  const text=(v:unknown)=>typeof v==='string'?v.trim().slice(0,120):'';
  const first=text(values.firstName)||text(values.preferredName)||'there';
  return {first_name:first,preferred_name:text(values.preferredName)||first,consultant_name:text(consultant)||'Your consultant'};
}

export function renderStudioDelivery(source:StudioSendSource,values:Record<string,unknown>,rawToken:string,test=false) {
  if(!/^[A-Za-z0-9-]{32,128}$/.test(rawToken))throw Error('Invalid unsubscribe protection.');
  const {content,snapshot}=validateStudioSend(source);
  const unsubscribeUrl=snapshot.publicOrigin+(test?'/api/marketing/test-unsubscribe/':'/unsubscribe/')+rawToken;
  const oneClick=snapshot.publicOrigin+(test?'/api/marketing/test-unsubscribe/':'/api/marketing/unsubscribe/')+rawToken;
  const rendered=renderStudioEmail(content,{
    subject:source.subject,preheader:source.preview_text,
    personalization:studioPersonalization(values,snapshot.branding.name),
    compliance:{sender:`${source.sender_name} | ${snapshot.branding.company}`,postalAddress:snapshot.branding.postalAddress,unsubscribeUrl},
    assets:Object.fromEntries(Object.entries(snapshot.assets).map(([id,a])=>[id,{deliveryUrl:snapshot.mediaOrigin+'/storage/v1/object/public/studio-delivery/'+a.deliveryPath}])),preview:false,
  });
  return {...rendered,...(test?{subject:'[TEST] '+rendered.subject,html:rendered.html.replace(/(<body[^>]*>)/,'$1<p style="padding:12px;text-align:center;font-family:Arial">TEST EMAIL — audience and contact consent are unchanged.</p>'),text:'TEST EMAIL — audience and contact consent are unchanged.\n\n'+rendered.text}:{}),headers:{'List-Unsubscribe':`<${oneClick}>`,'List-Unsubscribe-Post':'List-Unsubscribe=One-Click'}};
}
