import type { ActionResult, AuthActionField } from "@/feature/auth/types/actions";

type AuthErrorKind = "signIn" | "signUp" | "updatePassword" | "unexpected";

const authErrorMessages: Record<AuthErrorKind, string> = {
  signIn: "We could not sign you in with those details. Please try again.",
  signUp: "We could not create your account. Please try again.",
  updatePassword: "We could not update your password. Please request a new recovery link and try again.",
  unexpected: "Something went wrong. Please try again.",
};

export function authFailure<TField extends string = AuthActionField>(
  kind: AuthErrorKind,
  fieldErrors?: Partial<Record<TField, string[]>>,
): ActionResult<TField> {
  return {
    status: "error",
    message: authErrorMessages[kind],
    fieldErrors,
  };
}

export function validationFailure<TField extends string>(
  fieldErrors: Partial<Record<TField, string[]>>,
): ActionResult<TField> {
  return {
    status: "error",
    message: "Please correct the highlighted fields.",
    fieldErrors,
  };
}

export function authSuccess(message: string): ActionResult {
  return { status: "success", message };
}
