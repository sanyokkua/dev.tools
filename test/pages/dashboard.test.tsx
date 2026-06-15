import { render, screen } from '@testing-library/react';
import React from 'react';
import { PageProvider } from '../../src/components/contexts/PageContext';
import { ToasterProvider } from '../../src/components/contexts/ToasterContext';
import Home from '../../src/pages/index';

jest.mock('next/link', () => {
    return function MockLink({
        href,
        children,
        className,
    }: {
        href: string;
        children: React.ReactNode;
        className?: string;
    }): React.JSX.Element {
        return (
            <a href={href} className={className}>
                {children}
            </a>
        );
    };
});

function renderPage(): ReturnType<typeof render> {
    return render(
        <ToasterProvider>
            <PageProvider>
                <Home />
            </PageProvider>
        </ToasterProvider>,
    );
}

describe('Dashboard page', () => {
    it('renders the h1 heading', () => {
        renderPage();
        expect(screen.getByRole('heading', { level: 1, name: 'Welcome to dev.tools' })).toBeInTheDocument();
    });

    it('renders all three group labels', () => {
        renderPage();
        expect(screen.getByText('Text & Code')).toBeInTheDocument();
        expect(screen.getByText('Install & Setup')).toBeInTheDocument();
        expect(screen.getByText('AI')).toBeInTheDocument();
    });

    it('renders 16 tool cards (one link per tool, Dashboard excluded)', () => {
        renderPage();
        const cards = screen.getAllByRole('link').filter((el) => el.classList.contains('dashboard-card'));
        expect(cards).toHaveLength(16);
    });

    it('Software Installer card has no NEW badge', () => {
        renderPage();
        expect(screen.queryByText('NEW')).not.toBeInTheDocument();
    });

    it('macOS Setup card displays the ⌘ icon', () => {
        renderPage();
        const cards = screen.getAllByRole('link').filter((el) => el.classList.contains('dashboard-card'));
        const macCard = cards.find((el) => el.textContent?.includes('macOS Setup'));
        expect(macCard?.textContent).toContain('⌘');
    });

    it('GitHub link is present and points to the correct URL', () => {
        renderPage();
        const githubLink = screen.getByRole('link', { name: 'GitHub' });
        expect(githubLink).toHaveAttribute('href', 'https://github.com/sanyokkua/dev.tools');
    });

    it('String Utils card links to /string-utils', () => {
        renderPage();
        const link = screen.getByRole('link', { name: /string utils/i });
        expect(link).toHaveAttribute('href', '/string-utils');
    });

    it('Software Installer card links to /software-installer', () => {
        renderPage();
        const cards = screen.getAllByRole('link').filter((el) => el.classList.contains('dashboard-card'));
        const installerCard = cards.find((el) => el.textContent?.includes('Software Installer'));
        expect(installerCard).toHaveAttribute('href', '/software-installer');
    });

    it('LLM VRAM Calculator card links to /llm-vram-calculator', () => {
        renderPage();
        const cards = screen.getAllByRole('link').filter((el) => el.classList.contains('dashboard-card'));
        const vramCard = cards.find((el) => el.textContent?.includes('LLM VRAM Calculator'));
        expect(vramCard).toHaveAttribute('href', '/llm-vram-calculator');
    });

    it('does not nest a second .app-main-container inside the page', () => {
        const { container } = renderPage();
        expect(container.querySelectorAll('.app-main-container')).toHaveLength(0);
    });

    it('wraps content in .page-shell', () => {
        const { container } = renderPage();
        expect(container.querySelector('.page-shell')).toBeInTheDocument();
    });
});
