import crypto from 'crypto';

export const SESSION_COOKIE_NAME = 'admin_session';

function getSecret() {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    throw new Error('SESSION_SECRET env var is not set');
  }
  return secret;
}

export function generateToken() {
  return crypto.createHmac('sha256', getSecret()).update('admin-authenticated').digest('hex');
}

export function isValidToken(token) {
  if (!token) return false;
  try {
    const expected = generateToken();
    const a = Buffer.from(token);
    const b = Buffer.from(expected);
    if (a.length !== b.length) return false;
    return crypto.timingSafeEqual(a, b);
  } catch (err) {
    return false;
  }
}
