import { assertVersionMatch, nextVersion } from '../../../shared/concurrency/versionGuard';
import { PREFIXES, assertValidPrefixedId, createPrefixedId } from '../../../shared/ids/cuid';

export type TaskStatus = 'open' | 'in_progress' | 'completed';

export type Task = {
  id: string;
  teamId: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  createdByUserId: string;
  assignedToUserId: string | null;
  dueDate: string | null;
  completedAt: string | null;
  deletedAt: string | null;
  version: number;
  createdAt: string;
  updatedAt: string;
};

export type CreateTaskInput = {
  teamId: string;
  title: string;
  description: string | null;
  assignedToUserId: string | null;
  dueDate: string | null;
  createdByUserId: string;
};

export type UpdateTaskInput = {
  version: number;
  title?: string;
  description?: string | null;
  status?: TaskStatus;
  assignedToUserId?: string | null;
  dueDate?: string | null;
};

export function createTask(input: CreateTaskInput, nowIso: string): Task {
  const normalizedTitle = input.title.trim();
  if (normalizedTitle.length === 0 || normalizedTitle.length > 200) {
    throw new Error('Task title must be between 1 and 200 characters');
  }

  if (input.description && input.description.length > 5000) {
    throw new Error('Task description must be 5000 characters or fewer');
  }

  assertValidPrefixedId(input.teamId, PREFIXES.team);

  if (input.assignedToUserId !== null) {
    assertValidPrefixedId(input.assignedToUserId, PREFIXES.user);
  }

  return {
    id: createPrefixedId(PREFIXES.task),
    teamId: input.teamId,
    title: normalizedTitle,
    description: input.description,
    status: 'open',
    createdByUserId: input.createdByUserId,
    assignedToUserId: input.assignedToUserId,
    dueDate: input.dueDate,
    completedAt: null,
    deletedAt: null,
    version: 1,
    createdAt: nowIso,
    updatedAt: nowIso
  };
}

export function updateTask(existing: Task, input: UpdateTaskInput, nowIso: string): Task {
  assertVersionMatch(input.version, existing.version);

  const title = input.title !== undefined ? input.title.trim() : existing.title;
  if (title.length === 0 || title.length > 200) {
    throw new Error('Task title must be between 1 and 200 characters');
  }

  const description = input.description !== undefined ? input.description : existing.description;
  if (description !== null && description.length > 5000) {
    throw new Error('Task description must be 5000 characters or fewer');
  }

  const status = input.status ?? existing.status;
  const completedAt = status === 'completed' ? nowIso : null;

  if (input.assignedToUserId !== undefined && input.assignedToUserId !== null) {
    assertValidPrefixedId(input.assignedToUserId, PREFIXES.user);
  }

  return {
    ...existing,
    title,
    description,
    status,
    assignedToUserId: input.assignedToUserId !== undefined ? input.assignedToUserId : existing.assignedToUserId,
    dueDate: input.dueDate !== undefined ? input.dueDate : existing.dueDate,
    completedAt,
    version: nextVersion(existing.version),
    updatedAt: nowIso
  };
}

export function softDeleteTask(existing: Task, nowIso: string): Task {
  return {
    ...existing,
    deletedAt: nowIso,
    updatedAt: nowIso,
    version: nextVersion(existing.version)
  };
}

export function restoreTask(existing: Task, nowIso: string): Task {
  if (existing.deletedAt === null) {
    throw new Error('Task is not deleted');
  }

  return {
    ...existing,
    deletedAt: null,
    updatedAt: nowIso,
    version: nextVersion(existing.version)
  };
}
