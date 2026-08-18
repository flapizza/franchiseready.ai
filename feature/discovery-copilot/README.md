# Supporting feature boundary

This package owns live-meeting copilot analysis and presentation state. The
candidate discovery lifecycle, session state, rules, and workspace orchestration
are canonical in `feature/discovery`. This package may consume meeting
intelligence but must not become a second discovery lifecycle runtime.

## Candidate Discovery workflow

The canonical workspace uses the typed flow `pre-meeting -> live -> post-meeting`. This is session/presentation state, not a replacement for `Candidate.pipelineStage`. Later-stage candidates open directly in post-meeting history; Assessment Complete candidates enter the existing `discovery` lifecycle stage through `CandidateLifecycleService` before live mode.

`DiscoveryExperienceRuntime` derives the 60-second brief, evidence objectives, primary and secondary questions, signals, risks, and completion recommendation from canonical Candidate Intelligence and scenario evidence. Objective states are `validated`, `partial`, `needs-validation`, or `unknown`, with traceable evidence sources. Exactly one unresolved objective drives the primary question. Asked records conversational progress but does not validate evidence without an answer; skipped questions remain subordinate suggestions.

Ending the deterministic demo meeting changes only the workspace phase. Post-meeting lifecycle advancement delegates to `CandidateLifecycleService`, preserving the canonical Validation-versus-Brand-Strategy decision. Mission Control briefing links redirect into this same workspace, while Completed queue records render its historical post-meeting state.

Future integrations should implement `meeting provider transcript/events -> meeting intelligence -> Discovery evidence -> canonical Candidate Intelligence`. A future AI adapter may replace deterministic question selection, evidence extraction, signal/risk classification, and summarization behind the runtime model without coupling those capabilities to JSX.
