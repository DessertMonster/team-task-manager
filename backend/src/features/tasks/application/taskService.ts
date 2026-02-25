import { TaskRepository } from '../data/taskRepository';
import { Task, TaskStatus } from '../domain/task';

type ListTaskQuery = {
  assigneeId?: string;
  status?: TaskStatus;
  page: number;
  pageSize: number;
};

type CreateTaskCommand = {
  teamId: string;
  title: string;
  description: string | null;
  assignedToUserId: string | null;
  dueDate: string | null;
  createdByUserId: string;
};

type UpdateTaskCommand = {
  teamId: string;
  taskId: string;
  version: number;
  title?: string;
  description?: string | null;
  status?: TaskStatus;
  assignedToUserId?: string | null;
  dueDate?: string | null;
};

type ListTaskResult = {
  items: Task[];
  page: number;
  pageSize: number;
  total: number;
};

export class TaskService {
  constructor(private readonly taskRepository: TaskRepository) {}

  listActiveTasks(teamId: string, query: ListTaskQuery): ListTaskResult {
    return this.taskRepository.listActiveTasks(teamId, query);
  }

  listDeletedTasks(teamId: string, page: number, pageSize: number): ListTaskResult {
    return this.taskRepository.listDeletedTasks(teamId, page, pageSize);
  }

  createTask(command: CreateTaskCommand): Task {
    return this.taskRepository.createTask(command);
  }

  updateTask(command: UpdateTaskCommand): Task {
    return this.taskRepository.updateTask(command.teamId, command.taskId, {
      version: command.version,
      title: command.title,
      description: command.description,
      status: command.status,
      assignedToUserId: command.assignedToUserId,
      dueDate: command.dueDate
    });
  }

  softDeleteTask(teamId: string, taskId: string): void {
    this.taskRepository.softDeleteTask(teamId, taskId);
  }

  restoreTask(teamId: string, taskId: string): Task {
    return this.taskRepository.restoreTask(teamId, taskId);
  }
}
