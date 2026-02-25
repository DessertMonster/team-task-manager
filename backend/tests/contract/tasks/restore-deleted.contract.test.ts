import { AddressInfo } from 'node:net';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { createApiServer } from '../../../src/app';

function createBearerToken(teamId: string): string {
  const header = Buffer.from(JSON.stringify({ alg: 'none', typ: 'JWT' })).toString('base64url');
  const payload = Buffer.from(
    JSON.stringify({
      sub: 'usr_contract_tester',
      team_ids: [teamId],
      scope: 'tasks:read tasks:write'
    })
  ).toString('base64url');

  return `${header}.${payload}.signature`;
}

describe('Tasks contract: deleted list + restore endpoints', () => {
  const teamId = 'team_contract123';
  const taskId = 'task_deleted789';
  const token = createBearerToken(teamId);

  const server = createApiServer();
  let baseUrl = '';

  beforeAll(async () => {
    await new Promise<void>((resolve) => {
      server.listen(0, '127.0.0.1', () => {
        const address = server.address() as AddressInfo;
        baseUrl = `http://127.0.0.1:${address.port}`;
        resolve();
      });
    });
  });

  afterAll(async () => {
    await new Promise<void>((resolve, reject) => {
      server.close((error) => {
        if (error) {
          reject(error);
          return;
        }
        resolve();
      });
    });
  });

  it('returns 200 and TaskListResponse shape for deleted tasks endpoint', async () => {
    const response = await fetch(`${baseUrl}/v1/teams/${teamId}/tasks/deleted?page=1&pageSize=20`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    expect(response.status).toBe(200);

    const body = (await response.json()) as Record<string, unknown>;
    expect(Array.isArray(body.items)).toBe(true);
    expect(typeof body.page).toBe('number');
    expect(typeof body.pageSize).toBe('number');
    expect(typeof body.total).toBe('number');
  });

  it('returns 200 and Task shape for restore endpoint', async () => {
    const response = await fetch(`${baseUrl}/v1/teams/${teamId}/tasks/${taskId}/restore`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    expect(response.status).toBe(200);

    const body = (await response.json()) as Record<string, unknown>;
    expect(body.id).toBe(taskId);
    expect(body.teamId).toBe(teamId);
    expect(typeof body.version).toBe('number');
    expect(body.deletedAt).toBeNull();
    expect(typeof body.updatedAt).toBe('string');
  });
});
