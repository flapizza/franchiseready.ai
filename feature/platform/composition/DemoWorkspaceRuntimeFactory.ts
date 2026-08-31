import "server-only";

import { CandidateBrandStrategyRuntime } from "@/feature/brand-strategy/runtime/CandidateBrandStrategyRuntime";
import { CalendarRuntime } from "@/feature/calendar/runtime/CalendarRuntime";
import { CalendarService } from "@/feature/calendar/services/CalendarService";
import { EmailCommunicationRuntime } from "@/feature/communications/runtime/EmailCommunicationRuntime";
import { Candidate360Runtime } from "@/feature/candidate-360/runtime/Candidate360Runtime";
import { CandidateCRMRuntime } from "@/feature/crm/runtime/CandidateCRMRuntime";
import { demoCandidateOverlayStore } from "@/feature/crm/repositories/DemoCandidateOverlayStore";
import { AssessmentInvitationService } from "@/feature/crm/services/AssessmentInvitationService";
import { createDemoCandidateLifecycleService } from "@/feature/crm/services/DemoCandidateLifecycleService";
import { demoConsultant } from "@/feature/demo/data/demoConsultant";
import { getConferenceReferralHistory } from "@/feature/demo/data/conferenceReferralHistory";
import { CandidateEngagementPlaybookService } from "@/feature/engagement-playbook/services/CandidateEngagementPlaybookService";
import { MissionControlRuntime } from "@/feature/mission-control/runtime/MissionControlRuntime";
import { PipelineConfigurationService } from "@/feature/pipeline/services/PipelineConfigurationService";
import { CandidatePipelineStageService } from "@/feature/pipeline/services/CandidatePipelineStageService";
import { CandidateReferralService } from "@/feature/referral-package/services/CandidateReferralService";
import { ReferralStudioRuntime } from "@/feature/referral-package/runtime/ReferralStudioRuntime";
import { TaskRuntime } from "@/feature/tasks/runtime/TaskRuntime";
import { TaskService } from "@/feature/tasks/services/TaskService";
import { CommunicationsWorkspaceRuntime } from "@/feature/communications/runtime/CommunicationsWorkspaceRuntime";
import { EmailMessageService } from "@/feature/communications/services/EmailMessageService";
import { TeamMissionControlRuntime } from "@/feature/team-mission-control/runtime/TeamMissionControlRuntime";
import { BrandIntelligenceRuntime } from "@/feature/brand-library/runtime/BrandIntelligenceRuntime";
import { StrategyBuilderService } from "@/feature/brand-strategy/services/StrategyBuilderService";
import { DemoAssessmentCompletionService } from "@/feature/assessment-engine/services/DemoAssessmentCompletionService";
import { conferenceDemoNow } from "@/feature/demo/time/conferenceDemoClock";

import type { DemoWorkspaceDependencies } from "./DemoWorkspaceComposition";

export class DemoWorkspaceRuntimeFactory {
  public constructor(private readonly dependencies: DemoWorkspaceDependencies) {}

  public createEngagementPlaybook(): CandidateEngagementPlaybookService {
    return new CandidateEngagementPlaybookService({
      candidates: this.dependencies.candidates,
      decisions: this.dependencies.engagementPlaybook,
      email: this.emailRuntime(),
      calendar: this.dependencies.calendar,
      tasks: this.dependencies.tasks,
      strategy: this.brandStrategyRuntime(),
      referrals: new CandidateReferralService(),
    });
  }

  public createMissionControl(): MissionControlRuntime {
    return new MissionControlRuntime({
      scenarioRepository: this.dependencies.scenarios,
      brandRepository: this.dependencies.brands,
      candidateRepository: this.dependencies.candidates,
      playbooks: this.createEngagementPlaybook(),
      tasks: new TaskRuntime(this.dependencies.tasks, this.dependencies.candidates, conferenceDemoNow),
      calendar: new CalendarRuntime(this.dependencies.calendar, this.dependencies.candidates, conferenceDemoNow),
      email: this.emailRuntime(),
      consultantId: demoConsultant.id,
      referrals: (candidateId) => demoCandidateOverlayStore.getCandidateReferrals(candidateId),
      strategy: (candidateId) => demoCandidateOverlayStore.getStrategy(candidateId),
      presenterCandidateId: "candidate-demo",
    });
  }

