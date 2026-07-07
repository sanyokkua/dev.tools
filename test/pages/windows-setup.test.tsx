import { fireEvent, render, screen } from '@testing-library/react';
import { PageProvider } from '../../src/components/contexts/PageContext';
import { ToasterProvider } from '../../src/components/contexts/ToasterContext';
import IndexPage from '../../src/pages/windows-setup/index';

function renderPage(): ReturnType<typeof render> {
    return render(
        <ToasterProvider>
            <PageProvider>
                <IndexPage />
            </PageProvider>
        </ToasterProvider>,
    );
}

describe('Windows Setup page', () => {
    it('renders both section buttons in the segmented control', () => {
        renderPage();
        expect(screen.getByRole('button', { name: 'Package managers' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Environment variables' })).toBeInTheDocument();
    });

    it('shows Package managers content by default', () => {
        renderPage();
        expect(screen.getByRole('button', { name: 'winget (built-in)' })).toBeInTheDocument();
    });

    it('switches to Environment variables section on click', () => {
        renderPage();
        fireEvent.click(screen.getByRole('button', { name: 'Environment variables' }));
        expect(screen.getAllByText(/SetEnvironmentVariable/).length).toBeGreaterThan(0);
    });

    it('Environment variables section covers registry verification and the setx pitfall', () => {
        renderPage();
        fireEvent.click(screen.getByRole('button', { name: 'Environment variables' }));
        expect(screen.getAllByText(/reg query|HKLM/i).length).toBeGreaterThan(0);
        expect(screen.getAllByText(/setx/i).length).toBeGreaterThan(0);
    });

    it('Package managers button is aria-pressed when active', () => {
        renderPage();
        const managersBtn = screen.getByRole('button', { name: 'Package managers' });
        expect(managersBtn).toHaveAttribute('aria-pressed', 'true');
    });

    it('switching manager chips shows relevant install content', () => {
        renderPage();
        fireEvent.click(screen.getByRole('button', { name: 'Chocolatey' }));
        expect(screen.getByText(/community.chocolatey.org/i)).toBeInTheDocument();
    });

    it('Package managers tab shows manual-install guidance regardless of selected manager', () => {
        renderPage();
        expect(screen.getByText(/Where to install manually downloaded tools/i)).toBeInTheDocument();
        fireEvent.click(screen.getByRole('button', { name: 'Scoop' }));
        expect(screen.getByText(/Where to install manually downloaded tools/i)).toBeInTheDocument();
    });
});
