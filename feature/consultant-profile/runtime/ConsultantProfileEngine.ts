import type { ConsultantProfile } from "../models/ConsultantProfile";

export class ConsultantProfileEngine {
  public getDefault(): ConsultantProfile {
    return {
      id: "default",

      companyName: "Franchise Consulting Group",

      consultantName: "Consultant Name",

      title: "Franchise Consultant",

      logoUrl: undefined,

      website: "",

      email: "",

      phone: "",

      linkedInUrl: "",

      schedulingUrl: "",

      calendarName: "",

      primaryColor: "#2563EB",

      secondaryColor: "#0F172A",

      accentColor: "#10B981",

      welcomeMessage:
        "Welcome to our Franchise Discovery Process.",

      brandPromise:
        "Helping people discover franchise opportunities that align with their goals, lifestyle, and long-term vision.",

      assessmentButtonText:
        "Start Assessment",

      reportFooter:
        "Prepared exclusively for this candidate by your Franchise Consultant.",

      emailSignature:
        "Consultant Name\nFranchise Consultant",

      disclaimer:
        "Recommendations are based on candidate information collected during the assessment and discovery process. Final franchise decisions should always be made after completing each franchisor's discovery process.",
    };
  }
}