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

describe('ApplicationLayout mobile nav', () => {
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
