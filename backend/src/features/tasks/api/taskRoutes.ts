import { IncomingMessage, ServerResponse } from 'node:http';
import { AuthContext } from '../../../shared/auth/cognitoAuth';
import { assertTeamAccess } from '../../../shared/auth/authorization';
import { TaskRepository } from '../data/taskRepository';
import { TaskService } from '../application/taskService';
import {
  validateCreateTaskPayload,
  validateTaskId,
  validateTaskListQuery,
  validateTeamId,
  validateUpdateTaskPayload
} from './taskValidators';

const repository = new TaskRepository();
const service = new TaskService(repository);

function json(res: ServerResponse, status: number, body: unknown): void {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(body));
}

async function readRequestBody(req: IncomingMessage): Promise<unknown> {
  const chunks: Buffer[] = [];

  for await (const chunk of req) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }

  if (chunks.length === 0) {
    return {};
  }

  const raw = Buffer.concat(chunks).toString('utf8');
  if (raw.trim().length === 0) {
    return {};
  }

  return JSON.parse(raw) as unknown;
}

export async function handleTaskRoutes(
  req: IncomingMessage,
  res: ServerResponse,
  authContext: AuthContext
): Promise<boolean> {
  const parsedUrl = new URL(req.url ?? '/', 'http://localhost');
  const method = req.method ?? 'GET';

  const listMatch = parsedUrl.pathname.match(/^\/v1\/teams\/([^/]+)\/tasks$/);
  if (listMatch) {
    const teamId = validateTeamId(listMatch[1]);
    assertTeamAccess(authContext, teamId);

    if (method === 'GET') {
      const query = validateTaskListQuery(parsedUrl.searchParams);
      const response = service.listActiveTasks(teamId, query);
      json(res, 200, response);
      return true;
    }

    if (method === 'POST') {
      const body = await readRequestBody(req);
      const payload = validateCreateTaskPayload(body);

      const created = service.createTask({
        teamId,
        title: payload.title,
        description: payload.description,
        assignedToUserId: payload.assignedToUserId,
        dueDate: payload.dueDate,
        createdByUserId: authContext.userId
      });

      json(res, 201, created);
      return true;
    }

    return false;
  }

  const deletedMatch = parsedUrl.pathname.match(/^\/v1\/teams\/([^/]+)\/tasks\/deleted$/);
  if (deletedMatch && method === 'GET') {
    const teamId = validateTeamId(deletedMatch[1]);
    assertTeamAccess(authContext, teamId);

    const query = validateTaskListQuery(parsedUrl.searchParams);
    const response = service.listDeletedTasks(teamId, query.page, query.pageSize);
    json(res, 200, response);
    return true;
  }

  const restoreMatch = parsedUrl.pathname.match(/^\/v1\/teams\/([^/]+)\/tasks\/([^/]+)\/restore$/);
  if (restoreMatch && method === 'POST') {
    const teamId = validateTeamId(restoreMatch[1]);
    const taskId = validateTaskId(restoreMatch[2]);
    assertTeamAccess(authContext, teamId);

    const restored = service.restoreTask(teamId, taskId);
    json(res, 200, restored);
    return true;
  }

  const itemMatch = parsedUrl.pathname.match(/^\/v1\/teams\/([^/]+)\/tasks\/([^/]+)$/);
  if (itemMatch) {
    const teamId = validateTeamId(itemMatch[1]);
    const taskId = validateTaskId(itemMatch[2]);
    assertTeamAccess(authContext, teamId);

    if (method === 'PATCH') {
      const body = await readRequestBody(req);
      const payload = validateUpdateTaskPayload(body);

      const updated = service.updateTask({
        teamId,
        taskId,
        version: payload.version,
        title: payload.title,
        description: payload.description,
        status: payload.status,
        assignedToUserId: payload.assignedToUserId,
        dueDate: payload.dueDate
      });

      json(res, 200, updated);
      return true;
    }

    if (method === 'DELETE') {
      service.softDeleteTask(teamId, taskId);
      res.statusCode = 204;
      res.end();
      return true;
    }

    return false;
  }

  return false;
}
