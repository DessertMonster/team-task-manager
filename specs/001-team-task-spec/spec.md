# Feature Specification: Team Task Manager MVP

**Feature Branch**: `001-team-task-spec`  
**Created**: 2026-02-22  
**Status**: Draft  
**Input**: User description: "Please refer to .speckit/spec.md for the spec"

## Clarifications

### Session 2026-02-22

- Q: How should concurrent task edits be resolved? → A: Optimistic concurrency: reject stale save, prompt user to refresh and retry.
- Q: What is the scope for unique team names? → A: Unique globally across all teams.
- Q: How should queued offline edits sync after reconnect? → A: Require user confirmation before syncing queued edits.
- Q: What is the MVP availability target? → A: 99.5% monthly availability.
- Q: What is the task deletion policy? → A: Soft delete, recoverable for 30 days.
- Q: What are the canonical feature slices? → A: auth, teams, tasks, plus minimal shared module.
- Q: How should invitation email delivery failures be handled? → A: Create invitation first, retry delivery, and show delivery status.
- Q: How long should audit events be retained? → A: 1 year.
- Q: What is the timezone handling standard? → A: Store timestamps in UTC and display in user local timezone.
- Q: Where should deleted tasks be visible? → A: Hidden from normal lists; visible in a dedicated Recently Deleted view.
- Q: What identifier format should entities use? → A: Prefixed CUID identifiers.
- Q: How should infrastructure and deployment be managed? → A: AWS CDK in TypeScript with reproducible stack-based deployment.
- Q: What developer documentation is required? → A: A project README that explains application purpose, setup, and deployment workflow.
- Q: What deployment accessibility outputs are required? → A: CDK must output frontend and API URLs and both must pass automated smoke checks.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Manage Team Tasks (Priority: P1)

As a team member, I can create, assign, update, complete, and filter tasks so the team
can coordinate day-to-day work in one place.

**Why this priority**: Task tracking is the core product value and must be usable as the
first deliverable.

**Independent Test**: Create a team with at least two members, create multiple tasks,
assign tasks, complete one task, and verify filtering by assignee/status works without
requiring other stories.

**Acceptance Scenarios**:

1. **Given** a signed-in member in a team, **When** they create a task with title,
   optional description, and optional due date, **Then** the task appears in the team
   task list immediately.
2. **Given** an existing open task, **When** a member assigns it to themselves or a
   teammate, **Then** the assignee is shown in the list and detail views.
3. **Given** a task assigned to a member, **When** that member marks it complete,
   **Then** its status changes to completed and a completion timestamp is visible.
4. **Given** a task list with mixed assignees and statuses, **When** a member applies
   filters, **Then** only matching tasks are shown.
5. **Given** a task created by one member, **When** a different non-assigned member tries
   to edit or delete it, **Then** the action is rejected with a clear permission message.
6. **Given** an authorized user deletes a task, **When** they open recently deleted tasks
   within 30 days, **Then** they can restore that task.

---

### User Story 2 - Authenticate and Recover Access (Priority: P2)

As a user, I can register, confirm my account, sign in, and recover account access so I
can use the workspace securely.

**Why this priority**: Secure and reliable access is required for real team usage but can
follow core task flow validation.

**Independent Test**: Create a new account, confirm access, sign in, sign out, request a
password reset, complete reset, and verify login protections after repeated failures.

**Acceptance Scenarios**:

1. **Given** a new visitor, **When** they register with valid credentials,
   **Then** an account is created and verification instructions are sent.
2. **Given** an unverified account, **When** the user tries to sign in,
   **Then** access is denied with guidance to verify first.
3. **Given** a signed-out user, **When** they request password recovery,
   **Then** they receive a time-limited reset link and can set a new password.
4. **Given** repeated failed sign-in attempts for one account, **When** the threshold is
   reached, **Then** additional attempts are temporarily blocked.

---

### User Story 3 - Manage Team Membership (Priority: P3)

As a team admin, I can create teams, invite members, remove members, and transfer team
ownership so team administration stays accurate over time.

**Why this priority**: Team governance is essential for sustained collaboration but can be
released after core task and access workflows.

**Independent Test**: Create a team, invite members, accept an invite, remove one member,
transfer ownership, and confirm permissions update correctly.

**Acceptance Scenarios**:

1. **Given** a signed-in user, **When** they create a team with a unique name,
   **Then** the team is created and the creator is the owner.
2. **Given** an admin in a team, **When** they invite a valid email address,
   **Then** an invitation is issued with an expiration date.
3. **Given** an existing member, **When** an admin removes that member,
   **Then** that person immediately loses access to team data.
