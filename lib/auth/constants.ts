export const AUTH_ROUTES = {
  home: "/",
  login: "/login",
  signup: "/signup",
  forgotPassword: "/forgot-password",
  callback: "/auth/callback",
  confirm: "/auth/confirm",
  updatePassword: "/auth/update-password",
} as const;

export const APP_ROUTES = {
  missionControl: "/crm",
  candidates: "/crm/candidates",
  candidateIntelligence: "/crm/candidates",
  discoveryCopilot: "/crm/discovery",
  brandStrategy: "/crm/strategy",
  brandLibrary: "/crm/brands",
  referralStudio: "/crm/referrals",
  insights: "/crm/tasks",
  aiStudio: "/crm/reports",
  settings: "/settings/profile",
  assessment: "/assessment",
  candidate: "/candidate",
  consultant: "/consultant",
  franchisor: "/franchisor",
  admin: "/admin",
  onboarding: "/onboarding",
} as const;

export const PUBLIC_ROUTES = [
  AUTH_ROUTES.home,
  AUTH_ROUTES.login,
  AUTH_ROUTES.signup,
  AUTH_ROUTES.forgotPassword,
  AUTH_ROUTES.callback,
  AUTH_ROUTES.confirm,
  AUTH_ROUTES.updatePassword,
] as const;

export const AUTH_ROUTES_ONLY = [
  AUTH_ROUTES.login,
  AUTH_ROUTES.signup,
  AUTH_ROUTES.forgotPassword,
  AUTH_ROUTES.callback,
  AUTH_ROUTES.confirm,
  AUTH_ROUTES.updatePassword,
] as const;

export const PROTECTED_ROUTE_PREFIXES = [
  APP_ROUTES.missionControl,
  APP_ROUTES.settings,
  APP_ROUTES.assessment,
  APP_ROUTES.onboarding,
  APP_ROUTES.candidate,
  APP_ROUTES.consultant,
  APP_ROUTES.franchisor,
  APP_ROUTES.admin,
] as const;
