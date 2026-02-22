# Implementation Plan: [FEATURE]

**Branch**: `[###-feature-name]` | **Date**: [DATE] | **Spec**: [link]
**Input**: Feature specification from `/specs/[###-feature-name]/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

[Extract from feature spec: primary requirement + technical approach from research]

## Technical Context

<!--
  ACTION REQUIRED: Replace the content in this section with the technical details
  for the project. The structure here is presented in advisory capacity to guide
  the iteration process.
-->

**Language/Version**: [e.g., Python 3.11, Swift 5.9, Rust 1.75 or NEEDS CLARIFICATION]  
**Primary Dependencies**: [e.g., FastAPI, UIKit, LLVM or NEEDS CLARIFICATION]  
**Storage**: [if applicable, e.g., PostgreSQL, CoreData, files or N/A]  
**Testing**: [e.g., pytest, XCTest, cargo test or NEEDS CLARIFICATION]  
**Target Platform**: [e.g., Linux server, iOS 15+, WASM or NEEDS CLARIFICATION]
**Project Type**: [single/web/mobile - determines source structure]  
**Performance Goals**: [domain-specific, e.g., 1000 req/s, 10k lines/sec, 60 fps or NEEDS CLARIFICATION]  
**Constraints**: [domain-specific, e.g., <200ms p95, <100MB memory, offline-capable or NEEDS CLARIFICATION]  
**Scale/Scope**: [domain-specific, e.g., 10k users, 1M LOC, 50 screens or NEEDS CLARIFICATION]

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [ ] **Simplicity First**: Scope is limited to the minimum viable increment and
      any added complexity is documented in `Complexity Tracking`.
- [ ] **UX Over Feature Count**: Acceptance scenarios prove user value without
      adding avoidable friction to core flows.
- [ ] **Security by Design**: Threats for authentication, authorization, input
      validation, and OWASP Top 10 are addressed up front.
- [ ] **Performance Budgets**: Plan enforces p95 targets (interactive <1s, page
      load <2s, API <500ms) with explicit measurement approach.
- [ ] **Mobile-Friendly Web**: UI behavior is defined for small and large
      screens in one responsive web experience.
- [ ] **Maintainability by Feature**: Source structure groups code by feature
      slice; each slice contains related UI/API/domain/tests and avoids
      layer-first global trees unless an exception is tracked.
- [ ] **Technical Constraints**: Stack remains Lambda Node.js 24.12.0 +
      TypeScript, React + TypeScript, PostgreSQL + Prisma, Cognito, and CDK
      TypeScript unless a tracked exception is approved.
- [ ] **Quality Standards**: Test strategy includes unit tests (>=80% business
      logic coverage), integration tests for all API endpoints, and end-to-end
      tests for critical flows.

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)
<!--
  ACTION REQUIRED: Replace the placeholder tree below with the concrete layout
  for this feature. Delete unused options and expand the chosen structure with
  real paths (e.g., apps/admin, packages/something). The delivered plan must
  not include Option labels.
-->

```text
# [REMOVE IF UNUSED] Option 1: Single project (DEFAULT, feature-first)
src/
├── features/
│   ├── <feature-a>/
│   │   ├── api/
│   │   ├── domain/
│   │   ├── data/
│   │   └── ui/
│   └── <feature-b>/
└── shared/
    ├── utils/
    └── platform/

tests/
├── contract/
├── integration/
└── unit/

# [REMOVE IF UNUSED] Option 2: Web application (feature-first)
backend/
├── src/
│   ├── features/
│   │   ├── <feature-a>/
│   │   └── <feature-b>/
│   └── shared/
└── tests/

frontend/
├── src/
│   ├── features/
│   │   ├── <feature-a>/
│   │   └── <feature-b>/
│   └── shared/
└── tests/

# [REMOVE IF UNUSED] Option 3: Mobile + API (when "iOS/Android" detected)
api/
└── [same feature-first pattern as backend above]

ios/ or android/
└── [platform-specific structure: feature modules, UI flows, platform tests]
```

**Structure Decision**: [Document the selected structure and reference the real
directories captured above]

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |
