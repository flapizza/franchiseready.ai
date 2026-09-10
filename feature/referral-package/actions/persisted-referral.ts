"use server";
import { revalidatePath } from "next/cache";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { referralContext } from "../services/PersistedReferral";
export type ReferralActionState={message:string;ok?:boolean};
export async function saveConsideration(_previous:ReferralActionState,form:FormData):Promise<ReferralActionState>{
  try{
    const candidate=String(form.get("candidateId")??""),brand=String(form.get("brandId")??""),state=String(form.get("state")??"");
    if(!["considering","selected","removed"].includes(state))throw Error();
    const context=await referralContext(candidate,brand);if(!context?.brand)throw Error();
    const db=await createServerSupabaseClient();const {error}=await db.rpc("set_candidate_brand_consideration",{target_candidate:candidate,target_brand:context.brand.brandId,next_state:state});if(error)throw Error();
    revalidatePath(`/crm/candidates/${candidate}/strategy`);revalidatePath(`/crm/candidates/${candidate}/referral`);
    return{ok:true,message:state==="selected"?"Brand selected for referral.":state==="removed"?"Brand marked not pursuing.":"Brand saved for consideration."};
  }catch{return{message:"Brand consideration could not be saved."}}
}
export async function saveReferralPreparation(_previous:ReferralActionState,form:FormData):Promise<ReferralActionState>{
  try{const candidate=String(form.get("candidateId")??""),brand=String(form.get("brandId")??""),note=String(form.get("note")??"").trim();
    if(note.length>10000)throw Error();const c=await referralContext(candidate,brand);if(!c?.consideration||c.consideration.state!=="selected")return{message:"Select this brand before preparing the referral."};
    const db=await createServerSupabaseClient();const {error}=await db.from("candidate_brand_considerations").update({consultant_note:note}).eq("id",c.consideration.id).eq("organization_id",c.organizationId).eq("consultant_membership_id",c.membershipId);if(error)throw Error();
    revalidatePath(`/crm/candidates/${candidate}/referral`);return{ok:true,message:"Referral preparation saved. Nothing has been transmitted."};
  }catch{return{message:"Referral preparation could not be saved."}}
}
