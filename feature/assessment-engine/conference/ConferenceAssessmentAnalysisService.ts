import type { AssessmentEvidence, AssessmentTension, ConferenceAnalysis, ConferenceAnswers, ConferenceIntake, DiscoveryPriority, EvidenceCategory, OpportunityCharacteristic } from "./types";

const answer = (answers: ConferenceAnswers, id: string) => answers[id] ?? [];
const has = (answers: ConferenceAnswers, id: string, text: string) => answer(answers, id).includes(text);
const first = (answers: ConferenceAnswers, id: string) => answer(answers, id)[0] ?? "Not provided";
function scale(answers: ConferenceAnswers, id: string, options: string[], fallback = 50) {
  const index = options.indexOf(first(answers, id));
  return index < 0 ? fallback : Math.round((index / Math.max(1, options.length - 1)) * 100);
}

function confidence(labelCount: number, expected: number, contradictions = 0) {
  const strength = Math.min(1, labelCount / expected);
  const coverage = Math.min(1, labelCount / expected);
  const consistency = 1 - Math.min(1, contradictions / Math.max(1, labelCount));
  return Number((0.45 * strength + 0.3 * coverage + 0.25 * consistency).toFixed(2));
}

function profileName(dimensions: Record<string, number>) {
  const profiles = [
    ["Strategic Growth Builder", dimensions.growthOrientation + dimensions.leadershipCapability],
    ["Relationship-Led Growth Owner", dimensions.businessDevelopmentCapability + dimensions.relationshipOrientation],
    ["Team-Building Leader", dimensions.leadershipCapability + dimensions.employeeAppetite],
    ["Hands-On Business Operator", dimensions.operatingInvolvement + dimensions.executionOrientation],
    ["Executive Business Developer", dimensions.businessDevelopmentCapability + dimensions.businessDevelopmentAppetite],
    ["Independent Asset Builder", dimensions.independentJudgment + dimensions.assetOrientation],
  ] as const;
  return [...profiles].sort((a, b) => b[1] - a[1]);
}

