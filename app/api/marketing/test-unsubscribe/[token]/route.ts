import {createHash} from 'node:crypto';
import {oneClickUnsubscribe} from '@/feature/marketing/delivery/unsubscribe-http';
import {applyUnsubscribe} from '@/feature/marketing/delivery/unsubscribe-rpc';
export const runtime='nodejs';
export async function POST(request:Request,{params}:{params:Promise<{token:string}>}){return oneClickUnsubscribe(request,(await params).token,digest=>applyUnsubscribe(digest,true));}
export async function GET(_request:Request,{params}:{params:Promise<{token:string}>}){
 const {token}=await params;
 const ok=/^[A-Za-z0-9-]{32,128}$/.test(token)&&await applyUnsubscribe(createHash('sha256').update(token).digest('hex'),true);
 return new Response(`<!doctype html><html lang="en"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Test email preferences</title><body style="font-family:Arial;padding:32px;max-width:600px;margin:auto"><h1>${ok?'Test email acknowledged':'This link is unavailable'}</h1><p>This link belongs to a test message. Campaign audiences and contact subscription preferences have not changed.</p></body></html>`,{status:ok?200:400,headers:{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store','Content-Security-Policy':"default-src 'none'; style-src 'unsafe-inline'; frame-ancestors 'none'"}});
}
