import { fireEvent, render, screen } from '@testing-library/react';
import { PageProvider } from '../../src/components/contexts/PageContext';
import { ToasterProvider } from '../../src/components/contexts/ToasterContext';
import IndexPage from '../../src/pages/git-cheat-sheet/index';

function renderPage(): ReturnType<typeof render> {
    return render(
        <ToasterProvider>
            <PageProvider>
                <IndexPage />
            </PageProvider>
        </ToasterProvider>,
    );
}

describe('Git Cheat Sheet page', () => {
    it('renders the page heading', () => {
        renderPage();
        expect(screen.getByRole('heading', { name: /git cheat sheet/i })).toBeInTheDocument();
    });

    it('renders Interactive and Manual mode buttons', () => {
        renderPage();
        expect(screen.getByRole('button', { name: 'Interactive (automatic)' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Manual (step-by-step)' })).toBeInTheDocument();
    });

    it('Interactive mode is active by default (aria-pressed=true)', () => {
        renderPage();
        expect(screen.getByRole('button', { name: 'Interactive (automatic)' })).toHaveAttribute('aria-pressed', 'true');
    });

    it('Manual mode button is not active by default (aria-pressed=false)', () => {
        renderPage();
        expect(screen.getByRole('button', { name: 'Manual (step-by-step)' })).toHaveAttribute('aria-pressed', 'false');
    });

    it('shows empty-hint text in Interactive mode before generating', () => {
        renderPage();
        expect(screen.getByText(/fill in the form and click generate/i)).toBeInTheDocument();
    });

    it('renders Name and Email inputs in the form', () => {
        renderPage();
        expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    });

    it('renders Generate and Reset buttons', () => {
        renderPage();
        expect(screen.getByRole('button', { name: 'Generate' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Reset' })).toBeInTheDocument();
    });

    it('renders OS segmented control with macOS, Windows, Linux options', () => {
        renderPage();
        expect(screen.getByRole('button', { name: 'macOS' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Windows' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Linux' })).toBeInTheDocument();
    });

    it('renders Global config switch', () => {
        renderPage();
        expect(screen.getByRole('switch', { name: /global config/i })).toBeInTheDocument();
    });

    it('switching to Manual mode shows Install Git heading', () => {
        renderPage();
        fireEvent.click(screen.getByRole('button', { name: 'Manual (step-by-step)' }));
        expect(screen.getByText(/1\. install git/i)).toBeInTheDocument();
    });

    it('Manual mode shows all step headings', () => {
        renderPage();
        fireEvent.click(screen.getByRole('button', { name: 'Manual (step-by-step)' }));
        expect(screen.getByText(/2\. configure user info/i)).toBeInTheDocument();
        expect(screen.getByText(/3\. optional: ssh key setup/i)).toBeInTheDocument();
        expect(screen.getByText(/4\. optional: gpg commit signing/i)).toBeInTheDocument();
        expect(screen.getByText(/5\. verify setup/i)).toBeInTheDocument();
    });

    it('Manual mode shows OS chip selector (macOS, Windows, Ubuntu/Debian)', () => {
        renderPage();
        fireEvent.click(screen.getByRole('button', { name: 'Manual (step-by-step)' }));
        expect(screen.getByRole('button', { name: 'Ubuntu/Debian' })).toBeInTheDocument();
    });

    it('renders external doc links', () => {
        renderPage();
        expect(screen.getByRole('link', { name: /github ssh/i })).toBeInTheDocument();
        expect(screen.getByRole('link', { name: /github gpg/i })).toBeInTheDocument();
        expect(screen.getByRole('link', { name: /gitlab ssh/i })).toBeInTheDocument();
        expect(screen.getByRole('link', { name: /gitlab gpg/i })).toBeInTheDocument();
    });

    it('switching back from Manual to Interactive shows the form again', () => {
        renderPage();
        fireEvent.click(screen.getByRole('button', { name: 'Manual (step-by-step)' }));
        fireEvent.click(screen.getByRole('button', { name: 'Interactive (automatic)' }));
        expect(screen.getByRole('button', { name: 'Generate' })).toBeInTheDocument();
    });
});
