<!--
Sync Impact Report
- Version change: 1.0.1 -> 1.1.0
- Modified principles: None
- Added sections:
  - Core Principles: VI. Maintainability Through Feature-Based Structure
- Removed sections: None
- Templates requiring updates:
  - ✅ updated `.specify/templates/plan-template.md`
  - ✅ updated `.specify/templates/spec-template.md`
  - ✅ updated `.specify/templates/tasks-template.md`
  - ✅ updated `AGENTS.md`
  - ⚠ pending `.specify/templates/commands/*.md` (directory not present in repository)
- Follow-up TODOs: None
-->

# Team Task Manager Constitution

## Core Principles

### I. Simplicity First

Start with the minimum viable feature set. Complexity must be justified against simpler alternatives. The constitution's Complexity Tracking mechanism MUST be used to document any deviation from this principle.

**Rationale**: Small teams need tools they can understand and maintain. Over-engineering leads to technical debt and slower iteration.

### II. User Experience Over Feature Count

A polished core beats a bloated mess. Every feature MUST demonstrate user value
through acceptance scenarios and MUST NOT introduce avoidable friction in
existing core flows (create team, create task, assign task, complete task).
Feature requests that degrade clarity or usability are rejected.

**Rationale**: Users value reliable, intuitive tools over feature-rich but confusing interfaces.

### III. Security By Design
Authentication and authorization at every layer. Security is non-negotiable and cannot be retrofitted.

**Rationale**: Task management involves sensitive business information. A single breach destroys trust.

### IV. Performance Is a Requirement
Performance budgets are non-negotiable acceptance criteria. Core interactive
actions MUST complete in under 1 second at p95, page loads MUST remain under 2
seconds at p95, and API responses MUST remain under 500ms at p95.

**Rationale**: Slow tools disrupt workflow. Performance directly impacts user adoption and satisfaction.

### V. Mobile-Friendly
Responsive design, not separate mobile apps. The web interface must work seamlessly on all device sizes.

**Rationale**: Team members work from various devices. Maintaining separate mobile apps increases complexity and violates Principle I.

### VI. Maintainability Through Feature-Based Structure
Code organization MUST follow feature boundaries rather than technical layers.
Each feature slice MUST keep related UI, API, domain logic, data access, and
tests together under a single feature module. Shared code MUST be limited to
cross-cutting utilities that are stable and reused by multiple features.
New work that introduces layer-first structures (for example, global `models/`,
`services/`, or `controllers/` trees without feature boundaries) MUST include a
documented exception in Complexity Tracking.

**Rationale**: Feature-first structure reduces coupling, improves test ownership,
and allows teams to change or extend functionality without broad refactors.

## Technical Constraints

### Must Use
- **Backend**: Lambda functions with Node.js 24.12.0 and TypeScript latest
- **Frontend**: React with TypeScript latest, follow vercel-react-best-practices skill
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: Amazon Cognito
- **Deployment**: CDK with TypeScript latest, follow aws-cdk-development skill and aws-well-architected-framework skill

### Must Avoid
- No unnecessary dependencies (stick to plain JavaScript and React as much as possible)
- No layer-first source trees that scatter a single feature across unrelated technical folders

**Rationale**: These constraints enforce Principle I (Simplicity First) by limiting architectural complexity and preventing technology sprawl.

## Quality Standards

### Testing
- Unit tests for business logic (80%+ coverage REQUIRED)
- Integration tests for all API endpoints
- End-to-end tests for critical user flows (defined as: create team, create task, assign task, complete task)

**Enforcement**: Pull requests failing coverage or missing critical path tests will be rejected.

### Performance
- Page load time < 2 seconds (measured at p95)
- API response time < 500ms (measured at p95)
- Database queries MUST be optimized (execution plans reviewed during code review)

**Enforcement**: Features that regress performance targets will be rolled back.

### Security
- OWASP Top 10 MUST be addressed for all user-facing features
- Dependencies MUST be scanned weekly (automated via CI/CD)
- SQL injection prevention: parameterized queries ONLY (raw SQL prohibited)
- XSS protection: all user input MUST be sanitized

**Enforcement**: Security violations block deployment.

## Non-Goals (What We're NOT Building)

Explicitly out of scope to prevent feature creep:

- ❌ Project management (Gantt charts, resource allocation, burndown charts)
- ❌ Time tracking or invoicing
- ❌ Complex workflows or automation (no custom workflow engines)
- ❌ Native mobile apps (web-first per Principle V)
- ❌ Real-time video/chat (out of scope for task management)

**Rationale**: These features violate Principle I (Simplicity First) and expand scope beyond small team task management. Feature requests in these categories should be politely declined.

## Success Criteria

### MVP (Version 1.0)
- Users can create teams
- Users can create, assign, and complete tasks
- Users can see team activity in real-time
- Application is secure (authentication required, OWASP Top 10 addressed)
- Application is fast (performance targets met)

### Future Enhancements (Post-MVP)
Considered only after MVP is stable and validated with users:
- Task comments and attachments
- Task dependencies and blocking relationships
- Email notifications
- Calendar integration (read-only)

## Governance

### Amendment Process
1. Amendments proposed via pull request to this file
2. Proposed changes must include:
   - Rationale for the change
   - Impact assessment on existing features/plans
   - Migration plan if breaking change
3. Approval requires: project maintainer sign-off
4. Constitution takes precedence over all other documents

### Versioning Policy
Semantic versioning (MAJOR.MINOR.PATCH):
- **MAJOR**: Backward incompatible changes (principle removal, constraint changes that invalidate existing code)
- **MINOR**: New principle or section added, material expansion of guidance
- **PATCH**: Clarifications, wording improvements, non-semantic refinements

### Compliance Review
- All feature specifications MUST reference this constitution
- All implementation plans MUST include "Constitution Check" section
- All implementation plans MUST define feature-module boundaries before task decomposition
- Code reviews MUST verify adherence to quality standards and technical constraints
- Violations MUST be documented in plan.md Complexity Tracking section

### Review Cadence
Constitution reviewed quarterly or when significant architectural decisions arise.

**Version**: 1.1.0 | **Ratified**: 2026-01-12 | **Last Amended**: 2026-02-22
