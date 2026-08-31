"use server";
import { revalidatePath } from "next/cache";
import { PipelineConfigurationError } from "../services/PipelineConfigurationService";
import type { ConsultantPipelineConfiguration } from "../models/ConsultantPipeline";
import { resolveWorkspaceComposition } from "@/feature/platform/composition/resolveWorkspaceComposition";
import type { DemoWorkspaceComposition } from "@/feature/platform/composition/DemoWorkspaceComposition";
export interface PipelineActionState { status: "idle" | "success" | "error"; message?: string }
const refresh=()=>{revalidatePath("/settings/pipeline");revalidatePath("/crm/candidates");revalidatePath("/crm");};
async function demo():Promise<DemoWorkspaceComposition|null>{const value=await resolveWorkspaceComposition();return value.status==="resolved"&&"runtimes" in value.composition?value.composition:null;}
const unavailable=():PipelineActionState=>({status:"error",message:"Pipeline changes are not available in this workspace."});
export async function savePipelineAction(_previous:PipelineActionState,formData:FormData):Promise<PipelineActionState>{const c=await demo();if(!c)return unavailable();try{const configuration=JSON.parse(String(formData.get("configuration")??"")) as ConsultantPipelineConfiguration;if(configuration.consultantId!==c.runtimes.consultant.id)return {status:"error",message:"Invalid pipeline owner."};await c.runtimes.createPipeline().save(configuration);refresh();return {status:"success",message:"Pipeline changes saved."};}catch(error){return {status:"error",message:error instanceof PipelineConfigurationError?error.message:"Review the pipeline configuration and try again."};}}
export async function resetPipelineAction():Promise<PipelineActionState>{const c=await demo();if(!c)return unavailable();await c.runtimes.createPipeline().reset(c.runtimes.consultant.id);refresh();return {status:"success",message:"Recommended pipeline restored. Candidate history was preserved."};}
export async function moveCandidateStageAction(_previous:PipelineActionState,formData:FormData):Promise<PipelineActionState>{return moveCandidateStage(String(formData.get("candidateId")??""),String(formData.get("stageId")??""));}
export async function moveCandidateStage(candidateId:string,stageId:string):Promise<PipelineActionState>{const c=await demo();if(!c)return unavailable();const result=await c.runtimes.createCandidatePipelineStageService().move(candidateId,stageId);if(result.status!=="success")return {status:"error",message:"The candidate could not be moved to that stage."};refresh();revalidatePath(`/crm/candidates/${candidateId}`);return {status:"success",message:"Candidate stage updated."};}
