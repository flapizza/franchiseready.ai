"use client";
import { useTransition } from "react";
import { clearConferenceAssessments } from "../actions";
export function ClearConferenceAssessmentsButton() { const [pending,startTransition]=useTransition();return <button disabled={pending} onClick={()=>{if(window.confirm("Clear all temporary conference assessments?"))startTransition(async()=>{await clearConferenceAssessments();});}} className="min-h-11 rounded-lg border border-red-200 px-4 text-sm font-semibold text-red-700 hover:bg-red-50 disabled:opacity-50">{pending?"Clearing…":"Clear Conference Assessments"}</button> }
