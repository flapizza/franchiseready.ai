import type { TeamCandidateAssignment, TeamMemberProfile, TeamWorkSignal } from "../models/TeamMissionControlState";

export interface TeamOperationsRepository {
  getViewer(): Promise<TeamMemberProfile>;
  getMembers(): Promise<TeamMemberProfile[]>;
  getCandidateAssignments(): Promise<TeamCandidateAssignment[]>;
  getWorkSignals(): Promise<TeamWorkSignal[]>;
}
