export type AuthActionField = "email" | "password" | "confirmPassword";

export type ActionResult<TField extends string = AuthActionField> =
  | { status: "idle"; message?: never; fieldErrors?: never }
  | {
      status: "error";
      message: string;
      fieldErrors?: Partial<Record<TField, string[]>>;
    }
  | { status: "success"; message: string; fieldErrors?: never };

export const initialActionResult: ActionResult = { status: "idle" };