export class ConferenceAssessmentAnalysisService {
  analyze(_intake: ConferenceIntake, answers: ConferenceAnswers): ConferenceAnalysis {
    const dimensions: Record<string, number> = {
      businessDevelopmentCapability: Math.round((scale(answers, "q13", ["Very uncomfortable", "Somewhat uncomfortable", "Neutral", "Comfortable", "Very comfortable"]) + (answer(answers, "q15").length ? 70 : 30) + (has(answers, "q16", "Ask questions to understand what's holding them back") ? 85 : 55)) / 3),
      businessDevelopmentAppetite: Math.round((scale(answers, "q14", ["I'd strongly prefer a business that doesn't depend on me doing that", "I'd do it but want to delegate it as soon as practical", "Willing because it's necessary", "Comfortable with it", "Energized by it"]) + scale(answers, "q30", ["Strongly prefer little owner selling", "Want most selling handled by employees", "Some selling is fine", "Remain involved in important sales", "Selling would remain a major part of my role"])) / 2),
      leadershipCapability: has(answers, "q7", "I naturally organize people and resources around the objective") || has(answers, "q7", "I establish the process and monitor execution") ? 85 : 60,
      employeeAppetite: scale(answers, "q27", ["Prefer as few employees as practical", "Prefer a small professional team", "I'm not sure", "Comfortable managing a moderate-sized team", "Prefer managing managers rather than frontline employees", "Enjoy building and leading larger teams"]),
      systemAlignment: scale(answers, "q12", ["Use my approach if I'm confident it will perform better", "Test my idea carefully while monitoring results", "Ask experienced franchisees how they handle it", "Follow it while discussing my idea with the franchisor", "Follow the system as designed until I understand it thoroughly"]),
      independentJudgment: scale(answers, "q11", ["Understand the reasoning and consider whether I should adjust", "Try the recommendation before deciding whether I agree", "Compare the feedback against the results I'm getting", "Listen, but generally trust my own judgment", "Resist changing something I believe is already working"]),
      riskTolerance: scale(answers, "q24", ["Prefer predictability even if it limits upside", "Accept modest risk when the downside is well understood", "Comfortable with calculated risk when opportunity justifies it", "Comfortable with significant uncertainty when I believe in the upside", "Tend to act on opportunities before all information is available"]),
      resilience: has(answers, "q22", "Take some time to recover before re-engaging") || has(answers, "q23", "Become concerned about whether I made the right decision") ? 45 : 78,
      incomeUrgency: scale(answers, "q4", ["Not important", "Somewhat important", "Important", "Very important", "Essential"]),
      growthOrientation: has(answers, "q18", "Develop multiple territories or locations over time") || has(answers, "q18", "Build an organization led by managers") ? 90 : 60,
      relationshipOrientation: answer(answers, "q15").some((value) => ["Networking and referrals", "Building long-term professional relationships", "Consultative/solution selling", "Strategic partnerships"].includes(value)) ? 85 : 50,
      operatingInvolvement: has(answers, "q5", "Closely involved in day-to-day operations") || has(answers, "q5", "Lead the team while remaining involved in key operations") ? 85 : 45,
      executionOrientation: has(answers, "q7", "I establish the process and monitor execution") ? 90 : 65,
      assetOrientation: answer(answers, "q1").some((value) => value.includes("wealth") || value.includes("asset")) ? 85 : 55,
    };

    const evidence: AssessmentEvidence[] = [];
    const addEvidence = (questionId: string, category: EvidenceCategory, dimension: string, statement: string, strength = 0.8) => evidence.push({ id: `ev-${questionId}-${evidence.length + 1}`, questionId, category, dimension, statement, strength, confidence: confidence(answer(answers, questionId).length, 1) });
    answer(answers, "q1").forEach((value) => addEvidence("q1", "motivation", "ownershipMotivation", value));
    addEvidence("q13", "capability", "businessDevelopmentCapability", `Prospecting comfort: ${first(answers, "q13")}`);
    addEvidence("q14", "preference", "businessDevelopmentAppetite", `Launch-stage sales appetite: ${first(answers, "q14")}`);
    addEvidence("q27", "preference", "employeeAppetite", `Staffing preference: ${first(answers, "q27")}`);
    addEvidence("q12", "preference", "systemAlignment", `System response: ${first(answers, "q12")}`);
    addEvidence("q35", "constraint", "householdRunway", `Household runway: ${first(answers, "q35")}`);
    addEvidence("q33", "constraint", "liquidCapital", `Candidate-reported liquid capital: ${first(answers, "q33")}`);

    const tensions: AssessmentTension[] = [];
    const tension = (title: string, explanation: string, refs: string[], priority: "high" | "normal" = "normal") => tensions.push({ title, explanation, evidenceRefs: refs, priority });
    if (dimensions.businessDevelopmentCapability >= 65 && dimensions.businessDevelopmentAppetite <= 45) tension("Sales Capability vs Sales Appetite", "The responses suggest an ability to develop business alongside a preference to reduce sustained owner-led selling.", ["q13", "q14", "q30"], "high");
    if (dimensions.leadershipCapability >= 70 && dimensions.employeeAppetite <= 45) tension("Leadership Capability vs Employee Appetite", "Leadership evidence is strong, while the preferred model minimizes direct employee management.", ["q7", "q27", "q28"], "high");
    if (dimensions.incomeUrgency >= 75 && ["Less than 3 months", "3–6 months"].includes(first(answers, "q35"))) tension("Income Urgency vs Household Runway", "A relatively fast income need should be tested against the reported household runway.", ["q4", "q35"], "high");
    if (dimensions.systemAlignment >= 65 && dimensions.independentJudgment >= 70) tension("System Alignment vs Independent Judgment", "The candidate values a proven system and also retains strong independent judgment; clarify the desired autonomy boundary.", ["q11", "q12"]);
    if (first(answers, "q34").includes("guidance") || first(answers, "q33").includes("discuss")) tension("Financial Capacity vs Investment Comfort", "Reported financial context does not yet define a comfortable investment boundary.", ["q32", "q33", "q34"]);

    const priorities: DiscoveryPriority[] = [];
    const priority = (title: string, whyItMatters: string, suggestedQuestion: string, refs: string[], high = false) => priorities.push({ title, whyItMatters, suggestedQuestion, evidenceRefs: refs, priority: high ? "high" : "normal", confidence: confidence(refs.length, 3, 0) });
    if (dimensions.incomeUrgency >= 60) priority("Income Ramp", "Income replacement timing may materially narrow suitable operating models.", `What income milestone would feel meaningful, and by when?`, ["q4", "q35"], dimensions.incomeUrgency >= 75);
    priority("Owner-Led Sales", "Launch and mature-stage selling preferences should align with the acquisition model.", `Which customer-development activities would you personally sustain for two years?`, ["q13", "q14", "q15", "q30"], tensions.some((item) => item.title.startsWith("Sales")));
    priority("Franchise-System Autonomy", "The right model should balance operating playbooks with room for judgment.", `Where do you want clear franchisor direction, and where do you need latitude?`, ["q11", "q12"]);
    priority("Staffing Model", "Team scale and management intensity shape the owner's daily work.", `What size and type of team are you genuinely willing to lead?`, ["q7", "q8", "q27", "q28"], tensions.some((item) => item.title.startsWith("Leadership")));
    if (!has(answers, "q36-stakeholders", "Decision is primarily mine")) priority("Decision Stakeholder Alignment", "Other stakeholders may influence timing and investment comfort.", `Who needs to be involved before you can confidently move forward?`, ["q20", "q36-stakeholders"]);
    if (answer(answers, "q1").includes("I'm still figuring that out") || first(answers, "q18") === "I'm not sure yet") priority("Ownership Direction", "Exploratory responses are an invitation to clarify success criteria, not a negative signal.", `Which ownership outcome would make the exploration worthwhile even before choosing a model?`, ["q1", "q18"]);

    const characteristics: OpportunityCharacteristic[] = [
      { characteristic: "relationship-led", disposition: dimensions.relationshipOrientation >= 70 ? "Attractive" : "Acceptable", reason: "Derived from preferred business-development styles." },
      { characteristic: "consultative sales", disposition: dimensions.businessDevelopmentAppetite >= 55 ? "Attractive" : "Validate", reason: "Balances sales capability with the desired owner role." },
      { characteristic: "low employee", disposition: dimensions.employeeAppetite <= 45 ? "Attractive" : "Acceptable", reason: "Reflects stated employee-management appetite." },
      { characteristic: "manager-led", disposition: has(answers, "q5", "Build a management team that handles most daily operations") ? "Attractive" : "Validate", reason: "Reflects the preferred mature owner role." },
      { characteristic: "scalable territories", disposition: dimensions.growthOrientation >= 75 ? "Attractive" : "Acceptable", reason: "Reflects growth and expansion orientation." },
      { characteristic: "franchise-system intensive", disposition: dimensions.systemAlignment >= 65 ? "Attractive" : "Validate", reason: "Reflects comfort operating within a proven system." },
      { characteristic: "fast ramp", disposition: dimensions.incomeUrgency >= 75 ? "Validate" : "Acceptable", reason: "Income timing must be validated against business economics and runway." },
      { characteristic: "moderate investment", disposition: first(answers, "q34").includes("guidance") ? "Validate" : "Acceptable", reason: "Based on stated investment range; capacity does not imply comfort." },
    ];

    const ranked = profileName(dimensions);
    const primary = evidence.length < 5 ? "Your ownership profile is still taking shape." : ranked[0][0];
    return {
      version: "franchise-ownership-v1", evidence, dimensions, tensions: tensions.slice(0, 4), discoveryPriorities: priorities.slice(0, 6), opportunityCharacteristics: characteristics,
      ownershipProfile: {
        primary, supporting: ranked.slice(1, 3).map(([name]) => name), confidence: confidence(evidence.length, 8, tensions.length),
        motivations: answer(answers, "q1"), operatingPreferences: [first(answers, "q5"), ...answer(answers, "q29")],
        strengths: [dimensions.leadershipCapability >= 70 ? "Organizing people and execution" : "Personal accountability", dimensions.businessDevelopmentCapability >= 65 ? "Building customer relationships" : "Thoughtful decision-making", dimensions.resilience >= 65 ? "Learning and adapting through setbacks" : "Careful reflection under pressure"],
        characteristics: characteristics.filter((item) => item.disposition === "Attractive").map((item) => item.characteristic),
        consultantQuestions: priorities.slice(0, 4).map((item) => item.suggestedQuestion),
      },
      executiveSummary: `The responses most closely reflect a ${primary}. Discovery should focus on ${priorities.slice(0, 3).map((item) => item.title.toLowerCase()).join(", ")}.`,
      financial: { netWorth: first(answers, "q32"), liquidCapital: first(answers, "q33"), investmentRange: answer(answers, "q34").join(", "), disclaimer: "Candidate-reported and not independently verified by FranGroove." },
    };
  }
}
