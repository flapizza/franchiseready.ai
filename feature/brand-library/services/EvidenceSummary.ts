import type { BrandFact, BrandIntelligenceProfile } from "../models/BrandIntelligenceProfile";
export function evidenceSummary(profile:BrandIntelligenceProfile){
 const facts:BrandFact<unknown>[]=[];
 function visit(value:unknown){if(!value||typeof value!=="object"||Array.isArray(value))return;const v=value as Record<string,unknown>;if("value" in v&&"knowledgeState" in v&&"verification" in v){facts.push(value as BrandFact<unknown>);return}for(const [key,child] of Object.entries(v))if(key!=="consultantIntelligence")visit(child)}
 visit(profile);
 return{evaluated:facts.length,sourced:facts.filter(f=>f.value!==null&&f.knowledgeState!=="unknown"&&f.evidence.some(e=>e.sourceType!=="inferred")).length,verified:facts.filter(f=>f.verification==="verified").length,inferred:facts.filter(f=>f.evidence.some(e=>e.sourceType==="inferred")).length,unknown:facts.filter(f=>f.value===null||f.knowledgeState==="unknown").length};
}
