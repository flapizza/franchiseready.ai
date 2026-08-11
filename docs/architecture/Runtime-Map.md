# FranchiseReady AI
## Runtime Map

Version: FP005.2

---

# Purpose

Runtimes coordinate the application.

A runtime is responsible for:

- Loading data from repositories
- Calling AI engines
- Aggregating state
- Returning presentation-ready models

A runtime is NOT responsible for:

- Rendering UI
- Storing data
- AI reasoning
- Database communication

---

# Runtime Architecture

Presentation

↓

Runtime

↓

AI Engines

↓

Repositories

↓

Supabase / Seed Data

---

# Assessment Runtime

Owns

- Assessment flow
- Question navigation
- Response collection
- Assessment state

Consumes

Assessment Repository

Produces

Assessment State

Used By

Assessment Pages

---

# Discovery Workspace Runtime

Owns

- Discovery Session

- Discovery Memory

- Discovery Timeline

- Discovery Summary

- Discovery Copilot

Consumes

Discovery Repository

Assessment Results

Produces

Discovery Workspace State

Used By

Discovery Workspace

Discovery Copilot

Meeting Summary

---

# Candidate360 Runtime

Owns

- Candidate Profile

- Timeline

- Executive Summary

- Readiness

- AI Snapshot

Consumes

Candidate Repository

Candidate Intelligence

Produces

Candidate360 State

Used By

Candidate360 Page

---

# Mission Control Runtime

Owns

- Dashboard KPIs

- Daily Brief

- Priority Queue

- Today's Meetings

- Activity Feed

Consumes

Candidate Repository

Task Repository

Candidate Intelligence

Produces

MissionControl State

Used By

Mission Control

---

# Brand Strategy Runtime

Owns

- Brand Recommendations

- Evidence

- Consultant Notes

- Talking Points

Consumes

Candidate Intelligence

Produces

Brand Recommendation State

Used By

Brand Strategy Workspace

---

# Referral Package Runtime

Owns

- Referral Summary

- Consultant Recommendation

- Candidate Snapshot

Consumes

Candidate Intelligence

Brand Recommendation

Produces

Referral Package

Used By

Referral Preview

PDF Export

---

# Future Candidate Workspace Runtime

Purpose

Become the orchestration runtime for the complete candidate lifecycle.

Consumes

Candidate Repository

Discovery Workspace Runtime

Candidate Intelligence Engine

Brand Recommendation Engine

Referral Package Engine

Produces

Candidate Workspace State

Used By

Mission Control

Candidate360

Brand Strategy

Referral Package

Future Consultant Workspace

---

# Runtime Rules

Every runtime should expose one primary method.

Preferred

public async build(...)

Alternative

public async execute(...)

Avoid

Multiple unrelated public methods.

---

# Runtime Responsibilities

A runtime MAY

✓ Load repositories

✓ Call AI engines

✓ Aggregate state

✓ Cache state

✓ Transform models

A runtime MUST NOT

✗ Render UI

✗ Talk directly to React

✗ Access browser APIs

✗ Own business rules already implemented by an AI engine

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

Repository

Presentation

↓

Supabase

Engine

↓

React

Repository

↓

Component

---

# Long-Term Runtime Pipeline

Candidate Repository

↓

Assessment Runtime

↓

Discovery Workspace Runtime

↓

Candidate Intelligence Engine

↓

Brand Recommendation Engine

↓

Referral Package Engine

↓

Candidate Workspace Runtime

↓

Presentation Layer

---

# Runtime Philosophy

Every runtime should answer one question:

"What state does this screen need?"

Nothing more.

Nothing less.