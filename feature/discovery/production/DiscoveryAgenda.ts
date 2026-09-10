import type { ConferenceAnalysis,DiscoveryPriority } from "@/feature/assessment-engine/conference/types";
import type { ProductionDiscoverySession } from "./types";
export type AgendaTopic=DiscoveryPriority&{topicId:string;source:"assessment"|"discovery"};
export function discoveryAgenda(assessment:ConferenceAnalysis,session:ProductionDiscoverySession):AgendaTopic[]{
  const observations=session.observations.map(o=>({topicId:o.topicId,title:o.topic,priority:(o.followUpNeeded||o.status==="unclear"||o.status==="contradicted"?"high":"normal") as "high"|"normal",whyItMatters:o.significance||"Validate how this finding affects ownership fit and the next conversation.",suggestedQuestion:o.followUpNeeded||o.status==="unclear"||o.status==="contradicted"?`What would resolve the remaining questions about ${o.topic.toLowerCase()}?`:`Does the recorded understanding of ${o.topic.toLowerCase()} still reflect your priorities? What is the next step?`,evidenceRefs:[o.id],confidence:1,source:"discovery" as const}));
  const remaining=assessment.discoveryPriorities.filter(p=>!observations.some(o=>o.title.toLowerCase()===p.title.toLowerCase())).map(p=>({...p,topicId:p.title,source:"assessment" as const}));
  return [...observations,...remaining].sort((a,b)=>Number(b.priority==="high")-Number(a.priority==="high")||Number(b.source==="discovery")-Number(a.source==="discovery"));
}
