import "server-only";

import { authFailure } from "@/feature/auth/utils/errors";
import type { ActionResult } from "@/feature/auth/types/actions";

export async function runAuthAction<TField extends string>(
  actionName: string,
  operation: () => Promise<ActionResult<TField>>,
): Promise<ActionResult<TField>> {
  try {
    return await operation();
  } catch (error) {
    console.error(`Unexpected authentication action failure: ${actionName}`, error);
    return authFailure<TField>("unexpected");
  }
}
