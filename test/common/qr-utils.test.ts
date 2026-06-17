import {
    buildGeoPayload,
    buildMailtoPayload,
    buildSmsPayload,
    buildVCardPayload,
    buildVEventPayload,
    buildWifiPayload,
    PAYLOAD_TYPE_LABELS,
} from '../../src/common/qr-utils';

describe('buildWifiPayload', () => {
    it('WPA with clean SSID and password starts with WIFI:T:WPA;S:...', () => {
        const result = buildWifiPayload({ ssid: 'MyNetwork', password: 'secret', encryption: 'WPA', hidden: false });
        expect(result).toContain('WIFI:T:WPA;S:MyNetwork;');
        expect(result).toContain('P:secret;');
    });

    it('escapes semicolon in SSID', () => {
        const result = buildWifiPayload({ ssid: 'My;Net', password: 'pass', encryption: 'WPA', hidden: false });
        expect(result).toContain('S:My\\;Net;');
    });

    it('escapes backslash in SSID', () => {
        const result = buildWifiPayload({ ssid: 'My\\Net', password: 'pass', encryption: 'WPA', hidden: false });
        expect(result).toContain('S:My\\\\Net;');
    });

    it('escapes double-quote in SSID', () => {
        const result = buildWifiPayload({ ssid: 'My"Net', password: 'pass', encryption: 'WPA', hidden: false });
        expect(result).toContain('S:My\\"Net;');
    });

    it('escapes comma in password', () => {
        const result = buildWifiPayload({ ssid: 'MyNet', password: 'pass,word', encryption: 'WPA', hidden: false });
        expect(result).toContain('P:pass\\,word;');
    });

    it('hidden=true adds H:true; to the output', () => {
        const result = buildWifiPayload({ ssid: 'HiddenNet', password: 'pass', encryption: 'WPA', hidden: true });
        expect(result).toContain('H:true;');
    });

    it('hidden=false does not add H:true; to the output', () => {
        const result = buildWifiPayload({ ssid: 'VisibleNet', password: 'pass', encryption: 'WPA', hidden: false });
        expect(result).not.toContain('H:true;');
    });

    it('nopass encryption does not include password and uses T:nopass', () => {
        const result = buildWifiPayload({ ssid: 'OpenNet', password: '', encryption: 'nopass', hidden: false });
        expect(result).toContain('T:nopass');
        expect(result).not.toContain('P:');
    });

    it('empty password with WPA produces empty P: field', () => {
        const result = buildWifiPayload({ ssid: 'MyNet', password: '', encryption: 'WPA', hidden: false });
        expect(result).toContain('P:;');
    });
});

describe('buildVCardPayload', () => {
    const fullFields = {
        name: 'John Doe',
        phone: '+1234567890',
        email: 'john@example.com',
        org: 'Acme Corp',
        url: 'https://example.com',
    };

    it('all fields are present in the output', () => {
        const result = buildVCardPayload(fullFields);
        expect(result).toContain('FN:John Doe');
        expect(result).toContain('TEL:+1234567890');
        expect(result).toContain('EMAIL:john@example.com');
        expect(result).toContain('ORG:Acme Corp');
        expect(result).toContain('URL:https://example.com');
    });

    it('output starts with BEGIN:VCARD and ends with END:VCARD', () => {
        const result = buildVCardPayload(fullFields);
        expect(result.startsWith('BEGIN:VCARD')).toBe(true);
        expect(result.endsWith('END:VCARD')).toBe(true);
    });

    it('empty org — ORG: line is not present in output', () => {
        const result = buildVCardPayload({ ...fullFields, org: '' });
        expect(result).not.toContain('ORG:');
    });

    it('empty url — URL: line is not present in output', () => {
        const result = buildVCardPayload({ ...fullFields, url: '' });
        expect(result).not.toContain('URL:');
    });

    it('name with spaces is preserved in FN: line', () => {
        const result = buildVCardPayload({ ...fullFields, name: 'Jane Mary Doe' });
        expect(result).toContain('FN:Jane Mary Doe');
    });

    it('output contains VERSION:3.0', () => {
        const result = buildVCardPayload(fullFields);
        expect(result).toContain('VERSION:3.0');
    });
});

