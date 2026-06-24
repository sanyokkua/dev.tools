export function base64UrlDecode(str: string): string {
    const base64 = str.replaceAll('-', '+').replaceAll('_', '/');
    const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
    const bytes = Uint8Array.from(atob(padded), (c) => c.charCodeAt(0));
    return new TextDecoder().decode(bytes);
}

export interface JwtParts {
    header: Record<string, unknown>;
    payload: Record<string, unknown>;
    raw: { header: string; payload: string; signature: string };
}

export function decodeJwt(token: string): JwtParts | null {
    const parts = token.trim().split('.');
    if (parts.length !== 3) return null;
    try {
        const header = JSON.parse(base64UrlDecode(parts[0])) as Record<string, unknown>;
        const payload = JSON.parse(base64UrlDecode(parts[1])) as Record<string, unknown>;
        return { header, payload, raw: { header: parts[0], payload: parts[1], signature: parts[2] } };
    } catch {
        return null;
    }
}

export type JwtValidity = 'valid' | 'expired' | 'not-yet-valid' | 'no-expiry';

export function getJwtValidity(payload: Record<string, unknown>): JwtValidity {
    const now = Math.floor(Date.now() / 1000);
    if ('nbf' in payload && typeof payload.nbf === 'number' && payload.nbf > now) {
        return 'not-yet-valid';
    }
    if ('exp' in payload && typeof payload.exp === 'number') {
        return payload.exp > now ? 'valid' : 'expired';
    }
    return 'no-expiry';
}

export function formatNumericDate(value: unknown): string | null {
    if (typeof value !== 'number') return null;
    try {
        return new Date(value * 1000)
            .toISOString()
            .replace('T', ' ')
            .replace(/\.\d{3}/, '')
            .replace('Z', ' UTC');
    } catch {
        return null;
    }
}

const ALG_MAP: Record<string, string> = { HS256: 'SHA-256', HS384: 'SHA-384', HS512: 'SHA-512' };

async function importHmacKey(secret: string, hash: string): Promise<CryptoKey> {
    return crypto.subtle.importKey(
        'raw',
        new TextEncoder().encode(secret),
        { name: 'HMAC', hash: { name: hash } },
        false,
        ['sign', 'verify'],
    );
}

function encodeBase64Url(obj: object): string {
    const json = JSON.stringify(obj);
    const bytes = new TextEncoder().encode(json);
    return btoa(String.fromCodePoint(...bytes))
        .replaceAll('+', '-')
        .replaceAll('/', '_')
        .replace(/=+$/, '');
}

export async function hmacVerify(
    token: string,
    secret: string,
    algorithm: 'HS256' | 'HS384' | 'HS512',
): Promise<boolean> {
    try {
        const parts = token.trim().split('.');
        if (parts.length !== 3) return false;
        const key = await importHmacKey(secret, ALG_MAP[algorithm]);
        const data = new TextEncoder().encode(parts[0] + '.' + parts[1]);
        const sigBase64 = parts[2].replaceAll('-', '+').replaceAll('_', '/');
        const sigPadded = sigBase64 + '='.repeat((4 - (sigBase64.length % 4)) % 4);
        const sig = Uint8Array.from(atob(sigPadded), (c) => c.charCodeAt(0));
        return await crypto.subtle.verify('HMAC', key, sig, data);
    } catch {
        return false;
    }
}

export async function hmacSign(
    payload: Record<string, unknown>,
    secret: string,
    algorithm: 'HS256' | 'HS384' | 'HS512',
): Promise<string> {
    const header = { alg: algorithm, typ: 'JWT' };
    const headerB64 = encodeBase64Url(header);
    const payloadB64 = encodeBase64Url(payload);
    const key = await importHmacKey(secret, ALG_MAP[algorithm]);
    const data = new TextEncoder().encode(headerB64 + '.' + payloadB64);
    const sigBuf = await crypto.subtle.sign('HMAC', key, data);
    const sigB64 = btoa(String.fromCodePoint(...new Uint8Array(sigBuf)))
        .replaceAll('+', '-')
        .replaceAll('/', '_')
        .replace(/=+$/, '');
    return `${headerB64}.${payloadB64}.${sigB64}`;
}
