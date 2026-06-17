'use client';
import { saveTextFile } from '@/common/file-utils';
import {
    buildGeoPayload,
    buildMailtoPayload,
    buildSmsPayload,
    buildVCardPayload,
    buildVEventPayload,
    buildWifiPayload,
    type EcLevel,
    type GeoFields,
    type MailtoFields,
    PAYLOAD_TYPE_LABELS,
    type QrPayloadType,
    type SmsFields,
    type VCardFields,
    type VEventFields,
    type WiFiEncryption,
    type WifiFields,
} from '@/common/qr-utils';
import { useToast } from '@/contexts/ToasterContext';
import Button from '@/controls/Button';
import SegmentedControl, { type SegmentedOption } from '@/controls/SegmentedControl';
import Select, { type SelectItem } from '@/controls/Select';
import { ToastType } from '@/controls/toaster/types';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

const EC_OPTIONS: SegmentedOption[] = [
    { value: 'L', label: 'L' },
    { value: 'M', label: 'M' },
    { value: 'Q', label: 'Q' },
    { value: 'H', label: 'H' },
];

const TYPE_ITEMS: SelectItem[] = Object.entries(PAYLOAD_TYPE_LABELS).map(([itemId, displayText]) => ({
    itemId,
    displayText,
}));

const QrPage: React.FC = () => {
    const { showToast } = useToast();

    const [payloadType, setPayloadType] = useState<QrPayloadType>('url');
    const [ecLevel, setEcLevel] = useState<EcLevel>('M');
    const [url, setUrl] = useState('');
    const [text, setText] = useState('');
    const [telPhone, setTelPhone] = useState('');
    const [wifiFields, setWifiFields] = useState<WifiFields>({
        ssid: '',
        password: '',
        encryption: 'WPA',
        hidden: false,
    });
    const [vcardFields, setVcardFields] = useState<VCardFields>({ name: '', phone: '', email: '', org: '', url: '' });
    const [veventFields, setVeventFields] = useState<VEventFields>({
        summary: '',
        dtstart: '',
        dtend: '',
        location: '',
        description: '',
    });
    const [mailtoFields, setMailtoFields] = useState<MailtoFields>({ email: '', subject: '', body: '' });
    const [smsFields, setSmsFields] = useState<SmsFields>({ phone: '', message: '' });
    const [geoFields, setGeoFields] = useState<GeoFields>({ lat: '', lon: '' });
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const payload = useMemo<string>(() => {
        switch (payloadType) {
            case 'url':
                return url.trim();
            case 'text':
                return text.trim();
            case 'tel':
                return telPhone.trim() ? `tel:${telPhone.trim()}` : '';
            case 'wifi':
                return wifiFields.ssid.trim() ? buildWifiPayload(wifiFields) : '';
            case 'vcard':
                return vcardFields.name.trim() ? buildVCardPayload(vcardFields) : '';
            case 'vevent':
                return veventFields.summary.trim() ? buildVEventPayload(veventFields) : '';
            case 'mailto':
                return mailtoFields.email.trim() ? buildMailtoPayload(mailtoFields) : '';
            case 'sms':
                return smsFields.phone.trim() ? buildSmsPayload(smsFields) : '';
            case 'geo':
                return geoFields.lat.trim() && geoFields.lon.trim() ? buildGeoPayload(geoFields) : '';
            default:
                return '';
        }
    }, [payloadType, url, text, telPhone, wifiFields, vcardFields, veventFields, mailtoFields, smsFields, geoFields]);

    useEffect(() => {
        if (!payload || !canvasRef.current) return;
        let cancelled = false;
        import('qrcode').then((QRCode) => {
            if (cancelled || !canvasRef.current) return;
            QRCode.toCanvas(canvasRef.current, payload, { errorCorrectionLevel: ecLevel, width: 300, margin: 2 }).catch(
                () => {
                    /* ignore */
                },
            );
        });
        return () => {
            cancelled = true;
        };
    }, [payload, ecLevel]);

    const handleDownloadPng = useCallback(async () => {
        if (!payload) return;
        const QRCode = await import('qrcode');
        const dataUrl = await QRCode.toDataURL(payload, { errorCorrectionLevel: ecLevel, width: 1024, margin: 2 });
        const a = document.createElement('a');
        a.href = dataUrl;
        a.download = 'qr.png';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }, [payload, ecLevel]);

    const handleDownloadSvg = useCallback(async () => {
        if (!payload) return;
        const QRCode = await import('qrcode');
        const svg = await QRCode.toString(payload, { type: 'svg', errorCorrectionLevel: ecLevel });
        saveTextFile({ fileName: 'qr', fileExtension: '.svg', fileMimeType: 'image/svg+xml', fileContent: svg });
    }, [payload, ecLevel]);

    const handleCopyPayload = useCallback(async () => {
        if (!payload) return;
        try {
            await navigator.clipboard.writeText(payload);
            showToast({ message: 'Payload copied', type: ToastType.SUCCESS });
        } catch {
            showToast({ message: 'Copy failed', type: ToastType.ERROR });
        }
    }, [payload, showToast]);

    return (
        <div className="qr-layout">
            <h1 className="qr-page-title">QR Generator</h1>

            <div className="qr-main">
                {/* Left column: form */}
                <div>
                    <div className="qr-section-label">Payload Type</div>
                    <div data-testid="qr-type-select">
                        <Select
                            items={TYPE_ITEMS}
                            selectedItem={payloadType}
                            onSelect={(item) => setPayloadType(item.itemId as QrPayloadType)}
                        />
                    </div>

                    {/* Form fields per type */}
                    <div className="qr-form">
                        {payloadType === 'url' && (
                            <div className="qr-field">
                                <label className="qr-field-label">URL</label>
                                <input
                                    data-testid="qr-url-input"
                                    className="cron-textarea"
                                    value={url}
                                    onChange={(e) => setUrl(e.target.value)}
                                    placeholder="https://example.com"
                                    type="url"
                                />
                            </div>
                        )}
                        {payloadType === 'text' && (
                            <div className="qr-field">
                                <label className="qr-field-label">Text</label>
                                <textarea
                                    className="cron-textarea"
                                    value={text}
                                    onChange={(e) => setText(e.target.value)}
                                    placeholder="Enter any text..."
                                />
                            </div>
                        )}
                        {payloadType === 'tel' && (
                            <div className="qr-field">
                                <label className="qr-field-label">Phone Number</label>
                                <input
                                    className="cron-textarea"
                                    value={telPhone}
                                    onChange={(e) => setTelPhone(e.target.value)}
                                    placeholder="+1234567890"
                                    type="tel"
                                />
                            </div>
                        )}
                        {payloadType === 'wifi' && (
                            <>
                                <div className="qr-field">
                                    <label className="qr-field-label">SSID (Network Name)</label>
                                    <input
                                        data-testid="qr-wifi-ssid"
                                        className="cron-textarea"
                                        value={wifiFields.ssid}
                                        onChange={(e) => setWifiFields((f) => ({ ...f, ssid: e.target.value }))}
                                        placeholder="MyNetwork"
                                        type="text"
                                    />
                                </div>
                                <div className="qr-field">
                                    <label className="qr-field-label">Password</label>
                                    <input
                                        data-testid="qr-wifi-password"
                                        className="cron-textarea"
                                        value={wifiFields.password}
                                        onChange={(e) => setWifiFields((f) => ({ ...f, password: e.target.value }))}
                                        placeholder="Password"
                                        type="password"
                                    />
                                </div>
                                <div className="qr-field">
                                    <label className="qr-field-label">Encryption</label>
                                    <SegmentedControl
                                        options={[
                                            { value: 'WPA', label: 'WPA/WPA2' },
                                            { value: 'WEP', label: 'WEP' },
                                            { value: 'nopass', label: 'None' },
                                        ]}
                                        value={wifiFields.encryption}
                                        onChange={(v) =>
                                            setWifiFields((f) => ({ ...f, encryption: v as WiFiEncryption }))
                                        }
                                        aria-label="WiFi encryption"
                                    />
                                </div>
                            </>
                        )}
                        {payloadType === 'vcard' && (
                            <>
                                <div className="qr-field">
                                    <label className="qr-field-label">Full Name *</label>
                                    <input
                                        className="cron-textarea"
                                        value={vcardFields.name}
                                        onChange={(e) => setVcardFields((f) => ({ ...f, name: e.target.value }))}
                                        placeholder="Jane Doe"
                                        type="text"
                                    />
                                </div>
                                <div className="qr-field">
                                    <label className="qr-field-label">Phone</label>
                                    <input
                                        className="cron-textarea"
                                        value={vcardFields.phone}
                                        onChange={(e) => setVcardFields((f) => ({ ...f, phone: e.target.value }))}
                                        placeholder="+1234567890"
                                        type="tel"
                                    />
                                </div>
                                <div className="qr-field">
                                    <label className="qr-field-label">Email</label>
                                    <input
                                        className="cron-textarea"
                                        value={vcardFields.email}
                                        onChange={(e) => setVcardFields((f) => ({ ...f, email: e.target.value }))}
                                        placeholder="jane@example.com"
                                        type="email"
                                    />
                                </div>
                                <div className="qr-field">
                                    <label className="qr-field-label">Organization</label>
                                    <input
                                        className="cron-textarea"
                                        value={vcardFields.org}
                                        onChange={(e) => setVcardFields((f) => ({ ...f, org: e.target.value }))}
                                        placeholder="Acme Corp"
                                        type="text"
                                    />
                                </div>
                                <div className="qr-field">
                                    <label className="qr-field-label">URL</label>
                                    <input
                                        className="cron-textarea"
                                        value={vcardFields.url}
                                        onChange={(e) => setVcardFields((f) => ({ ...f, url: e.target.value }))}
                                        placeholder="https://example.com"
                                        type="url"
                                    />
                                </div>
                            </>
                        )}
                        {payloadType === 'vevent' && (
                            <>
                                <div className="qr-field">
                                    <label className="qr-field-label">Summary *</label>
                                    <input
                                        className="cron-textarea"
                                        value={veventFields.summary}
                                        onChange={(e) => setVeventFields((f) => ({ ...f, summary: e.target.value }))}
                                        placeholder="Meeting title"
                                        type="text"
                                    />
                                </div>
                                <div className="qr-field">
                                    <label className="qr-field-label">Start (YYYYMMDDTHHMMSS)</label>
                                    <input
                                        className="cron-textarea"
                                        value={veventFields.dtstart}
                                        onChange={(e) => setVeventFields((f) => ({ ...f, dtstart: e.target.value }))}
                                        placeholder="20260101T090000"
                                        type="text"
                                    />
                                </div>
                                <div className="qr-field">
                                    <label className="qr-field-label">End (YYYYMMDDTHHMMSS)</label>
                                    <input
                                        className="cron-textarea"
                                        value={veventFields.dtend}
                                        onChange={(e) => setVeventFields((f) => ({ ...f, dtend: e.target.value }))}
                                        placeholder="20260101T100000"
                                        type="text"
                                    />
                                </div>
                                <div className="qr-field">
                                    <label className="qr-field-label">Location</label>
                                    <input
                                        className="cron-textarea"
                                        value={veventFields.location}
                                        onChange={(e) => setVeventFields((f) => ({ ...f, location: e.target.value }))}
                                        placeholder="Room 101"
                                        type="text"
                                    />
                                </div>
                                <div className="qr-field">
                                    <label className="qr-field-label">Description</label>
                                    <textarea
                                        className="cron-textarea"
                                        value={veventFields.description}
                                        onChange={(e) =>
                                            setVeventFields((f) => ({ ...f, description: e.target.value }))
                                        }
                                        placeholder="Meeting description..."
                                    />
                                </div>
                            </>
                        )}
                        {payloadType === 'mailto' && (
                            <>
                                <div className="qr-field">
                                    <label className="qr-field-label">Email Address *</label>
                                    <input
                                        className="cron-textarea"
                                        value={mailtoFields.email}
                                        onChange={(e) => setMailtoFields((f) => ({ ...f, email: e.target.value }))}
                                        placeholder="recipient@example.com"
                                        type="email"
                                    />
                                </div>
                                <div className="qr-field">
                                    <label className="qr-field-label">Subject</label>
                                    <input
                                        className="cron-textarea"
                                        value={mailtoFields.subject}
                                        onChange={(e) => setMailtoFields((f) => ({ ...f, subject: e.target.value }))}
                                        placeholder="Hello!"
                                        type="text"
                                    />
                                </div>
                                <div className="qr-field">
                                    <label className="qr-field-label">Body</label>
                                    <textarea
                                        className="cron-textarea"
                                        value={mailtoFields.body}
                                        onChange={(e) => setMailtoFields((f) => ({ ...f, body: e.target.value }))}
                                        placeholder="Message body..."
                                    />
                                </div>
                            </>
                        )}
                        {payloadType === 'sms' && (
                            <>
                                <div className="qr-field">
                                    <label className="qr-field-label">Phone Number *</label>
                                    <input
                                        className="cron-textarea"
                                        value={smsFields.phone}
                                        onChange={(e) => setSmsFields((f) => ({ ...f, phone: e.target.value }))}
                                        placeholder="+1234567890"
                                        type="tel"
                                    />
                                </div>
                                <div className="qr-field">
                                    <label className="qr-field-label">Message</label>
                                    <textarea
                                        className="cron-textarea"
                                        value={smsFields.message}
                                        onChange={(e) => setSmsFields((f) => ({ ...f, message: e.target.value }))}
                                        placeholder="Your message..."
                                    />
                                </div>
                            </>
                        )}
                        {payloadType === 'geo' && (
                            <>
                                <div className="qr-field">
                                    <label className="qr-field-label">Latitude *</label>
                                    <input
                                        className="cron-textarea"
                                        value={geoFields.lat}
                                        onChange={(e) => setGeoFields((f) => ({ ...f, lat: e.target.value }))}
                                        placeholder="51.5074"
                                        type="text"
                                    />
                                </div>
                                <div className="qr-field">
                                    <label className="qr-field-label">Longitude *</label>
                                    <input
                                        className="cron-textarea"
                                        value={geoFields.lon}
                                        onChange={(e) => setGeoFields((f) => ({ ...f, lon: e.target.value }))}
                                        placeholder="-0.1278"
                                        type="text"
                                    />
                                </div>
                            </>
                        )}
                    </div>

                    {/* EC level */}
                    <div className="qr-ec-row">
                        <span className="qr-section-label">Error Correction</span>
                        <SegmentedControl
                            options={EC_OPTIONS}
                            value={ecLevel}
                            onChange={(v) => setEcLevel(v as EcLevel)}
                            aria-label="Error correction level"
                        />
                    </div>

                    {/* Export row */}
                    <div className="qr-export-row">
                        <div data-testid="qr-download-png">
                            <Button
                                text="Download PNG"
                                variant="outlined"
                                onClick={handleDownloadPng}
                                disabled={!payload}
                            />
                        </div>
                        <div data-testid="qr-download-svg">
                            <Button
                                text="Download SVG"
                                variant="outlined"
                                onClick={handleDownloadSvg}
                                disabled={!payload}
                            />
                        </div>
                        <div data-testid="qr-copy-payload">
                            <Button
                                text="Copy Payload"
                                variant="text"
                                onClick={handleCopyPayload}
                                disabled={!payload}
                            />
                        </div>
                    </div>
                </div>

                {/* Right column: preview */}
                <div className="qr-preview-panel card pad">
                    <div className="qr-section-label">Preview</div>
                    <div className="qr-canvas-wrap">
                        {payload ? (
                            <canvas ref={canvasRef} data-testid="qr-canvas" />
                        ) : (
                            <div className="qr-canvas-placeholder" data-testid="qr-canvas-placeholder">
                                Enter details
                                <br />
                                to preview QR
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default QrPage;