describe('buildVEventPayload', () => {
    const fullFields = {
        summary: 'Team Meeting',
        dtstart: '20240101T090000Z',
        dtend: '20240101T100000Z',
        location: 'Conference Room A',
        description: 'Weekly sync',
    };

    it('all fields are present in the output', () => {
        const result = buildVEventPayload(fullFields);
        expect(result).toContain('SUMMARY:Team Meeting');
        expect(result).toContain('DTSTART:20240101T090000Z');
        expect(result).toContain('DTEND:20240101T100000Z');
        expect(result).toContain('LOCATION:Conference Room A');
        expect(result).toContain('DESCRIPTION:Weekly sync');
    });

    it('output starts with BEGIN:VCALENDAR and ends with END:VCALENDAR', () => {
        const result = buildVEventPayload(fullFields);
        expect(result.startsWith('BEGIN:VCALENDAR')).toBe(true);
        expect(result.endsWith('END:VCALENDAR')).toBe(true);
    });

    it('output contains BEGIN:VEVENT and END:VEVENT', () => {
        const result = buildVEventPayload(fullFields);
        expect(result).toContain('BEGIN:VEVENT');
        expect(result).toContain('END:VEVENT');
    });

    it('empty location — LOCATION line is not present', () => {
        const result = buildVEventPayload({ ...fullFields, location: '' });
        expect(result).not.toContain('LOCATION:');
    });

    it('empty description — DESCRIPTION line is not present', () => {
        const result = buildVEventPayload({ ...fullFields, description: '' });
        expect(result).not.toContain('DESCRIPTION:');
    });

    it('required fields only (empty location and description) produces valid minimal output', () => {
        const result = buildVEventPayload({ ...fullFields, location: '', description: '' });
        expect(result).toContain('BEGIN:VCALENDAR');
        expect(result).toContain('BEGIN:VEVENT');
        expect(result).toContain('SUMMARY:Team Meeting');
        expect(result).toContain('DTSTART:20240101T090000Z');
        expect(result).toContain('DTEND:20240101T100000Z');
        expect(result).toContain('END:VEVENT');
        expect(result).toContain('END:VCALENDAR');
    });
});

describe('buildMailtoPayload', () => {
    it('email only — returns mailto:email without query string', () => {
        const result = buildMailtoPayload({ email: 'email@example.com', subject: '', body: '' });
        expect(result).toBe('mailto:email@example.com');
    });

    it('email + subject — contains ?subject=Hello', () => {
        const result = buildMailtoPayload({ email: 'email@example.com', subject: 'Hello', body: '' });
        expect(result).toContain('?subject=Hello');
    });

    it('email + subject + body — contains both subject and body params', () => {
        const result = buildMailtoPayload({ email: 'email@example.com', subject: 'Hello', body: 'World' });
        expect(result).toContain('subject=Hello');
        expect(result).toContain('body=World');
    });

    it('subject with spaces is URI-encoded', () => {
        const result = buildMailtoPayload({ email: 'email@example.com', subject: 'Hello World', body: '' });
        // encodeURIComponent encodes spaces as %20
        expect(result).toContain('subject=Hello%20World');
        expect(result).not.toContain('subject=Hello World');
    });

    it('email + body only (no subject) — contains body= but not subject=', () => {
        const result = buildMailtoPayload({ email: 'email@example.com', subject: '', body: 'Just a message' });
        expect(result).toContain('body=');
        expect(result).not.toContain('subject=');
    });
});

describe('buildGeoPayload', () => {
    it('positive lat/lon — returns geo:51.5074,-0.1278', () => {
        const result = buildGeoPayload({ lat: '51.5074', lon: '-0.1278' });
        expect(result).toBe('geo:51.5074,-0.1278');
    });

    it('negative lat — handles minus sign correctly', () => {
        const result = buildGeoPayload({ lat: '-33.8688', lon: '151.2093' });
        expect(result).toBe('geo:-33.8688,151.2093');
    });

    it('negative lon — handles minus sign correctly', () => {
        const result = buildGeoPayload({ lat: '40.7128', lon: '-74.0060' });
        expect(result).toBe('geo:40.7128,-74.0060');
    });

    it('decimal precision is preserved', () => {
        const result = buildGeoPayload({ lat: '48.858844', lon: '2.294351' });
        expect(result).toBe('geo:48.858844,2.294351');
    });
});

describe('buildSmsPayload', () => {
    it('phone + message — returns smsto:phone:message', () => {
        const result = buildSmsPayload({ phone: '+1234567890', message: 'Hello!' });
        expect(result).toBe('smsto:+1234567890:Hello!');
    });

    it('phone only (empty message) — returns smsto:phone without trailing colon', () => {
        const result = buildSmsPayload({ phone: '+1234567890', message: '' });
        expect(result).toBe('smsto:+1234567890');
    });

    it('message with colons — colon in message is preserved', () => {
        const result = buildSmsPayload({ phone: '+1234567890', message: 'Time: 09:00' });
        expect(result).toBe('smsto:+1234567890:Time: 09:00');
    });
});

describe('PAYLOAD_TYPE_LABELS', () => {
    const expectedTypes: Array<keyof typeof PAYLOAD_TYPE_LABELS> = [
        'url',
        'text',
        'wifi',
        'vcard',
        'vevent',
        'mailto',
        'tel',
        'sms',
        'geo',
    ];

    it('has all 9 payload types', () => {
        expect(Object.keys(PAYLOAD_TYPE_LABELS)).toHaveLength(9);
    });

    it.each(expectedTypes)('label for "%s" is a non-empty string', (type) => {
        const label = PAYLOAD_TYPE_LABELS[type];
        expect(typeof label).toBe('string');
        expect(label.length).toBeGreaterThan(0);
    });
});
