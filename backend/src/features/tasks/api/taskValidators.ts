import { assertValidPrefixedId, PREFIXES } from '../../../shared/ids/cuid';
import { TaskStatus } from '../domain/task';

export type TaskListQuery = {
  assigneeId?: string;
  status?: TaskStatus;
  page: number;
  pageSize: number;
};

export type CreateTaskPayload = {
  title: string;
  description: string | null;
  assignedToUserId: string | null;
  dueDate: string | null;
};

export type UpdateTaskPayload = {
  version: number;
  title?: string;
  description?: string | null;
  status?: TaskStatus;
  assignedToUserId?: string | null;
  dueDate?: string | null;
};

export function validateTeamId(teamId: string): string {
  return assertValidPrefixedId(teamId, PREFIXES.team);
}

export function validateTaskId(taskId: string): string {
  return assertValidPrefixedId(taskId, PREFIXES.task);
}

export function validateTaskListQuery(searchParams: URLSearchParams): TaskListQuery {
  const page = parsePositiveInt(searchParams.get('page') ?? '1', 'page');
  const pageSize = parsePositiveInt(searchParams.get('pageSize') ?? '50', 'pageSize');
  if (pageSize > 100) {
    throw new Error('pageSize must be between 1 and 100');
  }

  const status = searchParams.get('status');
  if (status !== null && status !== 'open' && status !== 'in_progress' && status !== 'completed') {
    throw new Error('status must be one of open, in_progress, completed');
  }

  const assigneeId = searchParams.get('assigneeId');
  if (assigneeId !== null) {
    assertValidPrefixedId(assigneeId, PREFIXES.user);
  }

  return {
    assigneeId: assigneeId ?? undefined,
    status: status ?? undefined,
    page,
    pageSize
  };
}

export function validateCreateTaskPayload(payload: unknown): CreateTaskPayload {
  const body = assertRecord(payload);

  const title = typeof body.title === 'string' ? body.title.trim() : '';
  if (title.length === 0 || title.length > 200) {
    throw new Error('title must be between 1 and 200 characters');
  }

  const description = toNullableString(body.description, 'description', 5000);
  const dueDate = toNullableDateString(body.dueDate, 'dueDate');

  let assignedToUserId: string | null = null;
  if (body.assignedToUserId !== undefined) {
    assignedToUserId = toNullableString(body.assignedToUserId, 'assignedToUserId', 255);
    if (assignedToUserId !== null) {
      assertValidPrefixedId(assignedToUserId, PREFIXES.user);
    }
  }

  return {
    title,
    description,
    assignedToUserId,
    dueDate
  };
}

export function validateUpdateTaskPayload(payload: unknown): UpdateTaskPayload {
  const body = assertRecord(payload);

  const version = body.version;
  if (typeof version !== 'number' || !Number.isInteger(version) || version < 1) {
    throw new Error('version must be an integer greater than or equal to 1');
  }

  const result: UpdateTaskPayload = { version };

  if (body.title !== undefined) {
    if (typeof body.title !== 'string') {
      throw new Error('title must be a string');
    }
    const title = body.title.trim();
    if (title.length === 0 || title.length > 200) {
      throw new Error('title must be between 1 and 200 characters');
    }
    result.title = title;
  }

  if (body.description !== undefined) {
    result.description = toNullableString(body.description, 'description', 5000);
  }

  if (body.status !== undefined) {
    if (body.status !== 'open' && body.status !== 'in_progress' && body.status !== 'completed') {
      throw new Error('status must be one of open, in_progress, completed');
    }
    result.status = body.status;
  }

  if (body.assignedToUserId !== undefined) {
    const assignedToUserId = toNullableString(body.assignedToUserId, 'assignedToUserId', 255);
    if (assignedToUserId !== null) {
      assertValidPrefixedId(assignedToUserId, PREFIXES.user);
    }
    result.assignedToUserId = assignedToUserId;
  }

  if (body.dueDate !== undefined) {
    result.dueDate = toNullableDateString(body.dueDate, 'dueDate');
  }

  return result;
}

function parsePositiveInt(rawValue: string, field: string): number {
  const parsed = Number(rawValue);
  if (!Number.isInteger(parsed) || parsed < 1) {
    throw new Error(`${field} must be an integer greater than or equal to 1`);
  }
  return parsed;
}

function assertRecord(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error('Request body must be a JSON object');
  }

  return value as Record<string, unknown>;
}

function toNullableString(value: unknown, field: string, maxLength: number): string | null {
  if (value === null) {
    return null;
  }

  if (value === undefined) {
    return null;
  }

  if (typeof value !== 'string') {
    throw new Error(`${field} must be a string or null`);
  }

  if (value.length > maxLength) {
    throw new Error(`${field} must be ${maxLength} characters or fewer`);
  }

  return value;
}

function toNullableDateString(value: unknown, field: string): string | null {
  if (value === null || value === undefined) {
    return null;
  }

  if (typeof value !== 'string') {
    throw new Error(`${field} must be an ISO-8601 string or null`);
  }

  const parsed = Date.parse(value);
  if (Number.isNaN(parsed)) {
    throw new Error(`${field} must be a valid ISO-8601 datetime string`);
  }

  return new Date(parsed).toISOString();
}
