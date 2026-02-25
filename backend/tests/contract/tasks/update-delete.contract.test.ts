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

describe('Tasks contract: PATCH/DELETE /v1/teams/{teamId}/tasks/{taskId}', () => {
  const teamId = 'team_contract123';
  const taskId = 'task_contract456';
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

  it('returns 200 and Task shape for update endpoint', async () => {
    const response = await fetch(`${baseUrl}/v1/teams/${teamId}/tasks/${taskId}`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        version: 1,
        title: 'Updated title',
        status: 'in_progress'
      })
    });

    expect(response.status).toBe(200);

    const body = (await response.json()) as Record<string, unknown>;
    expect(body.id).toBe(taskId);
    expect(body.teamId).toBe(teamId);
    expect(body.title).toBe('Updated title');
    expect(['open', 'in_progress', 'completed']).toContain(body.status);
    expect(typeof body.version).toBe('number');
    expect(typeof body.updatedAt).toBe('string');
  });

  it('returns 204 for soft-delete endpoint', async () => {
    const response = await fetch(`${baseUrl}/v1/teams/${teamId}/tasks/${taskId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    expect(response.status).toBe(204);
    expect(await response.text()).toBe('');
  });
});