  public createCandidateCRM(): CandidateCRMRuntime {
    return new CandidateCRMRuntime({
      candidates: this.dependencies.candidates,
      scenarios: this.dependencies.scenarios,
      brands: this.dependencies.brands,
      invitations: new AssessmentInvitationService(this.dependencies.candidates),
      pipelineService: this.pipelineService(),
      tasks: this.dependencies.tasks,
      lifecycle: createDemoCandidateLifecycleService(this.dependencies.candidates),
      consultantId: demoConsultant.id,
      referrals: (candidateId) => demoCandidateOverlayStore.getCandidateReferrals(candidateId),
      referralHistory: getConferenceReferralHistory,
    });
  }

  public createCandidate360(): Candidate360Runtime {
    return new Candidate360Runtime({
      candidates: this.dependencies.candidates,
      rootOnly: false,
      demo: {
        scenarios: this.dependencies.scenarios,
        activities: this.dependencies.candidateActivities,
        calendar: this.dependencies.calendar,
        pipeline: this.pipelineService(),
        invitations: new AssessmentInvitationService(this.dependencies.candidates),
        lifecycle: createDemoCandidateLifecycleService(this.dependencies.candidates),
        referrals: (candidateId) => demoCandidateOverlayStore.getCandidateReferrals(candidateId),
        referralHistory: getConferenceReferralHistory,
        strategy: this.brandStrategyRuntime(),
        email: this.emailRuntime(),
        emailEvents: this.dependencies.emailMessages,
        consultant: demoConsultant,
        now: conferenceDemoNow,
      },
    });
  }

  public loadCandidateTasks(candidateId: string) {
    return new TaskRuntime(this.dependencies.tasks, this.dependencies.candidates, conferenceDemoNow)
      .forCandidate(demoConsultant.id, candidateId);
  }

  public createTasks() { return new TaskRuntime(this.dependencies.tasks, this.dependencies.candidates, conferenceDemoNow); }
  public createTaskService() { return new TaskService(this.dependencies.tasks, this.dependencies.candidates, this.dependencies.candidateActivities); }
  public createCalendar() { return new CalendarRuntime(this.dependencies.calendar, this.dependencies.candidates, conferenceDemoNow); }
  public createCalendarService() { return new CalendarService(this.dependencies.calendar, this.dependencies.candidates, this.dependencies.candidateActivities); }
  public createPipeline() { return this.pipelineService(); }
  public createCandidatePipelineStageService() { return new CandidatePipelineStageService(this.dependencies.pipeline, this.dependencies.candidates, this.dependencies.candidateActivities); }
  public createCandidateLifecycle() { return createDemoCandidateLifecycleService(this.dependencies.candidates); }
  public createCommunications() { return new CommunicationsWorkspaceRuntime(this.dependencies.candidates, this.dependencies.emailMessages, this.emailRuntime()); }
  public createEmailMessageService() { return new EmailMessageService(this.dependencies.emailMessages, this.dependencies.emailDelivery, this.dependencies.candidates); }
  public createBrandIntelligence() { return new BrandIntelligenceRuntime(this.dependencies.brands); }
  public createBrandStrategy() { return this.brandStrategyRuntime(); }
  public createStrategyBuilder() { return new StrategyBuilderService(this.brandStrategyRuntime(), this.dependencies.candidateActivities); }
  public createReferralService() { return new CandidateReferralService(); }
  public createReferralStudio() { const service = this.createReferralService(); return new ReferralStudioRuntime(service, this.dependencies.candidates, this.brandStrategyRuntime()); }
  public createTeamMissionControl() { return new TeamMissionControlRuntime(this.dependencies.teamOperations, this.dependencies.scenarios); }
  public createAssessmentInvitations() { return new AssessmentInvitationService(this.dependencies.candidates); }
  public createAssessmentCompletion() { return new DemoAssessmentCompletionService(this.dependencies.candidates, this.dependencies.candidateResolution, this.dependencies.intelligence); }
  public get consultant() { return demoConsultant; }

  private emailRuntime(): EmailCommunicationRuntime {
    return new EmailCommunicationRuntime(this.dependencies.emailMessages);
  }

  private brandStrategyRuntime(): CandidateBrandStrategyRuntime {
    return new CandidateBrandStrategyRuntime(
      this.dependencies.candidates,
      this.dependencies.brands,
      this.dependencies.scenarios,
    );
  }

  private pipelineService(): PipelineConfigurationService {
    return new PipelineConfigurationService(
      this.dependencies.pipeline,
      this.dependencies.candidates,
    );
  }
}
