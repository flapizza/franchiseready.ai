# FranchiseReady AI
## Repository Map

Version: FP005.2

---

# Purpose

Repositories own persistence.

Repositories are the only layer allowed to communicate with
the underlying data source.

Current implementation:

Seed repositories

Future implementation:

Supabase repositories

Eventually:

External APIs

CRM integrations

---

# Repository Philosophy

Repositories answer one question:

"Where does the data come from?"

Repositories do NOT answer:

"What should happen with the data?"

Business decisions belong inside AI Engines and Runtime classes.

---

# Repository Architecture

Presentation

↓

Runtime

↓

Repository

↓

Database

---

# Repository Pattern

Every business domain should expose:

Repository Interface

↓

Seed Repository

↓

Supabase Repository

The Runtime depends only upon the interface.

---

# Candidate Repository

Purpose

Manage candidate persistence.

Owns

- Candidate records

- Contact information

- Pipeline status

- Candidate metadata

Current

SeedCandidateRepository

Future

SupabaseCandidateRepository

---

# Assessment Repository

Purpose

Store assessment questions and responses.

Owns

- Questions

- Responses

- Scores

Produces

Assessment Results

---

# Discovery Repository

Purpose

Persist Discovery information.

Owns

- Discovery Sessions

- Discovery Memory

- Meeting Notes

- Facts

- Summaries

Produces

Discovery Session

Discovery Memory

---

# Brand Repository

Purpose

Store franchise brand information.

Owns

- Brand Profiles

- Territories

- Investment Requirements

- Validation Data

Future

Live territory availability

Franchisor APIs

---

# Consultant Repository

Purpose

Persist consultant information.

Owns

- Consultant profile

- Team membership

- Permissions

- Performance metrics

---

# Task Repository

Purpose

Manage workflow.

Owns

- Tasks

- Reminders

- Follow-ups

- Activities

---

# Meeting Repository

Purpose

Persist meetings.

Owns

- Calendar events

- Discovery meetings

- AI summaries

- Recording metadata

---

# Document Repository

Purpose

Store documents.

Owns

- PDFs

- Referral packages

- Meeting summaries

- Candidate documents

Future

Supabase Storage

---

# Repository Rules

Repositories MAY

✓ Read data

✓ Save data

✓ Delete data

✓ Update data

✓ Cache data

Repositories MUST NOT

✗ Make AI recommendations

✗ Calculate readiness

✗ Build presentation models

✗ Render UI

✗ Call React

---

# Dependency Rules

Allowed

Runtime

↓

Repository

↓

Supabase

Forbidden

Repository

↓

React

Repository

↓

Component

Repository

↓

AI Engine

---

# Repository Interfaces

Every repository should expose a consistent API whenever practical.

Example

getAll()

getById(id)

save(entity)

delete(id)

search(criteria)

Future repositories may expose richer methods where appropriate,
but the common CRUD operations should remain familiar.

---

# Seed Strategy

Development

↓

Seed Repositories

Testing

↓

Seed Repositories

Production

↓

Supabase Repositories

The application should be able to switch implementations
without changing Runtime code.

---

# Future Integrations

Repositories may eventually connect to:

- Supabase

- Google Calendar

- Gmail

- Microsoft 365

- Franchise territory providers

- Franchise CRM integrations

The Runtime layer should remain unaware of where the data originated.

---

# Repository Philosophy

Repositories exist to isolate infrastructure.

Changing databases should never require changing AI Engines.

Changing AI Engines should never require changing repositories.

Each layer owns one responsibility.

That separation is one of the core architectural principles of
FranchiseReady AI.