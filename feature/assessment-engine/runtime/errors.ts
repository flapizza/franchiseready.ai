/**
 * Base error for all runtime failures.
 */
export class AssessmentRuntimeError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AssessmentRuntimeError";
  }
}

/**
 * Thrown when navigation attempts are invalid.
 */
export class InvalidNavigationError extends AssessmentRuntimeError {
  constructor(message: string) {
    super(message);
    this.name = "InvalidNavigationError";
  }
}

/**
 * Thrown when an invalid lifecycle transition is attempted.
 */
export class InvalidStateTransitionError extends AssessmentRuntimeError {
  constructor(from: string, to: string) {
    super(`Cannot transition runtime from "${from}" to "${to}".`);
    this.name = "InvalidStateTransitionError";
  }
}

/**
 * Thrown when a response fails validation.
 */
export class InvalidResponseError extends AssessmentRuntimeError {
  constructor(message: string) {
    super(message);
    this.name = "InvalidResponseError";
  }
}

/**
 * Thrown when an assessment is finalized before completion.
 */
export class IncompleteAssessmentError extends AssessmentRuntimeError {
  constructor() {
    super("Assessment cannot be finalized until all required questions are complete.");
    this.name = "IncompleteAssessmentError";
  }
}