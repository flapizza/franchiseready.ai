import type { BrandProfile } from "../models/BrandProfile";

export const demoBrands: BrandProfile[] = [
  {
    id: "era-group",
    demoClassification: "existing-demo-profile",

    name: "ERA Group",

    shortDescription:
      "Global business consulting franchise specializing in cost optimization and operational improvement.",

    category: "B2B Consulting",

    website: "https://www.eragroup.com",
    referralContact: { name: "Franchise Development Team", email: "franchise@eragroup.com", title: "Franchise Development" },

    investment: {
      minimum: 85000,
      maximum: 175000,
      liquidCapitalMinimum: 75000,
    },

    idealCandidate: {
      leadership: 95,
      sales: 90,
      operations: 98,
      financial: 85,
      relationshipBuilding: 92,
      coachability: 95,
    },

    businessModel: {
      recurringRevenue: true,
      ownerOperator: false,
      executiveModel: true,
      homeBased: true,
      b2b: true,
      b2c: false,
    },

    operatingModel: {
      teamModel: "small-team",
      salesIntensity: 88,
      operationalIntensity: 72,
      scheduleFlexibility: 86,
      primaryCustomer: "C-suite and senior business leaders",
    },
    operatingEnvironment: "Home-based executive consulting with client-site and virtual meetings",
    territoryModel: "Relationship-led business development within an assigned local market",
    trainingSupport: {
      initialTraining: "Curated demo profile: consulting methodology and business launch preparation",
      launchSupport: "Curated demo profile: market planning and early pipeline coaching",
      ongoingSupport: "Curated demo profile: peer collaboration and operating-method support",
      technologySupport: "Curated demo profile: analysis and client-engagement workflow tools",
    },

    culture: ["Executive peer network", "Analytical", "Consultative", "Autonomous"],
    successTraits: ["Executive credibility", "Complex problem solving", "Relationship-led business development"],
    poorFitTraits: ["Avoids networking", "Prefers transactional consumer sales", "Requires immediate sales cycles"],

    strengths: [
      "Executive leadership",
      "Relationship selling",
      "Business development",
      "Consultative mindset",
    ],

    considerations: [
      "Comfort with networking",
      "Long sales cycle",
    ],

    discoveryQuestions: [
      "How comfortable are you developing executive relationships?",
      "Tell me about a time you sold an intangible service.",
    ],

    aiNotes: [
      "High fit for executives leaving corporate leadership.",
    ],

    tags: [
      "executive",
      "consulting",
      "b2b",
      "home-based",
    ],
  },
  {
    id: "schooley-mitchell",
    demoClassification: "existing-demo-profile",
    name: "Schooley Mitchell",
    shortDescription:
      "Independent cost-reduction consulting franchise serving business clients.",
    category: "B2B Consulting",
    website: "https://www.schooleymitchell.com",
    referralContact: { name: "Franchise Development Team", email: "franchise@schooleymitchell.com", title: "Franchise Development" },
    investment: {
      minimum: 70000,
      maximum: 140000,
      liquidCapitalMinimum: 60000,
    },
    idealCandidate: {
      leadership: 88,
      sales: 92,
      operations: 84,
      financial: 82,
      relationshipBuilding: 94,
      coachability: 90,
    },
    businessModel: {
      recurringRevenue: true,
      ownerOperator: true,
      executiveModel: true,
      homeBased: true,
      b2b: true,
      b2c: false,
    },
    operatingModel: {
      teamModel: "solo",
      salesIntensity: 94,
      operationalIntensity: 58,
      scheduleFlexibility: 92,
      primaryCustomer: "Small and mid-sized business owners",
    },
    operatingEnvironment: "Home-based consulting with sustained local networking and client meetings",
    territoryModel: "Locally developed business relationships with a home-based delivery model",
    trainingSupport: {
      initialTraining: "Curated demo profile: cost-review methodology and consultative selling",
      launchSupport: "Curated demo profile: local prospecting plan and pipeline activation",
      ongoingSupport: "Curated demo profile: coaching, peer practices, and service-method support",
      technologySupport: "Curated demo profile: client analysis and engagement workflow tools",
    },
    culture: ["Independent", "Relationship-driven", "Analytical", "Community-focused"],
    successTraits: ["Persistent prospecting", "Trust building", "Comfort with a focused owner-operator model"],
    poorFitTraits: ["Dislikes consistent outreach", "Seeks a large employee organization", "Prefers consumer retail"],
    strengths: [
      "Relationship development",
      "Consultative sales",
      "Analytical problem solving",
    ],
    considerations: ["Consistent networking", "Pipeline development"],
    discoveryQuestions: [
      "How do you build trust with business decision-makers?",
      "What is your approach to long-cycle relationship selling?",
    ],
    aiNotes: ["Strong fit for consultative B2B relationship builders."],
    tags: ["consulting", "b2b", "home-based", "recurring-revenue"],
  },
  {
    id: "actioncoach",
    demoClassification: "existing-demo-profile",
    name: "ActionCOACH",
    shortDescription:
      "Business coaching franchise serving owners and leadership teams.",
    category: "Business Coaching",
    website: "https://www.actioncoach.com",
    referralContact: { name: "Franchise Development Team", email: "franchise@actioncoach.com", title: "Franchise Development" },
    investment: {
      minimum: 90000,
      maximum: 220000,
      liquidCapitalMinimum: 75000,
    },
    idealCandidate: {
      leadership: 94,
      sales: 88,
      operations: 82,
      financial: 84,
      relationshipBuilding: 93,
      coachability: 96,
    },
    businessModel: {
      recurringRevenue: true,
      ownerOperator: true,
      executiveModel: true,
      homeBased: true,
      b2b: true,
      b2c: false,
    },
    operatingModel: {
      teamModel: "small-team",
      salesIntensity: 86,
      operationalIntensity: 68,
      scheduleFlexibility: 78,
      primaryCustomer: "Business owners and leadership teams",
    },
    operatingEnvironment: "Home-based or small-office coaching practice with visible local engagement",
    territoryModel: "Locally developed coaching practice serving owners and leadership teams",
    trainingSupport: {
      initialTraining: "Curated demo profile: coaching framework, facilitation, and practice launch",
      launchSupport: "Curated demo profile: local visibility and client-acquisition planning",
      ongoingSupport: "Curated demo profile: coaching community and practice-development support",
      technologySupport: "Curated demo profile: coaching delivery and client-management tools",
    },
    culture: ["Coaching-led", "Accountability-oriented", "Collaborative", "Visible local leadership"],
    successTraits: ["Develops other leaders", "Confident facilitation", "Comfort holding owners accountable"],
    poorFitTraits: ["Avoids public leadership", "Prefers analytical work without coaching", "Low interest in local visibility"],
    strengths: [
      "Leadership coaching",
      "Business development",
      "Executive communication",
    ],
    considerations: ["Comfort coaching owners", "Local market visibility"],
    discoveryQuestions: [
      "What attracts you to developing other business leaders?",
      "How have you held senior leaders accountable for results?",
    ],
    aiNotes: ["Strong fit for experienced leaders with a coaching mindset."],
    tags: ["coaching", "b2b", "leadership", "home-based"],
  },
  {
    id: "routewise-mobile-services",
    name: "RouteWise Mobile Services",
    demoClassification: "curated-demo-concept",
    shortDescription: "Curated mobile-service concept built around repeat residential routes, visible local service, and hands-on ownership.",
    category: "Mobile Consumer Services",
    referralContact: { name: "Demo Franchise Development", email: "routewise@example.com", title: "Curated Demo Contact" },
    investment: { minimum: 65000, maximum: 125000, liquidCapitalMinimum: 55000 },
    idealCandidate: { leadership: 72, sales: 68, operations: 84, financial: 68, relationshipBuilding: 74, coachability: 88 },
    businessModel: { recurringRevenue: true, ownerOperator: true, executiveModel: false, homeBased: true, b2b: false, b2c: true },
    operatingModel: { teamModel: "solo", salesIntensity: 68, operationalIntensity: 86, scheduleFlexibility: 66, primaryCustomer: "Local homeowners on recurring service routes" },
    operatingEnvironment: "Home-based dispatch with mobile, in-market service delivery",
    territoryModel: "Defined local service area built route by route",
    trainingSupport: {
      initialTraining: "Curated concept: service standards, routing, safety, and customer care",
      launchSupport: "Curated concept: route launch and neighborhood acquisition plan",
      ongoingSupport: "Curated concept: operating benchmarks and recurring-customer coaching",
      technologySupport: "Curated concept: scheduling, routing, and membership administration",
    },
    culture: ["Hands-on", "Service-minded", "Locally accountable", "Process-oriented"],
    successTraits: ["Enjoys visible customer service", "Follows repeatable field processes", "Builds neighborhood trust"],
    poorFitTraits: ["Wants a purely strategic role", "Avoids field operations", "Requires a Monday-to-Friday executive schedule"],
    strengths: ["Recurring local routes", "Lower-capital entry", "Direct customer feedback"],
    considerations: ["Owner begins close to daily service delivery", "Route density takes deliberate local execution"],
    discoveryQuestions: ["How much hands-on field involvement do you want during launch?", "How do you feel about building repeat customers neighborhood by neighborhood?"],
    aiNotes: ["Curated demo contrast: lower-capital, consumer-facing, operational owner-operator."],
    tags: ["curated-demo", "b2c", "mobile-service", "owner-operator", "recurring-revenue", "lower-capital"],
  },
  {
    id: "brightpath-home-services",
    name: "BrightPath Home Services",
    demoClassification: "curated-demo-concept",
    shortDescription: "Curated manager-led home-services concept combining local consumer demand, technicians, and membership-style revenue.",
    category: "Residential Services",
    referralContact: { name: "Demo Franchise Development", email: "brightpath@example.com", title: "Curated Demo Contact" },
    investment: { minimum: 190000, maximum: 340000, liquidCapitalMinimum: 150000 },
    idealCandidate: { leadership: 90, sales: 66, operations: 94, financial: 84, relationshipBuilding: 76, coachability: 90 },
    businessModel: { recurringRevenue: true, ownerOperator: false, executiveModel: true, homeBased: false, b2b: false, b2c: true },
    operatingModel: { teamModel: "team-led", salesIntensity: 62, operationalIntensity: 94, scheduleFlexibility: 52, primaryCustomer: "Local homeowners needing scheduled and urgent services" },
    operatingEnvironment: "Local service hub coordinating technicians, vehicles, and customer appointments",
    territoryModel: "Defined local consumer territory dependent on density and reputation",
    trainingSupport: {
      initialTraining: "Curated concept: service operations, team leadership, and customer experience",
      launchSupport: "Curated concept: technician recruiting and local-market activation",
      ongoingSupport: "Curated concept: operating scorecards and field-team coaching",
      technologySupport: "Curated concept: dispatch, scheduling, membership, and review management",
    },
    culture: ["Team-led", "Fast-response", "Operationally disciplined", "Customer-first"],
    successTraits: ["Leads frontline teams", "Uses operating metrics", "Stays composed when schedules change"],
    poorFitTraits: ["Avoids people management", "Seeks a solo practice", "Needs maximum schedule flexibility"],
    strengths: ["Manager-led growth path", "Recurring service memberships", "Tangible local demand"],
    considerations: ["Technician recruiting and retention", "Service schedules can include urgent customer needs"],
    discoveryQuestions: ["What experience do you have leading frontline service teams?", "How much operating complexity and schedule variability do you want?"],
    aiNotes: ["Curated demo contrast: staffing-heavier, operationally complex, consumer-facing manager model."],
    tags: ["curated-demo", "b2c", "home-services", "manager-led", "staffing-heavier", "recurring-revenue"],
  },
  {
    id: "harbor-and-hound-market",
    name: "Harbor & Hound Market",
    demoClassification: "curated-demo-concept",
    shortDescription: "Curated premium pet retail and service concept requiring a physical location, a larger team, and daily consumer operations.",
    category: "Retail & Pet Services",
    referralContact: { name: "Demo Franchise Development", email: "harborandhound@example.com", title: "Curated Demo Contact" },
    investment: { minimum: 425000, maximum: 700000, liquidCapitalMinimum: 300000 },
    idealCandidate: { leadership: 86, sales: 58, operations: 96, financial: 92, relationshipBuilding: 82, coachability: 84 },
    businessModel: { recurringRevenue: false, ownerOperator: true, executiveModel: false, homeBased: false, b2b: false, b2c: true },
    operatingModel: { teamModel: "team-led", salesIntensity: 56, operationalIntensity: 97, scheduleFlexibility: 34, primaryCustomer: "Local pet owners purchasing retail products and scheduled services" },
    operatingEnvironment: "Brick-and-mortar retail and service location with daily staffing and inventory",
    territoryModel: "Trade-area retail concept dependent on site selection and local traffic",
    trainingSupport: {
      initialTraining: "Curated concept: retail operations, service standards, inventory, and team leadership",
      launchSupport: "Curated concept: site-opening plan, hiring, and community launch",
      ongoingSupport: "Curated concept: merchandising, service quality, and store-performance coaching",
      technologySupport: "Curated concept: point-of-sale, booking, inventory, and loyalty tools",
    },
    culture: ["Community-facing", "Retail-paced", "Team-oriented", "Hospitality-minded"],
    successTraits: ["Enjoys daily consumer interaction", "Manages inventory and labor", "Builds a destination local business"],
    poorFitTraits: ["Requires home-based work", "Avoids weekend retail rhythms", "Wants low staffing and low fixed costs"],
    strengths: ["Visible community presence", "Multiple consumer purchase occasions", "Retail and service mix"],
    considerations: ["High initial capital requirement", "Daily staffing, inventory, and retail schedule complexity"],
    discoveryQuestions: ["How do you feel about managing a physical location and weekend coverage?", "What is your appetite for inventory, staffing, and site-dependent risk?"],
    aiNotes: ["Curated demo contrast: higher-capital brick-and-mortar with transactional local-consumer demand."],
    tags: ["curated-demo", "b2c", "brick-and-mortar", "retail", "higher-capital", "staffing-heavier", "transactional"],
  },
];

export function getDemoBrandById(id: string): BrandProfile {
  const brand = demoBrands.find((item) => item.id === id);

  if (!brand) {
    throw new Error(`Unknown demo brand: ${id}`);
  }

  return brand;
}
