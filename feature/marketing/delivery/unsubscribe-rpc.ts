import 'server-only';
import {createClient} from '@supabase/supabase-js';
import {getPublicEnvironment} from '@/lib/env';
export async function applyUnsubscribe(digest:string,test=false) {
 const env=getPublicEnvironment();
 const db=createClient(env.NEXT_PUBLIC_SUPABASE_URL,env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,{auth:{persistSession:false,autoRefreshToken:false}});
 const {data,error}=await db.rpc(test?'unsubscribe_studio_test':'unsubscribe_marketing',{token_digest:digest});
 return !error&&data===true;
}
