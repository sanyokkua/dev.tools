'use client';
import { copyToClipboard } from '@/common/clipboard-utils';
import type { JwtParts, JwtValidity } from '@/common/jwt-utils';
import { decodeJwt, formatNumericDate, getJwtValidity, hmacSign, hmacVerify } from '@/common/jwt-utils';
import { useToast } from '@/contexts/ToasterContext';
import Button from '@/controls/Button';
import Input from '@/controls/Input';
import SegmentedControl, { type SegmentedOption } from '@/controls/SegmentedControl';
import Switch from '@/controls/Switch';
import { ToastType } from '@/controls/toaster/types';
import React, { useCallback, useMemo, useState } from 'react';

type JwtMode = 'decode' | 'verify' | 'sign';
type Algorithm = 'HS256' | 'HS384' | 'HS512';
type VerifyState = 'idle' | 'valid' | 'invalid' | 'error';

const MODE_OPTIONS: SegmentedOption[] = [
    { value: 'decode', label: 'Decode' },
    { value: 'verify', label: 'Verify' },
    { value: 'sign', label: 'Sign' },
];

const ALG_OPTIONS: SegmentedOption[] = [
    { value: 'HS256', label: 'HS256' },
    { value: 'HS384', label: 'HS384' },
    { value: 'HS512', label: 'HS512' },
];

const VALIDITY_LABEL: Record<JwtValidity, string> = {
    'valid': 'Valid',
    'expired': 'Expired',
    'not-yet-valid': 'Not yet valid',
    'no-expiry': 'No expiry claim',
};

const VALIDITY_PILL: Record<JwtValidity, string> = {
    'valid': 'pill ok',
    'expired': 'pill no',
    'not-yet-valid': 'pill warn',
    'no-expiry': 'pill muted',
};

const DATE_CLAIMS = new Set(['exp', 'iat', 'nbf']);

function displayValue(v: unknown): string {
    if (typeof v === 'string') return v;
    return JSON.stringify(v);
}

