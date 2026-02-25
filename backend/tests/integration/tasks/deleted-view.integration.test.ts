import { AddressInfo } from 'node:net';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { createApiServer } from '../../../src/app';

function createBearerToken(teamId: string): string {
  const header = Buffer.from(JSON.stringify({ alg: 'none', typ: 'JWT' })).toString('base64url');
  const payload = Buffer.from(
    JSON.stringify({
      sub: 'usr_integration_tester',
      team_ids: [teamId],
      scope: 'tasks:read tasks:write'
    })
  ).toString('base64url');

  return `${header}.${payload}.signature`;
}

describe('Tasks integration: deleted-task visibility rules', () => {
  const teamId = 'team_integration123';
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

  it('excludes deleted tasks from active list and exposes them in Recently Deleted list', async () => {
    const activeResponse = await fetch(`${baseUrl}/v1/teams/${teamId}/tasks?page=1&pageSize=50`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    expect(activeResponse.status).toBe(200);

    const activeBody = (await activeResponse.json()) as {
      items: Array<{ id: string; deletedAt: string | null }>;
    };

    expect(Array.isArray(activeBody.items)).toBe(true);
    for (const task of activeBody.items) {
      expect(task.deletedAt).toBeNull();
    }

    const deletedResponse = await fetch(`${baseUrl}/v1/teams/${teamId}/tasks/deleted?page=1&pageSize=50`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    expect(deletedResponse.status).toBe(200);

    const deletedBody = (await deletedResponse.json()) as {
      items: Array<{ id: string; deletedAt: string | null }>;
    };

    expect(Array.isArray(deletedBody.items)).toBe(true);
    for (const task of deletedBody.items) {
      expect(task.deletedAt).not.toBeNull();
    }
  });
});
