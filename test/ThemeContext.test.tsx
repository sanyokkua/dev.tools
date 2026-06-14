import { ThemeProvider, useTheme } from '@/contexts/ThemeContext';
import { act, renderHook } from '@testing-library/react';
import React from 'react';

const wrapper = ({ children }: { children: React.ReactNode }): React.JSX.Element => (
    <ThemeProvider>{children}</ThemeProvider>
);

describe('ThemeContext', () => {
    let originalMatchMedia: typeof window.matchMedia;

    beforeEach(() => {
        originalMatchMedia = window.matchMedia;
        window.matchMedia = jest
            .fn()
            .mockReturnValue({ matches: false, addEventListener: jest.fn(), removeEventListener: jest.fn() });
        document.documentElement.removeAttribute('data-theme');
    });

    afterEach(() => {
        window.matchMedia = originalMatchMedia;
    });

    it('throws when used outside ThemeProvider', () => {
        expect(() => renderHook(() => useTheme())).toThrow('useTheme must be used within a ThemeProvider');
    });

    it('defaults to light theme', async () => {
        const { result } = renderHook(() => useTheme(), { wrapper });
        await act(async () => {});
        expect(result.current.theme).toBe('light');
    });

    it('toggles to dark theme', async () => {
        const { result } = renderHook(() => useTheme(), { wrapper });
        await act(async () => {});
        act(() => {
            result.current.toggleTheme();
        });
        expect(result.current.theme).toBe('dark');
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
});
