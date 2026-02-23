# Tasks: Team Task Manager MVP

**Input**: Design documents from `/specs/001-team-task-spec/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/

**Tests**: Tests are REQUIRED by plan and constitution (unit >=80% business logic coverage, integration for API endpoints, e2e for critical flows, CDK synth checks).

**Organization**: Tasks are grouped by user story so each story can be implemented and validated independently.

## Format: `[ID] [P?] [Story?] Description with file path`

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Initialize repository structure, toolchain, and baseline documentation.

- [ ] T001 Create feature-first backend/frontend directory skeleton in `backend/src/features/`, `backend/src/shared/`, `frontend/src/features/`, and `frontend/src/shared/`
- [ ] T002 Initialize backend TypeScript workspace in `backend/package.json`
- [ ] T003 [P] Initialize frontend React + TypeScript workspace in `frontend/package.json`
- [ ] T004 [P] Initialize CDK TypeScript workspace in `infrastructure/cdk/package.json`, `infrastructure/cdk/bin/app.ts`, and `infrastructure/cdk/lib/`
- [ ] T005 [P] Configure root workspace scripts for lint/test/build/synth in `package.json`
- [ ] T006 Configure TypeScript settings in `backend/tsconfig.json`, `frontend/tsconfig.json`, and `infrastructure/cdk/tsconfig.json`
- [ ] T007 [P] Configure lint/format tools in `backend/.eslintrc.cjs`, `frontend/.eslintrc.cjs`, `infrastructure/cdk/.eslintrc.cjs`, and `.prettierrc`
- [ ] T008 Create root README scaffold with required sections in `README.md`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Shared capabilities required before any user story work can proceed.

**⚠️ CRITICAL**: Complete this phase before user story phases.

- [ ] T009 Implement shared prefixed CUID generator/validator in `backend/src/shared/ids/cuid.ts`
- [ ] T010 [P] Implement UTC/timezone conversion helpers in `backend/src/shared/time/timezone.ts`
- [ ] T011 Define initial Prisma schema in `backend/prisma/schema.prisma`
- [ ] T012 [P] Create initial database migration in `backend/prisma/migrations/001_init/migration.sql`
- [ ] T013 Implement Cognito auth middleware in `backend/src/shared/auth/cognitoAuth.ts`
- [ ] T014 [P] Implement team-scoped RBAC middleware in `backend/src/shared/auth/authorization.ts`
- [ ] T015 Implement API bootstrap and error handling in `backend/src/app.ts`
- [ ] T016 [P] Implement audit logger and retention helper in `backend/src/shared/audit/auditLogger.ts`
- [ ] T017 Implement optimistic concurrency guard in `backend/src/shared/concurrency/versionGuard.ts`
- [ ] T018 [P] Implement CDK auth stack (Cognito) in `infrastructure/cdk/lib/auth-stack.ts`
- [ ] T019 [P] Implement CDK app/API stack in `infrastructure/cdk/lib/app-stack.ts`
- [ ] T020 [P] Implement CDK data/dependency stack wiring in `infrastructure/cdk/lib/data-stack.ts`
- [ ] T021 Configure CDK app config/context in `infrastructure/cdk/cdk.json` and `infrastructure/cdk/lib/config.ts`
- [ ] T022 [P] Add CDK synth tests in `infrastructure/cdk/test/stacks.synth.test.ts`
- [ ] T023 [P] Configure backend test harness and coverage gates in `backend/jest.config.ts`
- [ ] T024 [P] Configure frontend test/e2e harness in `frontend/vitest.config.ts` and `frontend/playwright.config.ts`
- [ ] T025 Configure CI quality gates (unit/integration/e2e/security/cdk synth) in `.github/workflows/ci.yml`

**Checkpoint**: Foundation complete; user stories can proceed in parallel.

---

## Phase 3: User Story 1 - Manage Team Tasks (Priority: P1) 🎯 MVP

**Goal**: Team members can create, assign, filter, complete, soft-delete, and restore tasks with conflict-safe updates.

**Independent Test**: Create team members and tasks, run create/assign/filter/complete/delete/restore flows, verify stale updates are rejected and deleted tasks appear only in Recently Deleted.

### Tests for User Story 1

- [ ] T026 [P] [US1] Add contract test for `GET/POST /v1/teams/{teamId}/tasks` in `backend/tests/contract/tasks/list-create.contract.test.ts`
- [ ] T027 [P] [US1] Add contract test for `PATCH/DELETE /v1/teams/{teamId}/tasks/{taskId}` in `backend/tests/contract/tasks/update-delete.contract.test.ts`
- [ ] T028 [P] [US1] Add contract test for deleted/restore endpoints in `backend/tests/contract/tasks/restore-deleted.contract.test.ts`
- [ ] T029 [P] [US1] Add integration test for stale-version conflict handling in `backend/tests/integration/tasks/concurrency.integration.test.ts`
- [ ] T030 [P] [US1] Add integration test for deleted-task visibility rules in `backend/tests/integration/tasks/deleted-view.integration.test.ts`
- [ ] T031 [P] [US1] Add e2e test for task lifecycle and restore in `frontend/tests/e2e/tasks/task-lifecycle-restore.e2e.ts`

### Implementation for User Story 1

- [ ] T032 [P] [US1] Implement task domain model in `backend/src/features/tasks/domain/task.ts`
- [ ] T033 [P] [US1] Implement task repository in `backend/src/features/tasks/data/taskRepository.ts`
- [ ] T034 [US1] Implement task service in `backend/src/features/tasks/application/taskService.ts`
- [ ] T035 [US1] Implement task routes/controllers in `backend/src/features/tasks/api/taskRoutes.ts`
- [ ] T036 [US1] Implement task ID validation and request schemas in `backend/src/features/tasks/api/taskValidators.ts`
- [ ] T037 [P] [US1] Implement frontend task API client in `frontend/src/features/tasks/services/taskApi.ts`
- [ ] T038 [US1] Implement task board/filter UI in `frontend/src/features/tasks/ui/TaskBoard.tsx`
- [ ] T039 [US1] Implement Recently Deleted UI with restore in `frontend/src/features/tasks/ui/RecentlyDeletedView.tsx`
- [ ] T040 [US1] Implement conflict refresh prompt in `frontend/src/features/tasks/ui/ConflictResolutionDialog.tsx`
- [ ] T041 [US1] Implement offline sync confirmation state flow in `frontend/src/features/tasks/state/offlineSyncStore.ts`

**Checkpoint**: US1 is independently functional and testable.

---

## Phase 4: User Story 2 - Authenticate and Recover Access (Priority: P2)

**Goal**: Users can register, verify accounts, sign in, and recover access with throttling protections.

**Independent Test**: Complete register/verify/login/reset flow and verify throttling on repeated failed logins.

### Tests for User Story 2

- [ ] T042 [P] [US2] Add contract test for registration and verification in `backend/tests/contract/auth/register-verify.contract.test.ts`
- [ ] T043 [P] [US2] Add contract test for login and throttling in `backend/tests/contract/auth/login-throttle.contract.test.ts`
- [ ] T044 [P] [US2] Add contract test for password reset flows in `backend/tests/contract/auth/password-reset.contract.test.ts`
- [ ] T045 [P] [US2] Add integration test for auth audit events in `backend/tests/integration/auth/audit.integration.test.ts`
- [ ] T046 [P] [US2] Add e2e test for auth lifecycle in `frontend/tests/e2e/auth/auth-lifecycle.e2e.ts`

### Implementation for User Story 2

- [ ] T047 [P] [US2] Implement auth domain policies in `backend/src/features/auth/domain/authPolicy.ts`
- [ ] T048 [P] [US2] Implement auth repository in `backend/src/features/auth/data/authRepository.ts`
- [ ] T049 [US2] Implement auth service in `backend/src/features/auth/application/authService.ts`
- [ ] T050 [US2] Implement auth routes/controllers in `backend/src/features/auth/api/authRoutes.ts`
- [ ] T051 [US2] Implement login throttling logic in `backend/src/features/auth/application/loginThrottle.ts`
- [ ] T052 [P] [US2] Implement frontend auth API client in `frontend/src/features/auth/services/authApi.ts`
- [ ] T053 [US2] Implement auth screen routing in `frontend/src/features/auth/ui/AuthRoutes.tsx`
- [ ] T054 [US2] Implement protected-route redirect handling in `frontend/src/features/auth/ui/RequireAuth.tsx`

**Checkpoint**: US2 is independently functional and testable.

---

## Phase 5: User Story 3 - Manage Team Membership (Priority: P3)

**Goal**: Admins can create teams, invite members, retry invitation delivery, remove members, and transfer ownership.

**Independent Test**: Create team, invite member, simulate delivery failure and retry, accept invite, remove member, transfer ownership, confirm permission updates.

### Tests for User Story 3

- [ ] T055 [P] [US3] Add contract test for team creation and global uniqueness in `backend/tests/contract/teams/create-team.contract.test.ts`
- [ ] T056 [P] [US3] Add contract test for invitation create/list/retry/accept in `backend/tests/contract/teams/invitations.contract.test.ts`
- [ ] T057 [P] [US3] Add contract test for member removal and ownership transfer in `backend/tests/contract/teams/membership-ownership.contract.test.ts`
- [ ] T058 [P] [US3] Add integration test for invitation delivery status transitions in `backend/tests/integration/teams/invitation-delivery.integration.test.ts`
- [ ] T059 [P] [US3] Add e2e test for team admin lifecycle in `frontend/tests/e2e/teams/team-admin-lifecycle.e2e.ts`

### Implementation for User Story 3

- [ ] T060 [P] [US3] Implement team domain model in `backend/src/features/teams/domain/team.ts`
- [ ] T061 [P] [US3] Implement team and invitation repositories in `backend/src/features/teams/data/teamRepository.ts` and `backend/src/features/teams/data/invitationRepository.ts`
- [ ] T062 [US3] Implement team service in `backend/src/features/teams/application/teamService.ts`
- [ ] T063 [US3] Implement invitation service in `backend/src/features/teams/application/invitationService.ts`
- [ ] T064 [US3] Implement teams routes/controllers in `backend/src/features/teams/api/teamRoutes.ts`
- [ ] T065 [P] [US3] Implement frontend teams API client in `frontend/src/features/teams/services/teamApi.ts`
- [ ] T066 [US3] Implement team admin UI in `frontend/src/features/teams/ui/TeamAdminPage.tsx`
- [ ] T067 [US3] Implement invitation delivery status/retry UI in `frontend/src/features/teams/ui/InvitationQueue.tsx`

**Checkpoint**: US3 is independently functional and testable.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final hardening, deployment readiness, and onboarding quality.

- [ ] T068 [P] Add unit tests for shared CUID/time validation utilities in `backend/tests/unit/shared/cuid-time-validation.test.ts`
- [ ] T069 Add performance instrumentation for p95 targets in `backend/src/shared/observability/performanceMetrics.ts`
- [ ] T070 [P] Add security regression tests for authz and input sanitization in `backend/tests/integration/security/security-regressions.integration.test.ts`
- [ ] T071 Validate audit retention pruning behavior in `backend/src/shared/audit/auditRetentionJob.ts`
- [ ] T072 [P] Add CDK deployment script and environment notes in `infrastructure/cdk/scripts/deploy.sh` and `infrastructure/cdk/README.md`
- [ ] T073 [P] Write full developer/project README content in `README.md`
- [ ] T074 Validate README instructions end-to-end on clean environment and record timings in `docs/validation/readme-onboarding-validation.md`
- [ ] T075 Run quickstart validation and capture final results in `/Users/dessertmonster/src/team-task-manager/specs/001-team-task-spec/quickstart.md`
- [ ] T076 Capture final p95 evidence in `docs/validation/performance-evidence.md`
- [ ] T077 Implement API health endpoint for deployment smoke checks in `backend/src/shared/api/healthRoute.ts`
- [ ] T078 [P] Add CDK stack outputs for `frontendUrl` and `apiBaseUrl` in `infrastructure/cdk/lib/app-stack.ts`
- [ ] T079 [P] Implement deployment URL smoke-check script in `infrastructure/cdk/scripts/smoke-check-urls.sh`
- [ ] T080 Integrate URL smoke checks into deployment workflow in `.github/workflows/ci.yml`
- [ ] T081 Capture deployment URL verification evidence in `docs/validation/deployment-url-evidence.md`
- [ ] T082 [P] Implement uptime SLI/SLO instrumentation and availability metric export in `backend/src/shared/observability/availabilityMetrics.ts`
- [ ] T083 Validate monthly uptime reporting against 99.5% target and store evidence in `docs/validation/availability-slo-evidence.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- Phase 1 (Setup): no dependencies
- Phase 2 (Foundational): depends on Phase 1 and blocks all user stories
- Phase 3 (US1): depends on Phase 2
- Phase 4 (US2): depends on Phase 2
- Phase 5 (US3): depends on Phase 2
- Phase 6 (Polish): depends on completion of selected user stories

