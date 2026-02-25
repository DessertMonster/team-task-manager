import { describe, expect, it } from 'vitest';
import { createTask, restoreTask, softDeleteTask, updateTask } from './task';

describe('task domain', () => {
  it('creates a valid open task', () => {
    const now = '2026-02-25T20:00:00.000Z';
    const task = createTask(
      {
        teamId: 'team_abc123',
        title: '  Write domain test  ',
        description: 'desc',
        assignedToUserId: 'usr_abc123',
        dueDate: '2026-03-01T00:00:00.000Z',
        createdByUserId: 'usr_creator'
      },
      now
    );

    expect(task.id.startsWith('task_')).toBe(true);
    expect(task.title).toBe('Write domain test');
    expect(task.status).toBe('open');
    expect(task.version).toBe(1);
    expect(task.createdAt).toBe(now);
    expect(task.updatedAt).toBe(now);
  });

  it('rejects invalid create input branches', () => {
    const now = '2026-02-25T20:00:00.000Z';
    expect(() =>
      createTask(
        {
          teamId: 'team_abc123',
          title: '',
          description: null,
          assignedToUserId: null,
          dueDate: null,
          createdByUserId: 'usr_creator'
        },
        now
      )
    ).toThrow();

    expect(() =>
      createTask(
        {
          teamId: 'team_abc123',
          title: 'ok',
          description: 'x'.repeat(5001),
          assignedToUserId: null,
          dueDate: null,
          createdByUserId: 'usr_creator'
        },
        now
      )
    ).toThrow();

    expect(() =>
      createTask(
        {
          teamId: 'usr_wrong',
          title: 'ok',
          description: null,
          assignedToUserId: null,
          dueDate: null,
          createdByUserId: 'usr_creator'
        },
        now
      )
    ).toThrow();

    expect(() =>
      createTask(
        {
          teamId: 'team_abc123',
          title: 'ok',
          description: null,
          assignedToUserId: 'team_wrong',
          dueDate: null,
          createdByUserId: 'usr_creator'
        },
        now
      )
    ).toThrow();
  });

  it('updates task and increments version', () => {
    const base = createTask(
      {
        teamId: 'team_abc123',
        title: 'start',
        description: null,
        assignedToUserId: null,
        dueDate: null,
        createdByUserId: 'usr_creator'
      },
      '2026-02-25T20:00:00.000Z'
    );

    const updated = updateTask(
      base,
      {
        version: 1,
        title: 'changed',
        description: 'new',
        status: 'completed',
        assignedToUserId: 'usr_assignee1',
        dueDate: '2026-03-01T00:00:00.000Z'
      },
      '2026-02-25T21:00:00.000Z'
    );

    expect(updated.title).toBe('changed');
    expect(updated.status).toBe('completed');
    expect(updated.completedAt).toBe('2026-02-25T21:00:00.000Z');
    expect(updated.version).toBe(2);
  });

  it('rejects invalid update branches', () => {
    const base = createTask(
      {
        teamId: 'team_abc123',
        title: 'start',
        description: null,
        assignedToUserId: null,
        dueDate: null,
        createdByUserId: 'usr_creator'
      },
      '2026-02-25T20:00:00.000Z'
    );

    expect(() => updateTask(base, { version: 2 }, '2026-02-25T21:00:00.000Z')).toThrow();
    expect(() => updateTask(base, { version: 1, title: '' }, '2026-02-25T21:00:00.000Z')).toThrow();
    expect(() =>
      updateTask(base, { version: 1, description: 'x'.repeat(5001) }, '2026-02-25T21:00:00.000Z')
    ).toThrow();
    expect(() =>
      updateTask(base, { version: 1, assignedToUserId: 'team_wrong' }, '2026-02-25T21:00:00.000Z')
    ).toThrow();
  });

  it('soft deletes and restores task', () => {
    const base = createTask(
      {
        teamId: 'team_abc123',
        title: 'start',
        description: null,
        assignedToUserId: null,
        dueDate: null,
        createdByUserId: 'usr_creator'
      },
      '2026-02-25T20:00:00.000Z'
    );

    const deleted = softDeleteTask(base, '2026-02-25T21:00:00.000Z');
    expect(deleted.deletedAt).toBe('2026-02-25T21:00:00.000Z');

    const restored = restoreTask(deleted, '2026-02-25T22:00:00.000Z');
    expect(restored.deletedAt).toBeNull();
    expect(restored.version).toBe(3);
  });

  it('rejects restore when task is not deleted', () => {
    const base = createTask(
      {
        teamId: 'team_abc123',
        title: 'start',
        description: null,
        assignedToUserId: null,
        dueDate: null,
        createdByUserId: 'usr_creator'
      },
      '2026-02-25T20:00:00.000Z'
    );

    expect(() => restoreTask(base, '2026-02-25T22:00:00.000Z')).toThrow('Task is not deleted');
  });
});
