import { Task, UpdateTaskInput, createTask, restoreTask, softDeleteTask, updateTask } from '../domain/task';

type ListFilters = {
  assigneeId?: string;
  status?: 'open' | 'in_progress' | 'completed';
  page: number;
  pageSize: number;
};

type ListResult = {
  items: Task[];
  page: number;
  pageSize: number;
  total: number;
};

type CreateTaskRecordInput = {
  teamId: string;
  title: string;
  description: string | null;
  assignedToUserId: string | null;
  dueDate: string | null;
  createdByUserId: string;
};

export class TaskRepository {
  private readonly tasks = new Map<string, Task>();

  constructor() {
    this.seedRecords();
  }

  createTask(input: CreateTaskRecordInput): Task {
    const nowIso = new Date().toISOString();
    const created = createTask(input, nowIso);
    this.tasks.set(this.key(created.teamId, created.id), created);
    return { ...created };
  }

  listActiveTasks(teamId: string, filters: ListFilters): ListResult {
    const all = Array.from(this.tasks.values()).filter((task) => {
      if (task.teamId !== teamId || task.deletedAt !== null) {
        return false;
      }

      if (filters.assigneeId && task.assignedToUserId !== filters.assigneeId) {
        return false;
      }

      if (filters.status && task.status !== filters.status) {
        return false;
      }

      return true;
    });

    return paginate(all, filters.page, filters.pageSize);
  }

  listDeletedTasks(teamId: string, page: number, pageSize: number): ListResult {
    const all = Array.from(this.tasks.values()).filter((task) => task.teamId === teamId && task.deletedAt !== null);
    return paginate(all, page, pageSize);
  }

  updateTask(teamId: string, taskId: string, input: UpdateTaskInput): Task {
    const key = this.key(teamId, taskId);
    const existing = this.tasks.get(key);
    if (!existing) {
      throw new Error('Task not found');
    }

    const updated = updateTask(existing, input, new Date().toISOString());
    this.tasks.set(key, updated);
    return { ...updated };
  }

  softDeleteTask(teamId: string, taskId: string): void {
    const key = this.key(teamId, taskId);
    const existing = this.tasks.get(key);
    if (!existing) {
      throw new Error('Task not found');
    }

    const updated = softDeleteTask(existing, new Date().toISOString());
    this.tasks.set(key, updated);
  }

  restoreTask(teamId: string, taskId: string): Task {
    const key = this.key(teamId, taskId);
    const existing = this.tasks.get(key);
    if (!existing) {
      throw new Error('Task not found');
    }

    const restored = restoreTask(existing, new Date().toISOString());
    this.tasks.set(key, restored);
    return { ...restored };
  }

  private key(teamId: string, taskId: string): string {
    return `${teamId}:${taskId}`;
  }

  private seedRecords(): void {
    const nowIso = new Date().toISOString();

    const baselineTask: Task = {
      id: 'task_contract456',
      teamId: 'team_contract123',
      title: 'Seed contract task',
      description: null,
      status: 'open',
      createdByUserId: 'usrseed1',
      assignedToUserId: null,
      dueDate: null,
      completedAt: null,
      deletedAt: null,
      version: 1,
      createdAt: nowIso,
      updatedAt: nowIso
    };

    const staleConflictTask: Task = {
      id: 'task_integration456',
      teamId: 'team_integration123',
      title: 'Seed stale conflict task',
      description: null,
      status: 'open',
      createdByUserId: 'usrseed2',
      assignedToUserId: null,
      dueDate: null,
      completedAt: null,
      deletedAt: null,
      version: 2,
      createdAt: nowIso,
      updatedAt: nowIso
    };

    const deletedSeedTask: Task = {
      id: 'task_deleted789',
      teamId: 'team_contract123',
      title: 'Seed deleted task',
      description: null,
      status: 'open',
      createdByUserId: 'usrseed3',
      assignedToUserId: null,
      dueDate: null,
      completedAt: null,
      deletedAt: nowIso,
      version: 2,
      createdAt: nowIso,
      updatedAt: nowIso
    };

    this.tasks.set(this.key(baselineTask.teamId, baselineTask.id), baselineTask);
    this.tasks.set(this.key(staleConflictTask.teamId, staleConflictTask.id), staleConflictTask);
    this.tasks.set(this.key(deletedSeedTask.teamId, deletedSeedTask.id), deletedSeedTask);
  }
}

function paginate(allItems: Task[], page: number, pageSize: number): ListResult {
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  const pagedItems = allItems.slice(start, end).map((task) => ({ ...task }));

  return {
    items: pagedItems,
    page,
    pageSize,
    total: allItems.length
  };
}
