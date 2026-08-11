# FranchiseReady AI
## Feature Inventory

Version: FP005.2

---

# Purpose

This document tracks every major feature within FranchiseReady AI.

Each feature has:

- One owner
- One primary runtime
- One repository strategy
- One maturity level
- One next milestone

No feature should exist without being represented in this inventory.

---

# Maturity Levels

🟢 Mature

Feature architecture established.
Ready for production refinement.

🟡 Active

Feature exists and is under active development.

🟠 Planned

Architecture approved.
Implementation incomplete.

🔴 Future

Concept approved.
Development not started.

---

# Assessment

Status

🟢 Mature

Purpose

Determine candidate franchise fit through structured assessment.

Owns

- Questions
- Responses
- Scoring
- Candidate DNA
- Assessment Runtime

Consumes

None

Produces

Assessment Results

Candidate DNA

Future Work

- Adaptive questioning
- Benchmark comparisons
- AI scoring refinement

---

# Discovery

Status

🟢 Mature

Purpose

Capture consultant conversations and continuously improve candidate understanding.

Owns

- Discovery Session
- Discovery Memory
- Discovery Runtime
- Discovery Workspace
- Discovery Copilot
- Insights
- Summaries

Consumes

Assessment

Produces

Discovery Knowledge

Future Work

- Voice integration
- Live Copilot
- Automatic meeting summaries

---

# Candidate Intelligence

Status

🟢 Mature

Purpose

Transform assessment and discovery knowledge into actionable intelligence.

Owns

- Candidate Intelligence Engine
- Knowledge Graph
- Executive Recommendations
- Buying Signals
- AI Confidence

Consumes

Assessment

Discovery

Produces

Candidate Intelligence State

Future Work

- Multi-session learning
- Confidence weighting
- Explainability improvements

---

# CRM

Status

🟡 Active

Purpose

Manage consultant workflow.

Owns

- Candidate Records
- Pipeline
- Tasks
- Meetings
- Activities
- Documents
- Candidate Repository

Consumes

Candidate Intelligence

Produces

Candidate Workspace

Future Work

- Calendar integration
- Email integration
- Document management

---

# Mission Control

Status

🟡 Active

Purpose

Provide consultants with a real-time AI operating dashboard.

Owns

- Daily Brief
- Priority Queue
- Activity Feed
- AI Command Center

Consumes

CRM

Candidate Intelligence

Produces

Mission Control State

Future Work

- Live notifications
- AI conversation
- Opportunity forecasting

---

# Candidate 360

Status

🟡 Active

Purpose

Present a complete executive view of a candidate.

Owns

- Candidate Profile
- Timeline
- Readiness
- Intelligence Summary

Consumes

CRM

Discovery

Candidate Intelligence

Produces

Candidate Workspace View

Future Work

- Financial dashboard
- Relationship mapping
- Timeline enhancements

---

# Brand Strategy

Status

🟡 Active

Purpose

Recommend franchise brands using AI reasoning.

Owns

- Brand Recommendation Engine
- Evidence
- Consultant Talking Points

Consumes

Candidate Intelligence

Produces

Brand Recommendation

Future Work

- Territory integration
- Financial modeling
- Competitive comparison

---

# Referral Package

Status

🟡 Active

Purpose

Prepare consultant-ready referral packages for franchisors.

Owns

- Referral Package Engine
- Referral Preview

Consumes

Candidate Intelligence

Brand Recommendation

Produces

Referral Package

Future Work

- PDF generation
- Branded templates
- Email delivery

---

# Consultant Portal

Status

🟠 Planned

Purpose

Provide consultant-specific dashboards and business management.

Future Work

- Team management
- Performance reporting
- Commission tracking

---

# Franchisor Portal

Status

🟠 Planned

Purpose

Allow franchisors to receive and manage AI-qualified referrals.

Future Work

- Referral inbox
- Candidate status updates
- Territory availability
- Award reporting

---

# AI Platform

Status

🟢 Mature

Purpose

Provide reusable AI capabilities across the platform.

Owns

- AI Engines
- Knowledge Graph
- Reasoning
- Confidence
- Recommendations

Consumes

Assessment

Discovery

Produces

Intelligence

Future Work

- LLM orchestration
- Agent workflows
- Prompt management

---

# Current Development Priorities

FP005

Platform Consolidation

FP006

Repository Integration

FP007

Candidate Workspace Runtime

FP008

AI Workflow Integration

FP009

Supabase Data Layer

FP010

Production Readiness

---

# Guiding Principle

Before implementing a new feature:

1. Verify it does not already exist.

2. Determine which feature owns the business concept.

3. Extend the existing feature whenever practical.

4. Avoid duplicate runtimes, repositories, and AI engines.

The objective is to build one cohesive platform rather than many independent features.