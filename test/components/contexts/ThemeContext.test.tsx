import { ThemeProvider, useTheme } from '@/contexts/ThemeContext';
import { act, render, renderHook, screen } from '@testing-library/react';
import React from 'react';

const ThemeDisplay: React.FC = () => {
    const { theme } = useTheme();
    return <div data-testid="theme">{theme}</div>;
};

describe('ThemeProvider', () => {
    let originalMatchMedia: typeof window.matchMedia;

    beforeEach(() => {
        localStorage.clear();
        originalMatchMedia = window.matchMedia;
        window.matchMedia = jest
            .fn()
            .mockReturnValue({ matches: false, addEventListener: jest.fn(), removeEventListener: jest.fn() });
        document.documentElement.removeAttribute('data-theme');
    });

    afterEach(() => {
        window.matchMedia = originalMatchMedia;
        document.documentElement.removeAttribute('data-theme');
        localStorage.clear();
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

    it('renders without crashing when localStorage.getItem throws SecurityError', async () => {
        const spy = jest.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
            throw new Error('SecurityError');
        });
        await act(async () => {
            render(
                <ThemeProvider>
                    <ThemeDisplay />
                </ThemeProvider>,
            );
        });
        expect(screen.getByTestId('theme').textContent).toBe('light');
        spy.mockRestore();
    });

    it('does not crash when localStorage.setItem throws SecurityError', async () => {
        const spy = jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
            throw new Error('SecurityError');
        });
        let toggle: () => void = () => {};
        const Capture: React.FC = () => {
            const { toggleTheme, theme } = useTheme();
            toggle = toggleTheme;
            return <div data-testid="theme">{theme}</div>;
        };
        await act(async () => {
            render(
                <ThemeProvider>
                    <Capture />
                </ThemeProvider>,
            );
        });
        act(() => {
            toggle();
        });
        expect(screen.getByTestId('theme').textContent).toBe('dark');
        spy.mockRestore();
    });
});

const wrapper = ({ children }: { children: React.ReactNode }): React.JSX.Element => (
    <ThemeProvider>{children}</ThemeProvider>
);

describe('useTheme hook', () => {
    let originalMatchMedia: typeof window.matchMedia;

    beforeEach(() => {
        localStorage.clear();
        originalMatchMedia = window.matchMedia;
        window.matchMedia = jest
            .fn()
            .mockReturnValue({ matches: false, addEventListener: jest.fn(), removeEventListener: jest.fn() });
        document.documentElement.removeAttribute('data-theme');
    });

    afterEach(() => {
        window.matchMedia = originalMatchMedia;
        document.documentElement.removeAttribute('data-theme');
        localStorage.clear();
    });

    it('throws when used outside ThemeProvider', () => {
        expect(() => renderHook(() => useTheme())).toThrow('useTheme must be used within a ThemeProvider');
    });

    it('toggles back to light theme', async () => {
        const { result } = renderHook(() => useTheme(), { wrapper });
        await act(async () => {});
        act(() => {
            result.current.toggleTheme();
        });
        act(() => {
            result.current.toggleTheme();
        });
        expect(result.current.theme).toBe('light');
    });

    it('sets data-theme="light" on mount', async () => {
        renderHook(() => useTheme(), { wrapper });
        await act(async () => {});
        expect(document.documentElement.getAttribute('data-theme')).toBe('light');
    });

    it('sets data-theme="dark" after one toggle', async () => {
        const { result } = renderHook(() => useTheme(), { wrapper });
        await act(async () => {});
        act(() => {
            result.current.toggleTheme();
        });
        expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    });

    it('reads saved theme from localStorage on init', async () => {
        localStorage.setItem('theme', 'dark');
        const { result } = renderHook(() => useTheme(), { wrapper });
        await act(async () => {});
        expect(result.current.theme).toBe('dark');
    });

    it('writes theme to localStorage on change', async () => {
        const { result } = renderHook(() => useTheme(), { wrapper });
        await act(async () => {});
        act(() => {
            result.current.toggleTheme();
        });
        expect(localStorage.getItem('theme')).toBe('dark');
    });

    it('writes theme back to light in localStorage after two toggles', async () => {
        const { result } = renderHook(() => useTheme(), { wrapper });
        await act(async () => {});
        act(() => {
            result.current.toggleTheme();
        });
        act(() => {
            result.current.toggleTheme();
        });
        expect(localStorage.getItem('theme')).toBe('light');
    });
});
