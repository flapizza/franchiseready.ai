import type { TeamCandidateAssignment, TeamMemberProfile, TeamWorkSignal } from "../models/TeamMissionControlState";
import type { TeamOperationsRepository } from "./TeamOperationsRepository";

export const demoTeamViewer = { membershipId: "team-manager-jim", role: "manager" as const };

const members: TeamMemberProfile[] = [
  { id: "team-manager-jim", managerId: null, name: "Jim Wood", firstName: "Jim", initials: "JW", role: "manager", roleLabel: "Regional Manager", location: "Carolinas Region" },
  { id: "consultant-avery", managerId: "team-manager-jim", name: "Avery Brooks", firstName: "Avery", initials: "AB", role: "consultant", roleLabel: "Franchise Consultant", location: "Charlotte, NC" },
  { id: "consultant-nina", managerId: "team-manager-jim", name: "Nina Patel", firstName: "Nina", initials: "NP", role: "consultant", roleLabel: "Senior Consultant", location: "Raleigh, NC" },
  { id: "leader-maya", managerId: "team-manager-jim", name: "Maya Chen", firstName: "Maya", initials: "MC", role: "team-leader", roleLabel: "Team Leader", location: "Greensboro, NC" },
  { id: "consultant-leo", managerId: "leader-maya", name: "Leo Grant", firstName: "Leo", initials: "LG", role: "consultant", roleLabel: "Franchise Consultant", location: "Winston-Salem, NC" },
];

const assignments: TeamCandidateAssignment[] = [
  { candidateId: "candidate-demo", memberId: "team-manager-jim" },
  { candidateId: "mike-lavalle", memberId: "consultant-avery" },
  { candidateId: "michael-chen", memberId: "consultant-avery" },
  { candidateId: "david-thompson", memberId: "consultant-avery" },
  { candidateId: "christine-williams", memberId: "consultant-nina" },
  { candidateId: "priya-patel", memberId: "consultant-nina" },
  { candidateId: "elena-rodriguez", memberId: "leader-maya" },
  { candidateId: "robert-king", memberId: "leader-maya" },
  { candidateId: "jared-wirsig", memberId: "consultant-leo" },
  { candidateId: "sarah-williams", memberId: "consultant-leo" },
];

const signals: TeamWorkSignal[] = [
  { id: "team-task-mike", memberId: "consultant-avery", candidateId: "mike-lavalle", kind: "task", title: "Discovery follow-up overdue", detail: "Family alignment remains unresolved before validation.", whenLabel: "Overdue by 1 day", href: "/crm/tasks", overdue: true, highPriority: true },
  { id: "team-meeting-john", memberId: "team-manager-jim", candidateId: "candidate-demo", kind: "meeting", title: "Discovery Call", detail: "Review family alignment and decision timing.", whenLabel: "Today · 11:00 PM", href: "/crm/calendar?event=meeting-john-discovery" },
  { id: "team-task-michael", memberId: "consultant-avery", candidateId: "michael-chen", kind: "task", title: "Prepare Discovery evidence", detail: "Financial goals and assessment evidence need review.", whenLabel: "Today · 2:00 PM", href: "/crm/tasks", highPriority: true },
  { id: "team-meeting-elena", memberId: "leader-maya", candidateId: "elena-rodriguez", kind: "meeting", title: "Ownership questions follow-up", detail: "Recent email engagement created a timely opening.", whenLabel: "Tomorrow · 11:00 AM", href: "/crm/calendar?event=meeting-elena-followup" },
  { id: "team-referral-sarah", memberId: "consultant-leo", candidateId: "sarah-williams", kind: "referral", title: "ERA Group package awaiting review", detail: "Referral package is prepared but still needs consultant approval.", whenLabel: "Waiting 2 days", href: "/crm/candidates/sarah-williams/referral", highPriority: true },
  { id: "team-stage-robert", memberId: "leader-maya", candidateId: "robert-king", kind: "stage-change", title: "Placement awarded", detail: "Prepare the onboarding handoff and preserve referral history.", whenLabel: "Yesterday", href: "/crm/candidates/robert-king" },
  { id: "team-task-christine", memberId: "consultant-nina", candidateId: "christine-williams", kind: "task", title: "Family alignment needs intervention", detail: "Candidate cannot advance until decision stakeholders align.", whenLabel: "Due today", href: "/crm/candidates/christine-williams", highPriority: true },
  { id: "team-meeting-jared", memberId: "consultant-leo", candidateId: "jared-wirsig", kind: "meeting", title: "Brand presentation recap completed", detail: "Candidate reaction and next-step notes are ready for review.", whenLabel: "2 days ago", href: "/crm/calendar?event=meeting-jared-completed" },
];

export class DemoTeamOperationsRepository implements TeamOperationsRepository {
  async getViewer() { return structuredClone(members[0]); }
  async getMembers() { return structuredClone(members); }
  async getCandidateAssignments() { return structuredClone(assignments); }
  async getWorkSignals() { return structuredClone(signals); }
}
