import { createHmac, timingSafeEqual } from "node:crypto";
import type { ProviderDeliveryEvent } from "../MarketingDelivery";

export interface ResendWebhookHeaders { id:string; timestamp:string; signature:string; }

export function verifyResendWebhook(payload:string,headers:ResendWebhookHeaders,secret:string,nowMs=Date.now()):boolean {
  if(!/^\d{10}$/.test(headers.timestamp)||Math.abs(nowMs-Number(headers.timestamp)*1000)>300_000)return false;
  const encoded=secret.startsWith('whsec_')?secret.slice(6):secret;
  let key:Buffer;try{key=Buffer.from(encoded.replace(/-/g,'+').replace(/_/g,'/'),'base64')}catch{return false}if(key.length<16)return false;
  const expected=createHmac('sha256',key).update(`${headers.id}.${headers.timestamp}.${payload}`).digest();
  return headers.signature.split(/\s+/).some(candidate=>{const [version,value]=candidate.split(',',2);if(version!=='v1'||!value)return false;try{const actual=Buffer.from(value,'base64');return actual.length===expected.length&&timingSafeEqual(actual,expected)}catch{return false}});
}

export function mapResendWebhook(payload:string,providerEventId:string):ProviderDeliveryEvent|null {
  let value:unknown;try{value=JSON.parse(payload)}catch{throw new Error('malformed')}
  if(!isRecord(value)||typeof value.type!=='string'||typeof value.created_at!=='string'||!isRecord(value.data)||typeof value.data.email_id!=='string')throw new Error('malformed');
  const occurredAt=new Date(value.created_at);if(Number.isNaN(occurredAt.valueOf()))throw new Error('malformed');
  const type=mapType(value.type,value.data);if(!type)return null;
  return {provider:'resend',providerEventId,providerMessageId:value.data.email_id,type,occurredAt:occurredAt.toISOString(),metadata:safeMetadata(value.type,value.data)};
}

function mapType(type:string,data:Record<string,unknown>):ProviderDeliveryEvent['type']|null {
  if(type==='email.sent')return'accepted';if(type==='email.delivered')return'delivered';if(type==='email.complained')return'complaint';if(type==='email.failed')return'provider-failure';if(type==='email.delivery_delayed')return'soft-bounce';if(type==='email.suppressed')return'rejected';
  if(type==='email.bounced'){const bounce=isRecord(data.bounce)?data.bounce:{};return bounce.type==='Permanent'?'hard-bounce':'soft-bounce'}
  return null;
}

function safeMetadata(type:string,data:Record<string,unknown>):Record<string,string>{const result:Record<string,string>={sourceType:type};const bounce=isRecord(data.bounce)?data.bounce:null;const failed=isRecord(data.failed)?data.failed:null;add(result,'bounceType',bounce?.type);add(result,'bounceSubtype',bounce?.subType);add(result,'failureReason',failed?.reason);return result}
function add(target:Record<string,string>,key:string,value:unknown){if(typeof value==='string'&&/^[A-Za-z0-9_.:-]{1,100}$/.test(value))target[key]=value}
function isRecord(value:unknown):value is Record<string,unknown>{return typeof value==='object'&&value!==null&&!Array.isArray(value)}
