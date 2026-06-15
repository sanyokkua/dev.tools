import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import ApplicationLayout from '../../../src/components/app-layout/ApplicationLayout';

jest.mock('next/router', () => ({ useRouter: () => ({ pathname: '/' }) }));
jest.mock('next/link', () => {
    return function MockLink({
        href,
        children,
        className,
        onClick,
    }: {
        href: string;
        children: React.ReactNode;
        className?: string;
        onClick?: () => void;
    }): React.JSX.Element {
        return (
            <a href={href} className={className} onClick={onClick}>
                {children}
            </a>
        );
    };
});
jest.mock('../../../src/components/contexts/PageContext', () => ({ usePage: () => ({ pageTitle: 'Test' }) }));
jest.mock('../../../src/components/contexts/ThemeContext', () => ({
    useTheme: () => ({ theme: 'light', toggleTheme: jest.fn() }),
}));

describe('ApplicationLayout sidebar collapse (desktop)', () => {
    beforeEach(() => {
        localStorage.clear();
    });

    it('sidebar is not collapsed by default', () => {
        render(<ApplicationLayout>content</ApplicationLayout>);
        const nav = screen.getByRole('navigation', { name: /site navigation/i });
        expect(nav.classList.contains('collapsed')).toBe(false);
    });

    it('collapses sidebar when collapse button is clicked', () => {
        render(<ApplicationLayout>content</ApplicationLayout>);
        const collapseBtn = screen.getByRole('button', { name: /collapse sidebar/i });
        fireEvent.click(collapseBtn);
        const nav = screen.getByRole('navigation', { name: /site navigation/i });
        expect(nav.classList.contains('collapsed')).toBe(true);
        expect(localStorage.getItem('sidebarCollapsed')).toBe('true');
    });

    it('hamburger un-collapses sidebar on desktop when collapsed', () => {
        render(<ApplicationLayout>content</ApplicationLayout>);
        // Collapse first
        fireEvent.click(screen.getByRole('button', { name: /collapse sidebar/i }));
        // Now hamburger should un-collapse
        fireEvent.click(screen.getByRole('button', { name: /open navigation/i }));
        const nav = screen.getByRole('navigation', { name: /site navigation/i });
        expect(nav.classList.contains('collapsed')).toBe(false);
        expect(localStorage.getItem('sidebarCollapsed')).toBe('false');
    });

    it('restores collapsed state from localStorage', () => {
        localStorage.setItem('sidebarCollapsed', 'true');
        render(<ApplicationLayout>content</ApplicationLayout>);
        const nav = screen.getByRole('navigation', { name: /site navigation/i });
        expect(nav.classList.contains('collapsed')).toBe(true);
    });

    it('hamburger has menu-btn--visible class when sidebar is collapsed', () => {
        render(<ApplicationLayout>content</ApplicationLayout>);
        fireEvent.click(screen.getByRole('button', { name: /collapse sidebar/i }));
        const menuBtn = screen.getByRole('button', { name: /open navigation/i });
        expect(menuBtn.classList.contains('menu-btn--visible')).toBe(true);
    });
});

describe('ApplicationLayout mobile nav', () => {
    beforeEach(() => {
        localStorage.clear();
    });

    it('renders hamburger button', () => {
        render(<ApplicationLayout>content</ApplicationLayout>);
        expect(screen.getByRole('button', { name: /open navigation/i })).toBeInTheDocument();
    });

    it('opens sidebar drawer when hamburger is clicked', () => {
        render(<ApplicationLayout>content</ApplicationLayout>);
        const menuBtn = screen.getByRole('button', { name: /open navigation/i });
        fireEvent.click(menuBtn);
        const nav = screen.getByRole('navigation', { name: /site navigation/i });
        expect(nav.classList.contains('open')).toBe(true);
    });

    it('closes drawer when backdrop is clicked', () => {
        render(<ApplicationLayout>content</ApplicationLayout>);
        fireEvent.click(screen.getByRole('button', { name: /open navigation/i }));
        const backdrop = document.querySelector('.nav-backdrop') as HTMLElement;
        fireEvent.click(backdrop);
        const nav = screen.getByRole('navigation', { name: /site navigation/i });
        expect(nav.classList.contains('open')).toBe(false);
    });

    it('closes drawer when a nav link is clicked', () => {
        render(<ApplicationLayout>content</ApplicationLayout>);
        fireEvent.click(screen.getByRole('button', { name: /open navigation/i }));
        fireEvent.click(screen.getByRole('link', { name: /dashboard/i }));
        const nav = screen.getByRole('navigation', { name: /site navigation/i });
        expect(nav.classList.contains('open')).toBe(false);
    });
});