4. **Given** a team owner, **When** ownership transfer is confirmed,
   **Then** the new owner receives owner privileges and the prior owner is downgraded.
5. **Given** a signed-in user, **When** they attempt to create a team name that already
   exists anywhere in the system, **Then** creation is rejected with a duplicate-name
   message.

### Edge Cases

- A user opens a protected page while signed out; the system redirects to sign-in and
  returns the user to the requested page after successful authentication.
- A session expires during task editing; unsaved changes are preserved and the user is
  prompted to re-authenticate.
- Two members edit the same task close together; stale save attempts are rejected and
  the user is prompted to refresh and reapply changes.
- A user with large completed-task history can still load and navigate completed tasks
  through paged results without freezing the interface.
- After reconnecting from offline mode, queued task edits are shown for user confirmation
  before synchronization starts.
- A task is deleted by mistake; authorized users can restore it within 30 days.
- Deleted tasks do not appear in normal task filters and are accessible only in
  a dedicated Recently Deleted view for restore actions.
- The last team admin leaves or is removed; ownership/admin rights are reassigned so the
  team is never left without an administrator.
- A user attempts to create a team with a globally used name; the system rejects the
  request and prompts for a different name.
- Invitation email delivery fails; invitation remains pending, delivery is retried, and
  current delivery status is visible to authorized team admins.
- An entity ID with invalid prefix/format is submitted; request is rejected with
  a validation error before persistence.
- A developer follows onboarding docs on a clean machine; setup and deployment
  steps are complete and executable without external tribal knowledge.
- CDK deployment completes but frontend or API URL output is missing/unreachable;
  deployment is treated as failed and release is blocked.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST allow users to register accounts and verify account ownership
  before first sign-in.
- **FR-002**: System MUST allow authenticated users to sign in, sign out, and recover
  access with time-limited reset links, and protected API requests MUST validate JWT
  issuer, audience, expiration, and required subject/team claims before authorization.
- **FR-003**: System MUST enforce temporary sign-in throttling after repeated failed
  authentication attempts using explicit thresholds: lock after 5 consecutive failures
  within 15 minutes, apply a 15-minute cooldown, and reset the counter after either a
  successful login or 15 minutes without additional failures.
- **FR-004**: System MUST allow authorized users to create teams with names unique across
  the entire system.
- **FR-005**: System MUST allow team admins to invite users by email and set invitation
  expiration.
- **FR-006**: System MUST allow team admins to remove members and apply access revocation
  immediately.
- **FR-007**: System MUST allow team ownership transfer with explicit confirmation.
- **FR-008**: System MUST allow team members to create tasks with title, optional
  description, optional due date, and assignee.
- **FR-009**: System MUST allow authorized users to update task status and mark tasks as
  completed with recorded completion time.
- **FR-010**: System MUST enforce task edit/delete permissions so only authorized users
  can modify tasks, and Phase 2 shared authorization middleware MUST define an
  operation-level role matrix for protected team/task operations.
- **FR-011**: System MUST allow users to filter task lists by assignee and status.
- **FR-012**: System MUST propagate task updates so that at least 95% of updates are
  visible to other active team members in under 2 seconds.
- **FR-013**: System MUST support responsive task workflows on mobile, tablet, and desktop
  layouts from one web experience.
- **FR-014**: System MUST maintain an auditable record of authentication attempts, task
  lifecycle changes, membership changes, authorization denials, and privileged
  configuration/deployment actions.
- **FR-015**: System MUST reject stale task update attempts when a newer version exists
  and require the user to refresh before retrying the update.
- **FR-016**: System MUST require explicit user confirmation before synchronizing queued
  offline task edits after network reconnection.
- **FR-017**: System MUST implement task soft deletion with recovery available for 30
  days after deletion.
- **FR-018**: System MUST organize implementation into feature slices `auth`, `teams`,
  and `tasks`, with only cross-cutting reusable utilities in `shared`.
- **FR-019**: System MUST create invitation records even when initial email delivery
  fails, retry delivery, and expose invitation delivery status to authorized admins.
- **FR-020**: System MUST retain audit events for 1 year from event creation.
- **FR-021**: System MUST store timestamps in UTC and present due dates and timestamps in
  each user's local timezone in the interface; invalid timezone identifiers MUST be
  rejected with a validation error and DST-boundary conversions MUST preserve the
  original instant in UTC.
- **FR-022**: System MUST exclude deleted tasks from normal task lists and filters and
  provide a dedicated Recently Deleted view for restore operations.
- **FR-023**: System MUST use prefixed CUID identifiers for all primary entities
  and references, and reject IDs that do not match expected prefix + CUID format.
