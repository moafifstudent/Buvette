import crypto from 'crypto';

const AUTH_COOKIE_NAME = 'buvette_admin_session';
const SESSION_SEPARATOR = '.';

function getAuthSecret() {
  return process.env.AUTH_SECRET || 'development-secret';
}

function base64UrlEncode(value: string) {
  return Buffer.from(value).toString('base64url');
}

function base64UrlDecode(value: string) {
  return Buffer.from(value, 'base64url').toString('utf8');
}

function signValue(value: string) {
  return crypto.createHmac('sha256', getAuthSecret()).update(value).digest('base64url');
}

export function createAuthToken() {
  const payload = JSON.stringify({ role: 'admin', issuedAt: Date.now() });
  const encodedPayload = base64UrlEncode(payload);
  const signature = signValue(encodedPayload);
  return `${encodedPayload}${SESSION_SEPARATOR}${signature}`;
}

export function verifyAuthToken(token: string | undefined | null) {
  if (!token) {
    return false;
  }

  const [payload, signature] = token.split(SESSION_SEPARATOR);
  if (!payload || !signature) {
    return false;
  }

  const expectedSignature = signValue(payload);
  if (signature !== expectedSignature) {
    return false;
  }

  try {
    const decoded = JSON.parse(base64UrlDecode(payload)) as { role?: string };
    return decoded.role === 'admin';
  } catch {
    return false;
  }
}

export function getAuthCookieName() {
  return AUTH_COOKIE_NAME;
}
