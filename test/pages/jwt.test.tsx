import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { FileOpenProvider } from '../../src/components/contexts/FileOpenContext';
import { FileSaveDialogProvider } from '../../src/components/contexts/FileSaveDialogContext';
import { PageProvider } from '../../src/components/contexts/PageContext';
import { ToasterProvider } from '../../src/components/contexts/ToasterContext';
import IndexPage from '../../src/pages/jwt/index';

const KNOWN_TOKEN =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9' +
    '.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ' +
    '.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';

function renderPage() {
    return render(
        <ToasterProvider>
            <PageProvider>
                <FileOpenProvider>
                    <FileSaveDialogProvider>
                        <IndexPage />
                    </FileSaveDialogProvider>
                </FileOpenProvider>
            </PageProvider>
        </ToasterProvider>,
    );
}

describe('JWT page', () => {
    it('renders ToolAbout (hidden by default)', () => {
        renderPage();
        expect(screen.queryByTestId('tool-about')).not.toBeInTheDocument();
    });

    it('renders the privacy badge text', () => {
        renderPage();
        expect(screen.getByText('All operations run locally — secrets never leave your browser')).toBeInTheDocument();
    });

    it('renders the mode selector with Decode, Verify, Sign buttons', () => {
        renderPage();
        const group = screen.getByRole('group', { name: 'JWT mode' });
        expect(group).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Decode' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Verify' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Sign' })).toBeInTheDocument();
    });

    it('shows Decode mode by default with a JWT textarea', () => {
        renderPage();
        expect(screen.getByTestId('jwt-input')).toBeInTheDocument();
    });

    describe('Decode mode', () => {
        it('shows no output when input is empty', () => {
            renderPage();
            expect(screen.queryByTestId('jwt-header-output')).not.toBeInTheDocument();
            expect(screen.queryByTestId('jwt-decode-error')).not.toBeInTheDocument();
        });

        it('shows error badge for invalid token', () => {
            renderPage();
            fireEvent.change(screen.getByTestId('jwt-input'), {
                target: { value: 'not.a.valid.jwt.with.too.many.parts' },
            });
            expect(screen.getByTestId('jwt-decode-error')).toBeInTheDocument();
        });

        it('decodes a valid JWT and shows header output', () => {
            renderPage();
            fireEvent.change(screen.getByTestId('jwt-input'), { target: { value: KNOWN_TOKEN } });
            const header = screen.getByTestId('jwt-header-output');
            expect(header).toBeInTheDocument();
            expect(header.textContent).toContain('HS256');
        });

        it('shows payload claims table with "John Doe"', () => {
            renderPage();
            fireEvent.change(screen.getByTestId('jwt-input'), { target: { value: KNOWN_TOKEN } });
            expect(screen.getByText('John Doe')).toBeInTheDocument();
        });

        it('shows formatted date for iat claim', () => {
            renderPage();
            fireEvent.change(screen.getByTestId('jwt-input'), { target: { value: KNOWN_TOKEN } });
            expect(screen.getByText('2018-01-18 01:30:22 UTC')).toBeInTheDocument();
        });

        it('shows "no-expiry" validity badge for a token without exp', () => {
            renderPage();
            fireEvent.change(screen.getByTestId('jwt-input'), { target: { value: KNOWN_TOKEN } });
            expect(screen.getByTestId('jwt-validity')).toHaveTextContent('No expiry claim');
        });
    });

    describe('Verify mode', () => {
        beforeEach(() => {
            renderPage();
            fireEvent.click(screen.getByRole('button', { name: 'Verify' }));
        });

        it('switches to Verify mode and shows Verify button', () => {
            const verifyBtns = screen.getAllByRole('button', { name: 'Verify' });
            expect(verifyBtns.length).toBeGreaterThanOrEqual(1);
        });

        it('shows algorithm selector with HS256/HS384/HS512', () => {
            const algGroup = screen.getByRole('group', { name: 'HMAC algorithm' });
            expect(algGroup).toBeInTheDocument();
            expect(screen.getByRole('button', { name: 'HS256' })).toBeInTheDocument();
            expect(screen.getByRole('button', { name: 'HS384' })).toBeInTheDocument();
            expect(screen.getByRole('button', { name: 'HS512' })).toBeInTheDocument();
        });

        it('shows "Signature invalid" for wrong secret', async () => {
            fireEvent.change(screen.getByTestId('jwt-input'), { target: { value: KNOWN_TOKEN } });
            fireEvent.change(screen.getByPlaceholderText('HMAC secret'), { target: { value: 'wrongsecret' } });
            const actionVerify = screen
                .getAllByRole('button', { name: 'Verify' })
                .find((b) => !b.closest('[role="group"][aria-label="JWT mode"]'))!;
            await act(async () => {
                fireEvent.click(actionVerify);
            });
            await waitFor(() => {
                expect(screen.getByTestId('jwt-verify-result')).toHaveTextContent('invalid');
            });
        });
    });

    describe('Sign mode', () => {
        beforeEach(() => {
            renderPage();
            fireEvent.click(screen.getByRole('button', { name: 'Sign' }));
        });

        it('switches to Sign mode and shows payload textarea', () => {
            expect(screen.getByTestId('jwt-sign-payload')).toBeInTheDocument();
        });

        it('Sign button is disabled when secret is empty', () => {
            const signBtns = screen.getAllByRole('button', { name: 'Sign' });
            const actionSign = signBtns.find((b) => !b.closest('[role="group"][aria-label="JWT mode"]'))!;
            expect(actionSign).toBeDisabled();
        });

        it('produces a JWT on Sign with valid payload + secret', async () => {
            fireEvent.change(screen.getByTestId('jwt-sign-payload'), {
                target: { value: '{"sub":"test","iat":1000000}' },
            });
            fireEvent.change(screen.getByPlaceholderText('HMAC secret'), { target: { value: 'testsecret' } });
            const signBtns = screen.getAllByRole('button', { name: 'Sign' });
            const actionSign = signBtns.find((b) => !b.closest('[role="group"][aria-label="JWT mode"]'))!;
            await act(async () => {
                fireEvent.click(actionSign);
            });
            await waitFor(() => {
                const out = screen.getByTestId('jwt-sign-output');
                expect(out).toBeInTheDocument();
                expect((out as HTMLTextAreaElement).value.split('.')).toHaveLength(3);
            });
        });

        it('shows toast error for invalid JSON payload', async () => {
            fireEvent.change(screen.getByTestId('jwt-sign-payload'), { target: { value: '{invalid json}' } });
            fireEvent.change(screen.getByPlaceholderText('HMAC secret'), { target: { value: 'secret' } });
            const signBtns = screen.getAllByRole('button', { name: 'Sign' });
            const actionSign = signBtns.find((b) => !b.closest('[role="group"][aria-label="JWT mode"]'))!;
            await act(async () => {
                fireEvent.click(actionSign);
            });
            await waitFor(() => {
                expect(screen.getByText(/not valid JSON/i)).toBeInTheDocument();
            });
        });
    });
});
