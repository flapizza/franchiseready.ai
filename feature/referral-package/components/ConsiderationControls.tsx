"use client";
import {useActionState} from "react";
import {saveConsideration,saveReferralPreparation} from "../actions/persisted-referral";
export function ConsiderationControls({candidateId,brandId,state}:{candidateId:string;brandId:string;state?:string}){
 const[result,action,pending]=useActionState(saveConsideration,{message:""});
 return <form action={action} className="mt-4 space-y-3"><input type="hidden" name="candidateId" value={candidateId}/><input type="hidden" name="brandId" value={brandId}/><p className="text-sm font-bold">{state==="selected"?"Selected for Referral":state==="considering"?"Considering":state==="removed"?"Not pursuing":"Not yet saved"}</p><div className="flex flex-wrap gap-2">{[['considering','Consider'],['selected','Select for Referral'],['removed','Not Pursuing']].map(([value,label])=><button key={value} name="state" value={value} disabled={pending} className="rounded-lg border border-teal-300 px-3 py-2 text-sm font-bold text-teal-800">{label}</button>)}</div>{result.message&&<p role="status" className="text-sm">{result.message}</p>}</form>;
}
export function ReferralPreparationForm({candidateId,brandId,note}:{candidateId:string;brandId:string;note:string}){
 const[result,action,pending]=useActionState(saveReferralPreparation,{message:""});
 return <form action={action} className="space-y-3"><input type="hidden" name="candidateId" value={candidateId}/><input type="hidden" name="brandId" value={brandId}/><label className="block font-bold">Consultant recommendation for the franchisor<textarea name="note" maxLength={10000} defaultValue={note} rows={5} className="mt-2 block w-full rounded-xl border p-3"/></label><p className="text-xs text-slate-500">This recommendation will appear in the packet. Review its suitability before sharing.</p><button disabled={pending} className="rounded-xl bg-teal-700 px-5 py-3 font-bold text-white">Save Referral Preparation</button>{result.message&&<p role="status">{result.message}</p>}</form>;
}
