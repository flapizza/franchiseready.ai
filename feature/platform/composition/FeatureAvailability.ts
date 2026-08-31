import "server-only";

/**
 * A feature can be unavailable for several independent reasons. Keep these
 * dimensions separate: authorization is not an entitlement, and a configured
 * provider does not imply that an implementation or usage allowance exists.
 */
export type ImplementationAvailability =
  | { status: "available" }
  | { status: "not-implemented" };

export type AuthorizationAvailability =
  | { status: "authorized" }
  | { status: "not-authorized" };

export type ProviderAvailability =
  | { status: "configured" }
  | { status: "configuration-required" }
  | { status: "not-applicable" }
  | { status: "not-evaluated" };

export type CommercialEntitlementAvailability =
  | { status: "entitled" }
  | { status: "not-entitled" }
  | { status: "not-evaluated" };

export type UsageAllowanceAvailability =
  | { status: "available" }
  | { status: "limit-reached" }
  | { status: "not-metered" }
  | { status: "not-evaluated" };

export type ComplianceAvailability =
  | { status: "permitted" }
  | { status: "blocked" }
  | { status: "not-applicable" }
  | { status: "not-evaluated" };

export interface FeatureAvailability {
  implementation: ImplementationAvailability;
  authorization: AuthorizationAvailability;
  provider: ProviderAvailability;
  commercialEntitlement: CommercialEntitlementAvailability;
  usageAllowance: UsageAllowanceAvailability;
  consentAndCompliance: ComplianceAvailability;
}

export type WorkspaceFeature =
  | "mission-control"
  | "candidates"
  | "assessments"
  | "discovery"
  | "tasks"
  | "calendar"
  | "communications"
  | "team-mission-control"
  | "brand-intelligence"
  | "brand-strategy"
  | "referrals"
  | "consultant-settings"
  | "pipeline-settings";

export type WorkspaceFeatureAvailability = Readonly<
  Record<WorkspaceFeature, FeatureAvailability>
>;
