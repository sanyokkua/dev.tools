import { render, screen } from '@testing-library/react';
import React from 'react';
import Sidebar, { NavGroup } from '../src/components/elements/navigation/sidebar/Sidebar';

jest.mock('next/link', () => {
    return function MockLink({
        href,
        children,
        className,
        'aria-current': ariaCurrent,
        'aria-label': ariaLabel,
        title,
    }: {
        'href': string;
        'children': React.ReactNode;
        'className'?: string;
        'aria-current'?: string;
        'aria-label'?: string;
        'title'?: string;
    }): React.JSX.Element {
        return (
            <a
                href={href}
                className={className}
                aria-current={ariaCurrent as React.AriaAttributes['aria-current']}
                aria-label={ariaLabel}
                title={title}
            >
                {children}
            </a>
        );
    };
});

const groups: NavGroup[] = [
    {
        groupName: 'Text & Code',
        items: [
            { itemName: 'String Utils', itemLink: '/string-utils', icon: '🔤' },
            { itemName: 'Dashboard', itemLink: '/dashboard', icon: '🏠' },
        ],
    },
    { groupName: 'Install & Setup', items: [{ itemName: 'Brew Tools', itemLink: '/brew-tools', icon: '🍺' }] },
    { groupName: 'AI', items: [{ itemName: 'AI Prompts', itemLink: '/ai-prompts', icon: '🤖', badge: 'NEW' }] },
];

describe('Sidebar', () => {
    it('applies active class and aria-current to the active link only', () => {
        render(<Sidebar groups={groups} activeLink="/string-utils" />);

        const stringUtilsLink = screen.getByRole('link', { name: /string utils/i });
        expect(stringUtilsLink).toHaveClass('active');
        expect(stringUtilsLink).toHaveAttribute('aria-current', 'page');

        const dashboardLink = screen.getByRole('link', { name: /dashboard/i });
        expect(dashboardLink).not.toHaveClass('active');
        expect(dashboardLink).not.toHaveAttribute('aria-current');
    });

    it('renders all group labels', () => {
        render(<Sidebar groups={groups} activeLink="" />);

        expect(screen.getByText('Text & Code')).toBeInTheDocument();
        expect(screen.getByText('Install & Setup')).toBeInTheDocument();
        expect(screen.getByText('AI')).toBeInTheDocument();
    });

    it('renders badge text when an item has a badge', () => {
        render(<Sidebar groups={groups} activeLink="" />);

        const badge = screen.getByText('NEW');
        expect(badge).toBeInTheDocument();
        expect(badge.tagName.toLowerCase()).toBe('span');
    });

    it('renders the nav landmark with correct role and aria-label', () => {
        render(<Sidebar groups={groups} activeLink="" />);

        const nav = screen.getByRole('navigation', { name: 'Site navigation' });
        expect(nav).toBeInTheDocument();
        expect(nav.tagName.toLowerCase()).toBe('aside');
    });

    it('renders nav items with title attribute equal to item name', () => {
        render(<Sidebar groups={groups} activeLink="" />);
        const link = screen.getByRole('link', { name: /string utils/i });
        expect(link).toHaveAttribute('title', 'String Utils');
    });

    it('renders nav-item-label class on label spans', () => {
        render(<Sidebar groups={groups} activeLink="" />);
        // Every link should contain a .nav-item-label span
        const labels = document.querySelectorAll('.nav-item-label');
        // 4 items across all groups
        expect(labels.length).toBe(4);
        expect(labels[0].textContent).toBe('String Utils');
    });
});
