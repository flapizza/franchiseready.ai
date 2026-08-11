# FranchiseReady AI
## Architecture Blueprint

Version: FP005.2

---

# Vision

FranchiseReady AI is an AI Operating System for Franchise Consultants.

The platform is designed to guide candidates from first contact through
franchise award while allowing AI to continuously build institutional
knowledge about every candidate.

The system is intentionally designed so that business logic is owned by
runtimes and AI engines rather than user interface components.

---

# Core Principles

## 1. Runtime Owns Business Logic

React components render data.

React components do not make business decisions.

Business decisions belong inside Runtime classes and AI Engines.

---

## 2. One Owner Per Domain

Every business concept has one owner.

Examples:

Assessment
Discovery
Candidate Intelligence
CRM
Brand Strategy
Referral Package

Other features consume those domains rather than recreating them.

---

## 3. Repository Pattern

No UI component communicates directly with Supabase.

All persistence flows through repositories.

Repository

↓

Seed Repository

↓

Supabase Repository

---

## 4. AI Pipeline

Assessment

↓

Discovery

↓

Candidate Intelligence

↓

Brand Strategy

↓

Referral Package

↓

Franchisor Introduction

↓

Award

Every AI feature builds upon previous knowledge.

---

# Layered Architecture

Presentation Layer

↓

Workspace Runtime Layer

↓

AI Engine Layer

↓

Repository Layer

↓

Data Layer

---

# Presentation Layer

Responsible for:

- Pages
- Components
- Rendering
- User interaction

Never owns business logic.

---

# Workspace Runtime Layer

Responsible for:

- Aggregating state
- Calling repositories
- Calling AI engines
- Producing presentation state

Examples:

AssessmentRuntime

DiscoveryWorkspaceRuntime

MissionControlRuntime

Candidate360Runtime

Future:

CandidateWorkspaceRuntime

---

# AI Engine Layer

Responsible for:

- AI reasoning
- Recommendations
- Scoring
- Summaries
- Buying signals
- Executive insights

Examples:

CandidateIntelligenceEngine

BrandRecommendationEngine

ReferralPackageEngine

ExecutiveRecommendationEngine

DailyBriefEngine

---

# Repository Layer

Responsible for data access.

Every business domain should expose:

Repository

↓

SeedRepository

↓

SupabaseRepository

Repositories never contain presentation logic.

---

# Data Layer

Current

Seed Data

Future

Supabase

Realtime

Storage

Authentication

---

# Dependency Rules

Allowed

Presentation

↓

Runtime

↓

Engine

↓

Repository

↓

Database

Forbidden

Presentation

↓

Database

Presentation

↓

Supabase

Component

↓

Repository

Engine

↓

React

Engine

↓

Supabase

---

# Feature Structure

Every feature should follow the same structure whenever practical.

feature/

    components/

    models/

    runtime/

    repositories/

    services/

    hooks/

    data/

    index.ts

Not every feature requires every folder, but the structure should be
consistent.

---

# Product Goals

The platform should:

- Increase franchise consultant productivity

- Increase franchise award rates

- Reduce repetitive work

- Preserve institutional knowledge

- Continuously improve AI recommendations

---

# Engineering Goals

Every commit builds.

Every feature has one owner.

Every runtime has one responsibility.

Every engine performs one type of reasoning.

Every repository owns persistence.

No duplicated business logic.

No duplicated AI reasoning.

---

# Long-Term Vision

FranchiseReady AI is not intended to become another CRM.

It is intended to become the operating system that powers every aspect
of franchise consulting.

The CRM exists to support the AI.

The AI is the product.