# Implementation Plan: Team Task Manager MVP

**Branch**: `001-team-task-spec` | **Date**: 2026-02-22 | **Spec**: `/Users/dessertmonster/src/team-task-manager/specs/001-team-task-spec/spec.md`
**Input**: Feature specification from `/specs/001-team-task-spec/spec.md`

## Summary

Deliver a secure, responsive team task manager MVP with feature-first architecture
(`auth`, `teams`, `tasks`, minimal `shared`), prefixed CUID identifiers, AWS CDK
TypeScript infrastructure/deployment workflows, and a canonical project README.
Deployment is complete only when CDK publishes frontend/API URLs and automated
smoke checks confirm both endpoints are reachable.

## Technical Context

**Language/Version**: TypeScript (latest) on Node.js 24.12.0 for backend Lambdas; TypeScript (latest) for React frontend; TypeScript for CDK IaC  
**Primary Dependencies**: AWS Lambda runtime, React, Prisma ORM, Amazon Cognito, AWS CDK (TypeScript), CUID2-compatible ID generator  
**Storage**: PostgreSQL (primary relational datastore)  
**Testing**: Unit tests (business logic >=80% coverage), integration tests (all API endpoints), end-to-end tests (critical flows + restore/conflict/ID validation), infrastructure synth checks  
**Target Platform**: Responsive web app on modern desktop/mobile browsers with AWS deployment  
**Project Type**: web  
**Performance Goals**: p95 interactive actions <1s; page-load p95 <2s; API p95 <500ms; task update propagation <2s for active collaborators  
**Constraints**: OWASP Top 10 controls, Cognito authN, team-scoped authZ, UTC timestamp storage with local-time display, invitation delivery retry/status visibility, dedicated Recently Deleted view, prefixed CUID identifiers, AWS CDK stack-based deployment with frontend/API URL outputs, automated post-deploy smoke checks, canonical README with setup/test/deploy instructions, no layer-first source trees  
**Scale/Scope**: MVP target up to 100 concurrent users per team and up to 1000 teams

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Pre-Research Gate Review

- [x] **Simplicity First**: Scope remains MVP-limited to authentication, teams,
      task lifecycle, essential deployment automation, and required README docs.
- [x] **UX Over Feature Count**: Scenarios define clear user outcomes including
      conflict handling, restore workflow, delivery-status visibility, ID validation,
      and reachable deployment URLs.
- [x] **Security by Design**: AuthN/AuthZ, throttling, auditing, stale-write
      rejection, and strict identifier format validation are requirements.
- [x] **Performance Budgets**: p95 latency budgets are explicit and measurable.
- [x] **Mobile-Friendly Web**: Single responsive web UX across viewport sizes.
- [x] **Maintainability by Feature**: Canonical feature slices are fixed (`auth`,
      `teams`, `tasks`) and shared code is constrained.
- [x] **Technical Constraints**: Planned stack includes constitution-mandated CDK,
      Cognito, Lambda, PostgreSQL/Prisma, React, and TypeScript.
- [x] **Quality Standards**: Test plan enforces unit/integration/e2e gates plus
      IaC synthesis validation.

**Gate Result**: PASS

### Post-Design Gate Re-Check

- [x] Design artifacts preserve feature-first structure and module ownership.
- [x] Data model includes prefixed CUID primary IDs and reference validation rules.
- [x] Contracts encode required behaviors (ID patterns, conflict codes,
      deleted-task view, restore flow, invitation delivery status and retry path).
- [x] Quickstart includes README validation and deployment documentation checks.
- [x] Quickstart includes deployment URL output verification and smoke-check criteria.

**Gate Result**: PASS

## Project Structure

### Documentation (this feature)

```text
specs/001-team-task-spec/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── openapi.yaml
└── tasks.md
```

### Source Code (repository root)

```text
backend/
└── src/
    ├── features/
    │   ├── auth/
    │   ├── teams/
    │   └── tasks/
    └── shared/

frontend/
└── src/
    ├── features/
    │   ├── auth/
    │   ├── teams/
    │   └── tasks/
    └── shared/

infra/
└── cdk/
    ├── bin/
    ├── lib/
    └── test/

README.md
```

**Structure Decision**: Feature-first module layout is mandatory for application
code; infrastructure is managed as versioned CDK stacks in `infra/cdk`; root
`README.md` is mandatory and versioned with implementation changes.

## Phase 0: Outline & Research

### Research Tasks

- Research Cognito account verification/password recovery patterns for secure UX.
- Research team-scoped RBAC and immediate access-revocation patterns.
- Research optimistic concurrency conflict UX and offline-confirmed sync patterns.
- Research Prisma/PostgreSQL modeling for soft-delete + 30-day restore windows.
- Research invitation email retry/status design for eventual delivery reliability.
- Research UTC storage/local display patterns for collaborative task timestamps.
- Research audit retention lifecycle for 1-year policy enforcement.
- Research prefixed CUID generation/validation/indexing patterns for PostgreSQL.
- Research CDK stack composition and deployment pipeline patterns.
- Research README information architecture for fast onboarding/deployability.
- Research best practices for publishing CDK URL outputs and post-deploy smoke checks.

**Output**: `/Users/dessertmonster/src/team-task-manager/specs/001-team-task-spec/research.md`

## Phase 1: Design & Contracts

1. Produce domain model with entities, relationships, lifecycle transitions,
   and validation rules from FR-001..FR-028.
2. Produce OpenAPI contract covering auth, teams, invitations, tasks, deleted tasks,
   restore flows, ID patterns, and conflict/error semantics including health checks.
3. Produce quickstart for acceptance, security, performance, maintainability,
   identifier validation checks, CDK deployment checks, and URL smoke checks.
4. Update agent context for Codex with finalized technical context.

**Outputs**:
- `/Users/dessertmonster/src/team-task-manager/specs/001-team-task-spec/data-model.md`
- `/Users/dessertmonster/src/team-task-manager/specs/001-team-task-spec/contracts/openapi.yaml`
- `/Users/dessertmonster/src/team-task-manager/specs/001-team-task-spec/quickstart.md`

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| None | N/A | N/A |
