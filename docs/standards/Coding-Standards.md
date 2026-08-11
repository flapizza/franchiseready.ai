# FranchiseReady AI
## Coding Standards

Version: FP005.2

---

# Purpose

These standards exist to keep FranchiseReady AI consistent as the
platform grows.

Code should be predictable.

Architecture should be obvious.

Developers should spend time solving business problems rather than
learning different coding styles.

---

# Core Principles

1. Runtime owns business logic.

2. Components render.

3. AI Engines reason.

4. Repositories persist.

5. Models describe data.

---

# Folder Structure

Every feature should follow this structure whenever practical.

feature/

    components/

    models/

    runtime/

    repositories/

    services/

    hooks/

    data/

    index.ts

Folders may be omitted if unused.

Do not invent new folder conventions.

---

# Naming

Components

CandidateCard.tsx

MissionControlPage.tsx

BrandStrategyWorkspace.tsx

Always PascalCase.

---

Runtime

AssessmentRuntime

MissionControlRuntime

Candidate360Runtime

Always end with Runtime.

---

AI Engines

CandidateIntelligenceEngine

BrandRecommendationEngine

ReferralPackageEngine

Always end with Engine.

---

Repositories

CandidateRepository

TaskRepository

MeetingRepository

Implementations

SeedCandidateRepository

SupabaseCandidateRepository

Always end with Repository.

---

Models

CandidateRecord

ReferralPackage

DiscoverySession

Always singular.

---

Types

Prefer interfaces for public models.

Use type aliases only for:

- unions
- mapped types
- utility types

---

# React

Use functional components only.

Never use class components.

---

Prefer

function Component()

instead of

const Component = () =>

for exported components.

---

Props

Always define explicit Props.

Example

type Props = {
    candidate: CandidateRecord;
};

Never use any.

---

Component Size

Target

150–250 lines

Maximum

400 lines

If larger:

Extract components.

---

Business Logic

Business logic does NOT belong inside React.

Bad

const score = calculate(...)

inside JSX.

Good

Runtime calculates.

Component renders.

---

State

Use React state only for UI concerns.

Examples

Modal open

Dropdown

Search text

Do NOT use React state for business state.

Business state belongs inside Runtime.

---

Async Logic

Never fetch directly from components.

Bad

Component

↓

Repository

Good

Component

↓

Runtime

↓

Repository

---

Repositories

Repositories should be thin.

Repositories should

Read

Write

Delete

Search

Repositories should NOT

Calculate readiness

Recommend brands

Generate summaries

Infer buying signals

---

AI Engines

AI Engines should be pure.

Same input

↓

Same output

Avoid hidden state.

Avoid side effects.

---

Runtime

One runtime

↓

One screen

One runtime

↓

One presentation model

---

Presentation Models

Presentation models exist only for rendering.

Example

CandidateRecord

↓

Candidate360Runtime

↓

Candidate360State

Candidate360State belongs to Candidate360 only.

---

Imports

Prefer

import {
    CandidateRepository,
} from "@/feature/crm";

Avoid deep imports.

Every feature should expose a clean public API
through index.ts.

---

Styling

Tailwind only.

No inline styles.

No CSS modules unless absolutely necessary.

---

UI Components

Common UI belongs in

feature/ui

Do not duplicate cards, buttons,
badges, layouts, or typography.

---

Icons

Use Lucide.

Keep icon sizes consistent.

Most common

h-4 w-4

h-5 w-5

h-6 w-6

---

Comments

Explain WHY.

Do not explain WHAT.

Bad

// Increment counter

Good

// Candidate confidence is intentionally capped at 100
// to keep recommendation scoring comparable.

---

Functions

Prefer

30 lines or fewer.

Extract helpers.

---

Files

Prefer one exported class
or one exported component
per file.

---

Testing Philosophy

Test business logic.

Avoid testing presentation whenever practical.

Priority

AI Engines

↓

Runtime

↓

Repository

↓

UI

---

Architecture Rule

If unsure where code belongs:

Rendering?

↓

Component

Business orchestration?

↓

Runtime

AI reasoning?

↓

Engine

Persistence?

↓

Repository

Infrastructure?

↓

Supabase

Never violate this rule.

---

Code Review Checklist

Before every commit ask:

✓ Does the project build?

✓ Does the feature already exist?

✓ Am I duplicating business logic?

✓ Am I duplicating UI?

✓ Does the Runtime own orchestration?

✓ Does the Engine own reasoning?

✓ Does the Repository own persistence?

✓ Does the Component only render?

If every answer is yes,

the implementation is likely correct.

---

Project Philosophy

FranchiseReady AI is an AI platform.

The UI exists to expose intelligence.

The Runtime exists to orchestrate workflows.

The AI exists to improve consultant decision-making.

Every engineering decision should support that goal.