- **FR-024**: System MUST define and deploy required cloud infrastructure using
  AWS CDK in TypeScript, including environment-safe stack configuration for
  backend compute, API routing, authentication, and data services.
- **FR-025**: System MUST include a project `README.md` that describes application
  purpose, architecture overview, local development setup, required environment
  variables, testing workflow, and AWS CDK deployment steps.
- **FR-026**: System MUST publish both frontend and API base URLs as AWS CDK stack
  outputs for each deployable environment.
- **FR-027**: System MUST run automated post-deployment smoke checks against the
  published frontend URL and API health endpoint before marking deployment successful.
- **FR-028**: System MUST capture and retain monthly availability evidence showing
  uptime against the 99.5% target, including incident and recovery timestamps.

### Phase 2 Foundational Requirement Details

- **FND-001**: Protected endpoints MUST return a canonical error envelope with fields
  `code`, `message`, optional `details`, and `correlationId` for authn/authz/validation/
  conflict/internal failures.
- **FND-002**: Foundational API error taxonomy MUST include and document `401` (authn),
  `403` (authz), `422` (validation), `409` (conflict), and `500` (internal).
- **FND-003**: Phase 2 MUST define rollback/mitigation requirements for partial failures,
  including migration-success/app-bootstrap-failure and migration-failure scenarios.
- **FND-004**: CI quality gates are blocking for Phase 2 completion: unit coverage >=80%
  for business logic, integration suite pass, e2e suite pass, security regression suite
  pass, and CDK synth pass.
- **FND-005**: Phase 2 documentation MUST include a task-to-requirement traceability map
  covering tasks T009 through T025 to functional requirements and success criteria.

### Assumptions

- Teams are small enough that task collaboration primarily occurs within one team context
  at a time per active user.
- Invitation recipients have access to email and can complete account verification before
  invitation expiration.
- Initial release targets web users only, with responsive behavior covering mobile,
  tablet, and desktop viewports.
- Teams require at least one administrator at all times; ownership/admin reassignment is
  automatic when necessary.

### Constitution Alignment *(mandatory)*

- **Simplicity First**: MVP scope is limited to authentication, team membership,
  and core task lifecycle (create, assign, complete, filter). Out of scope:
  native mobile apps, project planning charts, invoicing, and real-time chat/video.
- **Security by Design**: Access is authenticated; all team and task operations are
  authorized by membership and role; abusive authentication behavior is throttled;
  key security events are auditable.
- **Performance Is a Requirement**: Users can complete primary interactions
  (create/edit/complete/filter task) within 1 second at p95, initial page load stays
  under 2 seconds at p95, and task-update interactions complete under 500ms at p95.
- **Mobile-Friendly**: Dashboard and task detail views are fully usable on small touch
  screens, tablet layouts, and desktop layouts without requiring a separate app.
- **Maintainability by Feature**: Feature ownership is split into `auth`, `teams`, and
  `tasks`; `shared` is limited to cross-cutting reusable modules.
- **Infrastructure as Code**: Infrastructure resources and deployment workflows
  are defined in AWS CDK TypeScript stacks and versioned with the application.
- **Developer Onboarding Documentation**: A root `README.md` is maintained as
  the canonical starting point for understanding and deploying the application.

### Key Entities *(include if feature involves data)*

- **User**: Person with account identity, profile details, access status, and
  authentication lifecycle timestamps; local timezone context is used for display.
  Identifier format: `usr_<cuid>`.
- **Team**: Collaboration boundary with unique name, ownership, and membership roster.
  Identifier format: `team_<cuid>`.
- **Team Membership**: Relationship linking a user to a team, including role and join date.
- **Invitation**: Pending request for a user to join a team with inviter, recipient,
  status, and expiration. Identifier format: `inv_<cuid>`.
- **Task**: Work item owned by a team with title, optional details, assignee,
  lifecycle status, and audit timestamps. Identifier format: `task_<cuid>`.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: At least 90% of invited users can register, verify access, and sign in
  successfully on their first attempt.
- **SC-002**: At least 95% of users can create and assign a task in under 30 seconds.
- **SC-003**: At least 95% of task filter actions return the expected results in under
  1 second.
- **SC-004**: Task status updates are visible to other active team members in under
  2 seconds for at least 95% of updates.
- **SC-005**: During pilot usage, at least 70% of created tasks are completed within
  their intended cycle.
- **SC-006**: Service availability is at least 99.5% per calendar month during MVP
  operation windows.
- **SC-007**: A developer can follow `README.md` on a clean environment and
  complete local setup plus deployment preparation in under 45 minutes.
- **SC-008**: After each deployment, required CDK URL outputs (frontend + API)
  are published and pass smoke checks within 5 minutes.
