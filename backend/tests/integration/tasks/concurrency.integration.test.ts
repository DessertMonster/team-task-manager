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

describe('Tasks integration: stale-version conflict handling', () => {
  const teamId = 'team_integration123';
  const taskId = 'task_integration456';
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

  it('returns 409 VERSION_CONFLICT with version details when update version is stale', async () => {
    const response = await fetch(`${baseUrl}/v1/teams/${teamId}/tasks/${taskId}`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        version: 1,
        title: 'Stale write should be rejected'
      })
    });

    expect(response.status).toBe(409);

    const body = (await response.json()) as Record<string, unknown>;
    expect(body.code).toBe('VERSION_CONFLICT');
    expect(body.message).toBeTypeOf('string');

    const details = body.details as Record<string, unknown>;
    expect(typeof details.expectedVersion).toBe('number');
    expect(typeof details.currentVersion).toBe('number');
    expect(typeof body.correlationId).toBe('string');
  });
});