const JwtPage: React.FC = () => {
    const { showToast } = useToast();
    const [mode, setMode] = useState<JwtMode>('decode');
    const [jwtInput, setJwtInput] = useState('');
    const [verifyState, setVerifyState] = useState<VerifyState>('idle');
    const [verifyRunning, setVerifyRunning] = useState(false);
    const [signPayload, setSignPayload] = useState('{\n  "sub": "user123",\n  "iat": 1700000000\n}');
    const [signResult, setSignResult] = useState('');
    const [signRunning, setSignRunning] = useState(false);
    const [secret, setSecret] = useState('');
    const [showSecret, setShowSecret] = useState(false);
    const [algorithm, setAlgorithm] = useState<Algorithm>('HS256');

    const decoded = useMemo<JwtParts | null>(() => decodeJwt(jwtInput), [jwtInput]);
    const validity = useMemo<JwtValidity | null>(() => (decoded ? getJwtValidity(decoded.payload) : null), [decoded]);

    const handleSwitchMode = useCallback((v: string): void => {
        setMode(v as JwtMode);
        setVerifyState('idle');
    }, []);

    const handlePaste = useCallback(async (): Promise<void> => {
        try {
            const text = await navigator.clipboard.readText();
            if (mode === 'sign') setSignPayload(text);
            else setJwtInput(text);
        } catch {
            showToast({ message: 'Clipboard read failed', type: ToastType.ERROR });
        }
    }, [mode, showToast]);

    const handleClear = useCallback((): void => {
        if (mode === 'sign') {
            setSignPayload('');
            setSignResult('');
        } else {
            setJwtInput('');
            setVerifyState('idle');
        }
    }, [mode]);

    const handleVerify = useCallback(async (): Promise<void> => {
        if (!jwtInput.trim() || !secret) return;
        setVerifyRunning(true);
        try {
            const ok = await hmacVerify(jwtInput, secret, algorithm);
            setVerifyState(ok ? 'valid' : 'invalid');
        } catch {
            setVerifyState('error');
        } finally {
            setVerifyRunning(false);
        }
    }, [jwtInput, secret, algorithm]);

    const handleSign = useCallback(async (): Promise<void> => {
        if (!signPayload.trim() || !secret) return;
        setSignRunning(true);
        try {
            const payloadObj = JSON.parse(signPayload) as Record<string, unknown>;
            const token = await hmacSign(payloadObj, secret, algorithm);
            setSignResult(token);
        } catch (e) {
            showToast({
                message: e instanceof SyntaxError ? 'Payload is not valid JSON' : 'Sign failed',
                type: ToastType.ERROR,
            });
        } finally {
            setSignRunning(false);
        }
    }, [signPayload, secret, algorithm, showToast]);

    const handleCopyResult = useCallback((): void => {
        copyToClipboard(signResult);
        showToast({ message: 'Copied to clipboard', type: ToastType.INFO });
    }, [signResult, showToast]);

    const sharedInputSection = (placeholder: string, testId: string): React.JSX.Element => (
        <div className="card pad">
            <div className="jwt-input-toolbar">
                <span className="jwt-section-label">JWT Token</span>
                <Button text="Paste" variant="text" size="small" onClick={handlePaste} />
                <Button text="Clear" variant="text" size="small" onClick={handleClear} />
            </div>
            <textarea
                className="jwt-textarea"
                data-testid={testId}
                value={jwtInput}
                onChange={(e) => {
                    setJwtInput(e.target.value);
                    setVerifyState('idle');
                }}
                placeholder={placeholder}
                spellCheck={false}
            />
        </div>
    );

    const secretRow = (idSuffix: string): React.JSX.Element => (
        <div className="jwt-controls-row">
            <div className="jwt-secret-field">
                <Input
                    type={showSecret ? 'text' : 'password'}
                    value={secret}
                    onChange={setSecret}
                    placeholder="HMAC secret"
                />
                <Switch
                    checked={showSecret}
                    onChange={(checked) => {
                        setShowSecret(checked);
                    }}
                    label="Show"
                    id={`show-secret-${idSuffix}`}
                />
            </div>
            <SegmentedControl
                options={ALG_OPTIONS}
                value={algorithm}
                onChange={(v) => setAlgorithm(v as Algorithm)}
                aria-label="HMAC algorithm"
            />
        </div>
    );

    return (
        <div className="jwt-layout">
            <h1 className="jwt-page-title">JWT</h1>

            <div className="jwt-toolbar">
                <SegmentedControl
                    options={MODE_OPTIONS}
                    value={mode}
                    onChange={handleSwitchMode}
                    aria-label="JWT mode"
                />
                <span className="jwt-privacy-badge">All operations run locally — secrets never leave your browser</span>
            </div>

            {/* ── DECODE ── */}
            {mode === 'decode' && (
                <div className="jwt-mode-content">
                    {sharedInputSection('Paste a JWT token here… (eyJhbGciOi…)', 'jwt-input')}
                    {decoded ? (
                        <div className="jwt-decoded-grid">
                            <div className="card pad">
                                <div className="jwt-section-label">Header</div>
                                <pre className="jwt-claims-pre" data-testid="jwt-header-output">
                                    {JSON.stringify(decoded.header, null, 2)}
                                </pre>
                            </div>
                            <div className="card pad">
                                <div className="jwt-section-label">
                                    Payload
                                    {validity && (
                                        <span
                                            className={VALIDITY_PILL[validity]}
                                            data-testid="jwt-validity"
                                            style={{ marginLeft: 'var(--s2)', fontSize: '11px' }}
                                        >
                                            {VALIDITY_LABEL[validity]}
                                        </span>
                                    )}
                                </div>
                                <table className="t" style={{ width: '100%' }}>
                                    <tbody>
                                        {Object.entries(decoded.payload).map(([k, v]) => {
                                            const formatted = DATE_CLAIMS.has(k) ? formatNumericDate(v) : null;
                                            return (
                                                <tr key={k}>
                                                    <td className="mono" style={{ width: '28%', fontWeight: 600 }}>
                                                        {k}
                                                    </td>
                                                    <td className="mono">
                                                        <div>{displayValue(v)}</div>
                                                        {formatted && (
                                                            <div style={{ color: 'var(--muted)', fontSize: '11px' }}>
                                                                {formatted}
                                                            </div>
                                                        )}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ) : jwtInput.trim() ? (
                        <div className="card pad">
                            <span className="pill no" data-testid="jwt-decode-error">
                                Invalid token — expected 3 base64url parts separated by dots
                            </span>
                        </div>
                    ) : null}
                </div>
            )}

            {/* ── VERIFY ── */}
            {mode === 'verify' && (
                <div className="jwt-mode-content">
                    {sharedInputSection('Paste a JWT token to verify…', 'jwt-input')}
                    <div className="card pad">
                        {secretRow('verify')}
                        <div style={{ marginTop: 'var(--s2)' }}>
                            <Button
                                text={verifyRunning ? 'Verifying…' : 'Verify'}
                                variant="solid"
                                disabled={!jwtInput.trim() || !secret || verifyRunning}
                                onClick={handleVerify}
                            />
                        </div>
                        {verifyState !== 'idle' && (
                            <div style={{ marginTop: 'var(--s3)' }}>
                                {verifyState === 'valid' && (
                                    <span className="pill ok" data-testid="jwt-verify-result">
                                        ✓ Signature valid
                                    </span>
                                )}
                                {verifyState === 'invalid' && (
                                    <span className="pill no" data-testid="jwt-verify-result">
                                        ✗ Signature invalid
                                    </span>
                                )}
                                {verifyState === 'error' && (
                                    <span className="pill warn" data-testid="jwt-verify-result">
                                        ⚠ Verification error
                                    </span>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* ── SIGN ── */}
            {mode === 'sign' && (
                <div className="jwt-mode-content">
                    <div className="card pad">
                        <div className="jwt-input-toolbar">
                            <span className="jwt-section-label">Payload (JSON)</span>
                            <Button text="Paste" variant="text" size="small" onClick={handlePaste} />
                            <Button text="Clear" variant="text" size="small" onClick={handleClear} />
                        </div>
                        <textarea
                            className="jwt-textarea"
                            data-testid="jwt-sign-payload"
                            value={signPayload}
                            onChange={(e) => setSignPayload(e.target.value)}
                            placeholder='{"sub":"user123","iat":1700000000}'
                            spellCheck={false}
                        />
                        {secretRow('sign')}
                        <div style={{ marginTop: 'var(--s2)' }}>
                            <Button
                                text={signRunning ? 'Signing…' : 'Sign'}
                                variant="solid"
                                disabled={!signPayload.trim() || !secret || signRunning}
                                onClick={handleSign}
                            />
                        </div>
                    </div>
                    {signResult && (
                        <div className="card pad">
                            <div className="jwt-input-toolbar">
                                <span className="jwt-section-label">Generated JWT</span>
                                <Button text="Copy" variant="text" size="small" onClick={handleCopyResult} />
                            </div>
                            <textarea
                                className="jwt-textarea"
                                data-testid="jwt-sign-output"
                                value={signResult}
                                readOnly
                                spellCheck={false}
                            />
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default JwtPage;
