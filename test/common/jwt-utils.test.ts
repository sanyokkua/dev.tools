import {
    base64UrlDecode,
    decodeJwt,
    formatNumericDate,
    getJwtValidity,
    hmacSign,
    hmacVerify,
} from '../../src/common/jwt-utils';

const KNOWN_TOKEN =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9' +
    '.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ' +
    '.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';

describe('base64UrlDecode', () => {
    it('decodes a standard JWT header', () => {
        expect(base64UrlDecode('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9')).toBe('{"alg":"HS256","typ":"JWT"}');
    });

    it('handles strings that need no padding', () => {
        expect(base64UrlDecode('dGVzdA')).toBe('test');
    });

    it('converts - to + and _ to / before decoding', () => {
        expect(base64UrlDecode('eyJhbGciOiJIUzI1NiJ9')).toBe('{"alg":"HS256"}');
    });
});

describe('decodeJwt', () => {
    it('decodes a valid 3-part JWT into header and payload', () => {
        const result = decodeJwt(KNOWN_TOKEN);
        expect(result).not.toBeNull();
        expect(result!.header).toEqual({ alg: 'HS256', typ: 'JWT' });
        expect(result!.payload).toEqual({ sub: '1234567890', name: 'John Doe', iat: 1516239022 });
    });

    it('preserves raw parts in result', () => {
        const result = decodeJwt(KNOWN_TOKEN);
        expect(result!.raw.header).toBe('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9');
        expect(result!.raw.signature).toBe('SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c');
    });

    it('returns null for empty string', () => {
        expect(decodeJwt('')).toBeNull();
    });

    it('returns null for whitespace-only string', () => {
        expect(decodeJwt('   ')).toBeNull();
    });

    it('returns null for fewer than 3 parts', () => {
        expect(decodeJwt('part1.part2')).toBeNull();
    });

    it('returns null for more than 3 parts', () => {
        expect(decodeJwt('a.b.c.d')).toBeNull();
    });

    it('returns null for invalid base64url header', () => {
        expect(decodeJwt('!!!.eyJzdWIiOiJ0ZXN0In0.sig')).toBeNull();
    });

    it('returns null when header is not JSON', () => {
        expect(decodeJwt('dGVzdA.eyJzdWIiOiJ0ZXN0In0.sig')).toBeNull();
    });

    it('trims surrounding whitespace before parsing', () => {
        const result = decodeJwt('  ' + KNOWN_TOKEN + '\n');
        expect(result).not.toBeNull();
        expect(result!.header.alg).toBe('HS256');
    });
});

describe('getJwtValidity', () => {
    const now = Math.floor(Date.now() / 1000);

    it('returns "no-expiry" when no exp or nbf claim', () => {
        expect(getJwtValidity({ sub: 'test' })).toBe('no-expiry');
    });

    it('returns "valid" when exp is in the future', () => {
        expect(getJwtValidity({ exp: now + 3600 })).toBe('valid');
    });

    it('returns "expired" when exp is in the past', () => {
        expect(getJwtValidity({ exp: now - 3600 })).toBe('expired');
    });

    it('returns "not-yet-valid" when nbf is in the future (with exp also in future)', () => {
        expect(getJwtValidity({ exp: now + 3600, nbf: now + 1800 })).toBe('not-yet-valid');
    });

    it('returns "not-yet-valid" when nbf is in the future and there is no exp', () => {
        expect(getJwtValidity({ nbf: now + 3600 })).toBe('not-yet-valid');
    });

    it('returns "valid" when nbf is in the past and exp is in the future', () => {
        expect(getJwtValidity({ exp: now + 3600, nbf: now - 60 })).toBe('valid');
    });

    it('ignores non-numeric exp', () => {
        expect(getJwtValidity({ exp: 'not-a-number' })).toBe('no-expiry');
    });

    it('ignores non-numeric nbf', () => {
        expect(getJwtValidity({ nbf: 'not-a-number', exp: now + 3600 })).toBe('valid');
    });
});

describe('formatNumericDate', () => {
    it('formats a unix timestamp as "YYYY-MM-DD HH:MM:SS UTC"', () => {
        const result = formatNumericDate(1516239022);
        expect(result).toBe('2018-01-18 01:30:22 UTC');
    });

    it('returns null for a string value', () => {
        expect(formatNumericDate('not-a-number')).toBeNull();
    });

    it('returns null for null', () => {
        expect(formatNumericDate(null)).toBeNull();
    });

    it('returns null for undefined', () => {
        expect(formatNumericDate(undefined)).toBeNull();
    });

    it('handles epoch (timestamp 0) correctly', () => {
        const result = formatNumericDate(0);
        expect(result).toContain('1970-01-01');
    });
});

describe('hmacSign + hmacVerify', () => {
    const payload = { sub: 'test', iat: 1000000 };

    it('sign returns a 3-part JWT string', async () => {
        const token = await hmacSign(payload, 'testsecret', 'HS256');
        expect(token.split('.')).toHaveLength(3);
    });

    it('sign then verify with same secret returns true (HS256)', async () => {
        const token = await hmacSign(payload, 'testsecret', 'HS256');
        expect(await hmacVerify(token, 'testsecret', 'HS256')).toBe(true);
    });

    it('verify with wrong secret returns false', async () => {
        const token = await hmacSign(payload, 'correct', 'HS256');
        expect(await hmacVerify(token, 'wrong', 'HS256')).toBe(false);
    });

    it('sign embeds the correct alg in the header (HS384)', async () => {
        const token = await hmacSign(payload, 'secret', 'HS384');
        const decoded = decodeJwt(token);
        expect(decoded!.header.alg).toBe('HS384');
        expect(await hmacVerify(token, 'secret', 'HS384')).toBe(true);
    });

    it('sign embeds the correct alg in the header (HS512)', async () => {
        const token = await hmacSign(payload, 'secret', 'HS512');
        const decoded = decodeJwt(token);
        expect(decoded!.header.alg).toBe('HS512');
        expect(await hmacVerify(token, 'secret', 'HS512')).toBe(true);
    });

    it('verify returns false for malformed token (< 3 parts)', async () => {
        expect(await hmacVerify('not.a.valid', 'secret', 'HS256')).toBe(false);
    });

    it('verify returns false (not throws) for invalid base64 in signature', async () => {
        expect(await hmacVerify('eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ0ZXN0In0.!!!', 'secret', 'HS256')).toBe(false);
    });

    it('sign handles Unicode characters in payload claims', async () => {
        const unicodePayload = { name: 'Ångström', sub: 'test' };
        const token = await hmacSign(unicodePayload, 'secret', 'HS256');
        const decoded = decodeJwt(token);
        expect(decoded!.payload.name).toBe('Ångström');
        expect(await hmacVerify(token, 'secret', 'HS256')).toBe(true);
    });
});
