import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { getResendEnvironment } from "@/lib/env";
import { ResendProviderEventRepository } from "@/feature/marketing/delivery/resend/ResendProviderEventRepository";
import { mapResendWebhook, verifyResendWebhook } from "@/feature/marketing/delivery/resend/webhook";

export async function POST(request:Request){
  const configuration=getResendEnvironment();if(!configuration)return Response.json({error:'Webhook unavailable.'},{status:503});
  const payload=await request.text();const headers={id:request.headers.get('svix-id')??'',timestamp:request.headers.get('svix-timestamp')??'',signature:request.headers.get('svix-signature')??''};
  if(!headers.id||!headers.timestamp||!headers.signature||!verifyResendWebhook(payload,headers,configuration.RESEND_WEBHOOK_SECRET))return Response.json({error:'Invalid webhook.'},{status:400});
  let event;try{event=mapResendWebhook(payload,headers.id)}catch{return Response.json({error:'Invalid webhook.'},{status:400})}
  if(!event)return Response.json({received:true,processed:false});
  try{const outcome=await new ResendProviderEventRepository(createAdminSupabaseClient()).record(event);return Response.json({received:true,processed:outcome==='recorded'});}catch{return Response.json({error:'Webhook processing unavailable.'},{status:500})}
}
