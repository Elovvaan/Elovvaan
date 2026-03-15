export interface AuthApiResult {
  token: string;
  user?: Record<string, unknown>;
  message?: string;
}

const parseJsonSafely = async (response: Response) => {
  const text = await response.text();
  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text) as Record<string, unknown>;
  } catch {
    return text;
  }
};

const getMessageFromPayload = (payload: unknown): string | null => {
  if (!payload) {
    return null;
  }

  if (typeof payload === 'string') {
    return payload;
  }

  if (typeof payload === 'object') {
    const obj = payload as Record<string, unknown>;
    if (typeof obj.message === 'string' && obj.message.trim()) {
      return obj.message;
    }
    if (typeof obj.error === 'string' && obj.error.trim()) {
      return obj.error;
    }
  }

  return null;
};

const extractToken = (payload: unknown): string | null => {
  if (!payload || typeof payload !== 'object') {
    return null;
  }

  const obj = payload as Record<string, unknown>;
  const tokenCandidates = [obj.accessToken, obj.token, obj.jwt];

  for (const candidate of tokenCandidates) {
    if (typeof candidate === 'string' && candidate.trim()) {
      return candidate;
    }
  }

  return null;
};

const extractUser = (payload: unknown): Record<string, unknown> | undefined => {
  if (!payload || typeof payload !== 'object') {
    return undefined;
  }

  const user = (payload as Record<string, unknown>).user;
  if (user && typeof user === 'object') {
    return user as Record<string, unknown>;
  }

  return undefined;
};

const postAuth = async (path: '/api/auth/register' | '/api/auth/login', body: Record<string, string>) => {
  const response = await fetch(path, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  const payload = await parseJsonSafely(response);

  if (!response.ok) {
    const message = getMessageFromPayload(payload) ?? `Request failed with status ${response.status}`;
    throw new Error(message);
  }

  const token = extractToken(payload);
  if (!token) {
    throw new Error('Login succeeded but no token was returned by the backend.');
  }

  return {
    token,
    user: extractUser(payload),
    message: getMessageFromPayload(payload) ?? undefined,
  } satisfies AuthApiResult;
};

export const registerUser = async (payload: {
  name: string;
  email: string;
  password: string;
}) => {
  return postAuth('/api/auth/register', payload);
};

export const loginUser = async (payload: { email: string; password: string }) => {
  return postAuth('/api/auth/login', payload);
};
