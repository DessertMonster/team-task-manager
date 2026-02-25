import { createServer, type IncomingMessage, type ServerResponse } from 'node:http';
import { buildAuthContext } from './shared/auth/cognitoAuth';
import { StaleVersionError } from './shared/concurrency/versionGuard';
import { handleTaskRoutes } from './features/tasks/api/taskRoutes';

type ApiError = {
  code: string;
  status: number;
  message: string;
  details?: Record<string, unknown>;
};

function json(res: ServerResponse, status: number, body: unknown): void {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(body));
}

function buildErrorEnvelope(error: ApiError, correlationId: string): Record<string, unknown> {
  return {
    code: error.code,
    message: error.message,
    details: error.details,
    correlationId
  };
}

function toApiError(error: unknown): ApiError {
  if (error instanceof StaleVersionError) {
    return {
      code: 'VERSION_CONFLICT',
      status: 409,
      message: error.message,
      details: {
        expectedVersion: error.expectedVersion,
        currentVersion: error.currentVersion
      }
    };
  }

  if (error instanceof Error && error.message.includes('Authorization')) {
    return { code: 'AUTH_UNAUTHORIZED', status: 401, message: error.message };
  }

  if (error instanceof Error && error.message.startsWith('Forbidden')) {
    return { code: 'AUTH_FORBIDDEN', status: 403, message: error.message };
  }

  if (error instanceof Error) {
    return { code: 'VALIDATION_ERROR', status: 422, message: error.message };
  }

  return { code: 'INTERNAL_ERROR', status: 500, message: 'Unexpected internal error' };
}

async function requestHandler(req: IncomingMessage, res: ServerResponse): Promise<void> {
  const correlationId = `req_${Date.now().toString(36)}`;

  try {
    if (req.url === '/v1/health' && req.method === 'GET') {
      json(res, 200, { status: 'ok' });
      return;
    }

    if (req.url?.startsWith('/v1/') && req.url !== '/v1/health') {
      const authContext = buildAuthContext(req.headers);
      const handled = await handleTaskRoutes(req, res, authContext);
      if (handled) {
        return;
      }
    }

    json(res, 404, {
      code: 'NOT_FOUND',
      message: 'Route not implemented yet',
      correlationId
    });
  } catch (error) {
    const apiError = toApiError(error);
    json(res, apiError.status, buildErrorEnvelope(apiError, correlationId));
  }
}

export function createApiServer() {
  return createServer((req, res) => {
    void requestHandler(req, res);
  });
}

if (process.env.NODE_ENV !== 'test') {
  const port = Number(process.env.PORT ?? 4000);
  createApiServer().listen(port, () => {
    process.stdout.write(`API listening on ${port}\n`);
  });
}
