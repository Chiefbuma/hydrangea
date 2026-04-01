import type { User } from '@/lib/types';

export const SESSION_COOKIE_NAME = 'radiant_session';
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 12;

type SessionUser = Pick<User, 'id' | 'name' | 'email' | 'role'>;

type SessionPayload = SessionUser & {
  exp: number;
};

const encoder = new TextEncoder();
const decoder = new TextDecoder();

function bytesToBase64Url(bytes: Uint8Array) {
  let binary = '';

  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }

  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function base64UrlToBytes(value: string) {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
  const padding = '='.repeat((4 - (normalized.length % 4)) % 4);
  const binary = atob(`${normalized}${padding}`);

  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
}

async function getSigningKey() {
  const secret = process.env.SESSION_SECRET || 'radiant-local-dev-secret';

  return crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  );
}

async function sign(value: string) {
  const key = await getSigningKey();
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(value));
  return bytesToBase64Url(new Uint8Array(signature));
}

async function verify(value: string, signature: string) {
  const key = await getSigningKey();

  return crypto.subtle.verify(
    'HMAC',
    key,
    base64UrlToBytes(signature),
    encoder.encode(value)
  );
}

export async function createSessionToken(user: SessionUser) {
  const payload: SessionPayload = {
    ...user,
    exp: Date.now() + SESSION_MAX_AGE_SECONDS * 1000,
  };

  const encodedPayload = bytesToBase64Url(encoder.encode(JSON.stringify(payload)));
  const encodedSignature = await sign(encodedPayload);

  return `${encodedPayload}.${encodedSignature}`;
}

export async function verifySessionToken(token: string | undefined) {
  if (!token) {
    return null;
  }

  const [encodedPayload, signature] = token.split('.');

  if (!encodedPayload || !signature) {
    return null;
  }

  const isValid = await verify(encodedPayload, signature);

  if (!isValid) {
    return null;
  }

  const payload = JSON.parse(decoder.decode(base64UrlToBytes(encodedPayload))) as SessionPayload;

  if (!payload.exp || payload.exp < Date.now()) {
    return null;
  }

  return payload;
}

export function sessionCookieOptions() {
  return {
    httpOnly: true,
    sameSite: 'lax' as const,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: SESSION_MAX_AGE_SECONDS,
  };
}
