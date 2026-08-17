# Supporting feature boundary

This package owns live-meeting copilot analysis and presentation state. The
candidate discovery lifecycle, session state, rules, and workspace orchestration
are canonical in `feature/discovery`. This package may consume meeting
intelligence but must not become a second discovery lifecycle runtime.
