export type QrPayloadType = 'url' | 'text' | 'wifi' | 'vcard' | 'vevent' | 'mailto' | 'tel' | 'sms' | 'geo';
export type EcLevel = 'L' | 'M' | 'Q' | 'H';
export type WiFiEncryption = 'WPA' | 'WEP' | 'nopass';

export interface WifiFields {
    ssid: string;
    password: string;
    encryption: WiFiEncryption;
    hidden: boolean;
}

export interface VCardFields {
    name: string;
    phone: string;
    email: string;
    org: string;
    url: string;
}

export interface VEventFields {
    summary: string;
    dtstart: string;
    dtend: string;
    location: string;
    description: string;
}

export interface MailtoFields {
    email: string;
    subject: string;
    body: string;
}

export interface GeoFields {
    lat: string;
    lon: string;
}

export interface SmsFields {
    phone: string;
    message: string;
}

export const PAYLOAD_TYPE_LABELS: Record<QrPayloadType, string> = {
    url: 'URL',
    text: 'Plain Text',
    wifi: 'Wi-Fi',
    vcard: 'Contact (vCard)',
    vevent: 'Calendar Event',
    mailto: 'Email (mailto)',
    tel: 'Phone Number',
    sms: 'SMS',
    geo: 'Location (geo)',
};

// WiFi special chars that must be escaped: \ ; , " :
function escapeWifi(s: string): string {
    return s.replace(/[\\;,"]/g, (c) => `\\${c}`);
}

export function buildWifiPayload(f: WifiFields): string {
    const enc = f.encryption === 'nopass' ? 'nopass' : f.encryption;
    const hidden = f.hidden ? 'H:true;' : '';
    const pass = f.encryption === 'nopass' ? '' : `P:${escapeWifi(f.password)};`;
    return `WIFI:T:${enc};S:${escapeWifi(f.ssid)};${pass}${hidden};`;
}

export function buildVCardPayload(f: VCardFields): string {
    const lines = ['BEGIN:VCARD', 'VERSION:3.0', `FN:${f.name}`];
    if (f.phone) lines.push(`TEL:${f.phone}`);
    if (f.email) lines.push(`EMAIL:${f.email}`);
    if (f.org) lines.push(`ORG:${f.org}`);
    if (f.url) lines.push(`URL:${f.url}`);
    lines.push('END:VCARD');
    return lines.join('\n');
}

export function buildVEventPayload(f: VEventFields): string {
    const lines = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'BEGIN:VEVENT',
        `SUMMARY:${f.summary}`,
        `DTSTART:${f.dtstart}`,
        `DTEND:${f.dtend}`,
    ];
    if (f.location) lines.push(`LOCATION:${f.location}`);
    if (f.description) lines.push(`DESCRIPTION:${f.description}`);
    lines.push('END:VEVENT');
    lines.push('END:VCALENDAR');
    return lines.join('\n');
}

export function buildMailtoPayload(f: MailtoFields): string {
    const params: string[] = [];
    if (f.subject) params.push(`subject=${encodeURIComponent(f.subject)}`);
    if (f.body) params.push(`body=${encodeURIComponent(f.body)}`);
    const query = params.length ? `?${params.join('&')}` : '';
    return `mailto:${f.email}${query}`;
}

export function buildGeoPayload(f: GeoFields): string {
    return `geo:${f.lat},${f.lon}`;
}

export function buildSmsPayload(f: SmsFields): string {
    return f.message ? `smsto:${f.phone}:${f.message}` : `smsto:${f.phone}`;
}