### User Story Dependency Graph

- US1 (P1): independent after Foundational
- US2 (P2): independent after Foundational
- US3 (P3): independent after Foundational
- Recommended completion order for incremental value: `US1 -> US2 -> US3`

### Within Each User Story

- Contract/integration/e2e tests first (must fail before implementation)
- Domain/data layer before services
- Services before API/UI wiring
- Validation/error handling before story sign-off

## Parallel Execution Examples

### User Story 1

```bash
# Parallel test tasks
T026, T027, T028, T029, T030, T031

# Parallel model/repository/client tasks
T032, T033, T037
```

### User Story 2

```bash
# Parallel test tasks
T042, T043, T044, T045, T046

# Parallel implementation tasks
T047, T048, T052
```

### User Story 3

```bash
# Parallel test tasks
T055, T056, T057, T058, T059

# Parallel implementation tasks
T060, T061, T065
```

## Implementation Strategy

### MVP First (Recommended)

1. Complete Phase 1 and Phase 2
2. Complete Phase 3 (US1)
3. Validate US1 independently and demo MVP
4. Release MVP baseline

### Incremental Delivery

1. Add US2 and validate independently
2. Add US3 and validate independently
3. Complete Phase 6 hardening, deployment readiness, and README validation

### Parallel Team Strategy

1. Team completes Setup + Foundational together
2. After Foundational:
   - Developer A: US1
   - Developer B: US2
   - Developer C: US3
3. Integrate each story at checkpoint boundaries, then run polish
