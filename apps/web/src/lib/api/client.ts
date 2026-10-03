const API_BASE_URL = '/api';

export class ApiError extends Error {
  public readonly status: number;

  constructor(
    message: string,
    status: number,
  ) {
    super(message);
    this.status = status;
  }
}

function getErrorMessage(payload: unknown): string {
  if (!payload || typeof payload !== 'object') {
    return 'No fue posible completar la solicitud.';
  }

  const message = (payload as { message?: unknown }).message;

  if (Array.isArray(message)) {
    return message.join(', ');
  }

  if (typeof message === 'string') {
    return message;
  }

  const error = (payload as { error?: unknown }).error;

  if (typeof error === 'string') {
    return error;
  }

  return 'No fue posible completar la solicitud.';
}

async function readResponsePayload(response: Response): Promise<unknown> {
  const contentType = response.headers.get('content-type') ?? '';

  if (contentType.includes('application/json')) {
    return response.json();
  }

  const text = await response.text();
  return text || null;
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers: {
        ...(options.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
        ...options.headers,
      },
    });
  } catch {
    throw new ApiError(
      'No fue posible conectar con el servicio. Verifica tu conexión e inténtalo nuevamente.',
      0,
    );
  }

  const payload = await readResponsePayload(response);

  if (!response.ok) {
    throw new ApiError(getErrorMessage(payload), response.status);
  }

  return payload as T;
}

export function getApiAssetUrl(path: string | null | undefined): string | undefined {
  if (!path) return undefined;
  if (/^https?:\/\//.test(path)) return path;
  return `${API_BASE_URL}${path}`;
}
