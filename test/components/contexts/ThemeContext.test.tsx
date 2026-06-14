import { ThemeProvider, useTheme } from '@/contexts/ThemeContext';
import { act, render, screen } from '@testing-library/react';
import React from 'react';

const ThemeDisplay: React.FC = () => {
    const { theme } = useTheme();
    return <div data-testid="theme">{theme}</div>;
};

describe('ThemeProvider', () => {
    let originalMatchMedia: typeof window.matchMedia;

    beforeEach(() => {
        originalMatchMedia = window.matchMedia;
    });

    afterEach(() => {
        window.matchMedia = originalMatchMedia;
        document.documentElement.removeAttribute('data-theme');
    });

    it('initializes to dark when prefers-color-scheme is dark', async () => {
        window.matchMedia = jest
            .fn()
            .mockReturnValue({ matches: true, addEventListener: jest.fn(), removeEventListener: jest.fn() });
        await act(async () => {
            render(
                <ThemeProvider>
                    <ThemeDisplay />
                </ThemeProvider>,
            );
        });
        expect(screen.getByTestId('theme').textContent).toBe('dark');
    });

    it('initializes to light when prefers-color-scheme is light', async () => {
        window.matchMedia = jest
            .fn()
            .mockReturnValue({ matches: false, addEventListener: jest.fn(), removeEventListener: jest.fn() });
        await act(async () => {
            render(
                <ThemeProvider>
                    <ThemeDisplay />
                </ThemeProvider>,
            );
        });
        expect(screen.getByTestId('theme').textContent).toBe('light');
    });

    it('toggleTheme switches theme', () => {
        window.matchMedia = jest
            .fn()
            .mockReturnValue({ matches: false, addEventListener: jest.fn(), removeEventListener: jest.fn() });
        let toggle: () => void = () => {};
        const Capture: React.FC = () => {
            const { toggleTheme, theme } = useTheme();
            toggle = toggleTheme;
            return <div data-testid="theme">{theme}</div>;
        };
        render(
            <ThemeProvider>
                <Capture />
            </ThemeProvider>,
        );
        act(() => {
            toggle();
        });
        expect(screen.getByTestId('theme').textContent).toBe('dark');
    });
});
