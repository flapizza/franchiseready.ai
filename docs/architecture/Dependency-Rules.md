# FranchiseReady AI
## Dependency Rules

Version: FP005.2

---

# Purpose

This document defines the allowed dependencies within FranchiseReady AI.

The objective is to prevent:

- Circular dependencies
- Business logic inside UI
- Repository leakage
- AI duplication
- Tight coupling

Every feature should be able to evolve independently.

---

# Layer Hierarchy

Presentation

↓

Workspace Runtime

↓

AI Engine

↓

Repository

↓

Database

Dependencies always flow downward.

Never upward.

---

# Allowed Dependencies

## Presentation Layer

May depend on

✓ Runtime

✓ Presentation Models

✓ UI Components

Must NOT depend on

✗ Repository

✗ Database

✗ Supabase

✗ AI Engines

---

## Workspace Runtime

May depend on

✓ Repository

✓ AI Engines

✓ Domain Models

✓ View Models

Must NOT depend on

✗ React

✗ Browser APIs

✗ UI Components

---

## AI Engines

May depend on

✓ Domain Models

✓ Pure utility functions

Must NOT depend on

✗ React

✗ Repository

✗ Supabase

✗ Browser APIs

AI Engines should be deterministic.

The same input should always produce the same output.

---

## Repositories

May depend on

✓ Database

✓ External APIs

✓ Storage

Must NOT depend on

✗ React

✗ Components

✗ AI Engines

Repositories only retrieve and persist data.

---

## Database Layer

Owns

- Supabase

- Storage

- Realtime

- Authentication

Nothing below this layer exists.

---

# Feature Dependencies

## Assessment

May depend on

Shared UI

Shared Utilities

Must NOT depend on

Brand Strategy

Referral Package

Mission Control

---

## Discovery

May depend on

Assessment

Shared UI

Must NOT depend on

Referral Package

Mission Control

---

## Intelligence

May depend on

Assessment

Discovery

Shared Utilities

Must NOT depend on

CRM UI

Mission Control

Referral UI

---

## Brand Strategy

May depend on

Candidate Intelligence

Candidate Models

Must NOT depend on

Mission Control

Referral Package

---

## Referral Package

May depend on

Candidate Intelligence

Brand Recommendation

Candidate Models

Must NOT depend on

Discovery UI

Mission Control

---

## CRM

May depend on

Candidate Repository

Shared UI

Must NOT depend on

Brand Recommendation Engine

Referral Package Engine

CRM consumes results.

It does not generate AI reasoning.

---

# Import Rules

## Protected Route and Server Action Composition Boundary

Protected routes and server actions must obtain persistence and integration
dependencies from the server-only workspace composition root.

They must not directly construct or import:

- Demo or seed repositories and process-local stores
- Supabase or other production repository adapters
- Provider-specific persistence or delivery adapters
- Demo consultant, demo team, or conference-store identity as authorization

Server actions are independent entry points. They must resolve the workspace
composition again, authorize the actor and resource through that boundary, and
then call the selected service. A page-level check is not inherited by an
action.

Demo and production selection is explicit and fail-closed. Production errors,
missing implementations, provider configuration, authorization, entitlement,
usage allowance, and consent/compliance are separate states. None may cause a
production request to fall back to demo data.

Protected route and server-action migration is complete. Direct dependency
selection is permitted only in explicit demo composition/factory modules,
fixtures and tests, and safeguarded demo-only reset/failure/test endpoints.
Production-backed routes must not use a demo implementation when resolution or
a production dependency fails.

Allowed composition ownership:

- `feature/platform/composition` owns workspace session and composition
  contracts.
- Demo and production composition adapters own concrete dependency selection.
- Repository implementations remain owned by their features.

The composition contract itself must remain server-only and must not import a
concrete repository or provider adapter.

Preferred

import { CandidateRepository }
from "@/feature/crm";

Avoid

import { CandidateRepository }
from "@/feature/crm/repositories/CandidateRepository";

Each feature should expose its public API through index.ts.

---

# Public API Rule

Every feature owns its internal implementation.

Other features should consume only exports from:

feature/index.ts

Internal folders are private.

---

# Shared Code

Reusable code belongs in

feature/shared

or

lib

Never duplicate utility functions.

Never duplicate UI primitives.

---

# Circular Dependency Rule

Feature A

↓

Feature B

↓

Feature C

Feature C must NEVER import Feature A.

If this occurs:

Extract the shared abstraction.

---

# Runtime Ownership

One screen

↓

One runtime

One runtime

↓

One state object

Never have multiple runtimes competing for the same screen.

---

# AI Ownership

Each AI capability has exactly one owner.

Examples

Candidate Intelligence

↓

Intelligence Feature

Brand Recommendation

↓

Brand Strategy

Referral Generation

↓

Referral Package

No duplicate reasoning.

---

# Repository Ownership

Every business entity has exactly one repository.

Examples

Candidate

↓

Candidate Repository

Task

↓

Task Repository

Meeting

↓

Meeting Repository

Avoid repositories that span multiple unrelated domains.

---

# View Models

Presentation models should never be reused as business models.

Example

CandidateRecord

↓

Candidate360Runtime

↓

Candidate360State

Candidate360State belongs only to rendering.

---

# Future Integrations

When integrating

Google Calendar

Gmail

Microsoft 365

Territory APIs

LLMs

Those integrations belong inside repositories or dedicated integration services.

They never belong inside components.

---

# Architectural Decision

When uncertain where code belongs, ask:

1. Is it rendering?

Presentation Layer.

2. Is it orchestrating?

Runtime.

3. Is it reasoning?

AI Engine.

4. Is it retrieving data?

Repository.

5. Is it infrastructure?

Database / Integration.

Those five questions should determine the correct location for nearly every new piece of code.
