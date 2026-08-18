# FranchiseReady AI
## Domain Model

Version: FP005.2

---

# Purpose

This document defines the core business entities used throughout
FranchiseReady AI.

Every business object has exactly one owning feature.

No business model should have multiple competing definitions.

---

# Domain Ownership

| Domain | Owning Feature |
|---------|----------------|
| Candidate | CRM |
| Consultant | CRM |
| Assessment | Assessment |
| Discovery Session | Discovery |
| Discovery Memory | Discovery |
| Candidate Intelligence | Intelligence |
| Brand Recommendation | Brand Strategy |
| Referral Package | Referral Package |
| Mission Control State | Mission Control |
| Task | CRM |
| Meeting | CRM |
| Activity | CRM |
| Email Communication | Communications |

---

# Candidate

Owner

CRM

Purpose

Represents a person exploring franchise ownership.

Owns

- Identity
- Contact information
- Pipeline stage
- Status
- Health score

Never Owns

- AI recommendations
- Brand matches
- Discovery memory

Those belong elsewhere.

---

# Consultant

Owner

CRM

Purpose

Represents a franchise consultant.

Owns

- Name
- Organization
- Contact information
- Permissions
- Team membership

---

# Assessment

Owner

Assessment

Purpose

Represents structured responses provided by a candidate.

Owns

- Questions
- Responses
- Scores
- Candidate DNA
- Assessment metadata

Produces

Assessment Results

---

# Discovery Session

Owner

Discovery

Purpose

Represents a single consultant conversation.

Owns

- Meeting metadata
- Questions
- Answers
- Notes
- Readiness
- Confidence

Produces

Discovery Session

---

# Discovery Memory

Owner

Discovery

Purpose

Represents accumulated knowledge gathered during Discovery.

Owns

- Buying signals
- Concerns
- Key facts
- Insights
- Conversation memory

Produces

Discovery Memory

---

# Candidate Intelligence

Owner

Intelligence

Purpose

Transforms Assessment and Discovery into AI reasoning.

Consumes

Assessment

Discovery

Produces

- Readiness
- Confidence
- Executive Summary
- Buying Signals
- Risks

Never stores raw candidate information.

---

# Brand Recommendation

Owner

Brand Strategy

Purpose

Ranks franchise opportunities.

Consumes

Candidate Intelligence

Produces

- Brand ranking
- Evidence
- Confidence
- Discussion points
- Risks
- Consultant notes

---

# Referral Package

Owner

Referral Package

Purpose

Produces a consultant-ready summary for a franchisor.

Consumes

Candidate Intelligence

Brand Recommendation

Produces

- Executive summary
- Candidate snapshot
- Consultant recommendation
- Strengths
- Remaining risks

---

# Mission Control State

Owner

Mission Control

Purpose

Aggregates dashboard information.

Consumes

Candidate Repository

Task Repository

Candidate Intelligence

Produces

- Daily brief
- KPIs
- Activity feed
- Priority queue
- Meetings

---

# Task

Owner

CRM

Purpose

Represents consultant work.

Owns

- Due date
- Priority
- Status
- Completion

---

# Meeting

Owner

CRM

Purpose

Represents scheduled consultant interactions.

Owns

- Date
- Time
- Candidate
- Agenda
- Outcome

---

# Activity

Owner

CRM

Purpose

Represents historical events.

Examples

- Email sent

- Discovery completed

- Brand strategy generated

- Referral package created

- Candidate awarded

---

# Domain Rules

Every domain has exactly one owner.

Every model belongs to one feature.

Features consume other domains rather than redefining them.

---

# Model Evolution

Business models should evolve over time.

Do not introduce duplicate models simply because
a new feature requires additional information.

Instead:

✓ Extend the existing model

or

✓ Create a view model within the Runtime layer.

---

# View Models

Presentation models are not business models.

Example

CandidateRecord

↓

CandidateWorkspaceRuntime

↓

Candidate360State

Candidate360State exists only for rendering.

It should never replace CandidateRecord.

---

# Guiding Principle

Business models represent truth.

View models represent presentation.

Keep them separate.
