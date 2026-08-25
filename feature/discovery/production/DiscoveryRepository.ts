import type { ConferenceAnalysis } from "@/feature/assessment-engine/conference/types";
import type { CurrentDiscoveryIntelligence, DiscoveryFindingStatus, ProductionDiscoverySession } from "./types";
export type SaveObservationInput={topicId:string;topic:string;finding:string;candidateStatement:string;status:DiscoveryFindingStatus;significance:string;followUpNeeded:boolean};
export interface DiscoveryRepository {getOrCreate(candidateId:string):Promise<{session:ProductionDiscoverySession;assessment:ConferenceAnalysis}>;saveObservation(candidateId:string,input:SaveObservationInput):Promise<void>;saveNotes(candidateId:string,input:{summary:string;consultantNotes:string;nextSteps:string}):Promise<void>;complete(candidateId:string,intelligence:CurrentDiscoveryIntelligence):Promise<void>}

