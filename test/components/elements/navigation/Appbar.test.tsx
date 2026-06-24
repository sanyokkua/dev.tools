import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import Appbar from '../../../../src/components/elements/navigation/appbar/Appbar';

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

describe('Appbar', () => {
    it('renders the logo button that calls onLogoClick (sidebar toggle)', () => {
        const onLogoClick = jest.fn();
        render(<Appbar appTitle="dev.tools" pageTitle="Dashboard" onLogoClick={onLogoClick} />);
        const logoBtn = screen.getByRole('button', { name: /toggle sidebar/i });
        fireEvent.click(logoBtn);
        expect(onLogoClick).toHaveBeenCalledTimes(1);
    });

    it('app title is a link to "/"', () => {
        render(<Appbar appTitle="dev.tools" pageTitle="" />);
        const brandLink = screen.getByRole('link', { name: /dev\.tools/i });
        expect(brandLink).toHaveAttribute('href', '/');
    });

    it('GitHub link shows "GitHub ↗" text and opens in new tab', () => {
        render(<Appbar appTitle="dev.tools" pageTitle="" />);
        const githubLink = screen.getByRole('link', { name: /source on github/i });
        expect(githubLink.textContent).toBe('GitHub ↗');
        expect(githubLink).toHaveAttribute('target', '_blank');
        expect(githubLink).toHaveAttribute('rel', 'noopener noreferrer');
    });

    it('renders page title crumb when pageTitle is provided', () => {
        render(<Appbar appTitle="dev.tools" pageTitle="String Utils" />);
        expect(screen.getByText('String Utils')).toBeInTheDocument();
    });

    it('does not render crumb when pageTitle is empty', () => {
        const { container } = render(<Appbar appTitle="dev.tools" pageTitle="" />);
        expect(container.querySelector('.topbar-crumb')).toBeNull();
    });

    it('shows moon icon in light theme and sun in dark theme', () => {
        const { rerender } = render(
            <Appbar appTitle="dev.tools" pageTitle="" theme="light" onThemeToggle={() => {}} />,
        );
        const toggleBtn = screen.getByRole('button', { name: /toggle theme/i });
        expect(toggleBtn.textContent).toBe('🌙');

        rerender(<Appbar appTitle="dev.tools" pageTitle="" theme="dark" onThemeToggle={() => {}} />);
        expect(toggleBtn.textContent).toBe('☀');
    });

    it('menu-btn--visible class applied when sidebarCollapsed is true', () => {
        render(<Appbar appTitle="dev.tools" pageTitle="" sidebarCollapsed={true} />);
        const menuBtn = screen.getByRole('button', { name: /open navigation/i });
        expect(menuBtn.classList.contains('menu-btn--visible')).toBe(true);
    });

    it('menu-btn--visible class absent when sidebarCollapsed is false', () => {
        render(<Appbar appTitle="dev.tools" pageTitle="" sidebarCollapsed={false} />);
        const menuBtn = screen.getByRole('button', { name: /open navigation/i });
        expect(menuBtn.classList.contains('menu-btn--visible')).toBe(false);
    });
});
