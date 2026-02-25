import { describe, expect, it } from 'vitest';
import {
  validateCreateTaskPayload,
  validateTaskId,
  validateTaskListQuery,
  validateTeamId,
  validateUpdateTaskPayload
} from './taskValidators';

describe('taskValidators', () => {
  it('validates team and task IDs', () => {
    expect(validateTeamId('team_abc123')).toBe('team_abc123');
    expect(validateTaskId('task_abc123')).toBe('task_abc123');
    expect(() => validateTeamId('usr_wrong')).toThrow();
    expect(() => validateTaskId('team_wrong')).toThrow();
  });

  it('validates and parses task list query', () => {
    const params = new URLSearchParams({ page: '2', pageSize: '10', status: 'open', assigneeId: 'usr_abc123' });
    const parsed = validateTaskListQuery(params);

    expect(parsed).toEqual({
      page: 2,
      pageSize: 10,
      status: 'open',
      assigneeId: 'usr_abc123'
    });
  });

  it('rejects invalid task list query values', () => {
    expect(() => validateTaskListQuery(new URLSearchParams({ page: '0' }))).toThrow();
    expect(() => validateTaskListQuery(new URLSearchParams({ pageSize: '101' }))).toThrow('pageSize must be between 1 and 100');
    expect(() => validateTaskListQuery(new URLSearchParams({ status: 'archived' }))).toThrow();
    expect(() => validateTaskListQuery(new URLSearchParams({ assigneeId: 'team_bad' }))).toThrow();
  });

  it('validates create task payload with optional nullable values', () => {
    const parsed = validateCreateTaskPayload({
      title: '  Build test coverage  ',
      description: null,
      assignedToUserId: null,
      dueDate: '2026-03-01T00:00:00Z'
    });

    expect(parsed.title).toBe('Build test coverage');
    expect(parsed.description).toBeNull();
    expect(parsed.assignedToUserId).toBeNull();
    expect(parsed.dueDate).toBe('2026-03-01T00:00:00.000Z');
  });

  it('rejects invalid create task payload', () => {
    expect(() => validateCreateTaskPayload([])).toThrow('Request body must be a JSON object');
    expect(() => validateCreateTaskPayload({ title: '' })).toThrow();
    expect(() => validateCreateTaskPayload({ title: 'ok', description: 42 })).toThrow();
    expect(() => validateCreateTaskPayload({ title: 'ok', dueDate: 'not-a-date' })).toThrow();
    expect(() => validateCreateTaskPayload({ title: 'ok', assignedToUserId: 'team_bad' })).toThrow();
  });

  it('validates update task payload', () => {
    const parsed = validateUpdateTaskPayload({
      version: 2,
      title: 'Updated',
      description: null,
      status: 'completed',
      assignedToUserId: null,
      dueDate: '2026-03-01T00:00:00Z'
    });

    expect(parsed).toEqual({
      version: 2,
      title: 'Updated',
      description: null,
      status: 'completed',
      assignedToUserId: null,
      dueDate: '2026-03-01T00:00:00.000Z'
    });
  });

  it('rejects invalid update payload branches', () => {
    expect(() => validateUpdateTaskPayload([])).toThrow('Request body must be a JSON object');
    expect(() => validateUpdateTaskPayload({ version: 0 })).toThrow();
    expect(() => validateUpdateTaskPayload({ version: 1, title: '' })).toThrow();
    expect(() => validateUpdateTaskPayload({ version: 1, title: 10 })).toThrow();
    expect(() => validateUpdateTaskPayload({ version: 1, status: 'archived' })).toThrow();
    expect(() => validateUpdateTaskPayload({ version: 1, assignedToUserId: 'team_bad' })).toThrow();
    expect(() => validateUpdateTaskPayload({ version: 1, dueDate: 'bad-date' })).toThrow();
  });
});
