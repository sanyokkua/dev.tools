import { ThemeProvider, useTheme } from '@/contexts/ThemeContext';
import { act, renderHook } from '@testing-library/react';
import React from 'react';

const wrapper = ({ children }: { children: React.ReactNode }): React.JSX.Element => (
    <ThemeProvider>{children}</ThemeProvider>
);

describe('ThemeContext', () => {
    beforeEach(() => {
        document.documentElement.removeAttribute('data-theme');
    });

    it('throws when used outside ThemeProvider', () => {
        expect(() => renderHook(() => useTheme())).toThrow('useTheme must be used within a ThemeProvider');
    });

    it('defaults to light theme', () => {
        const { result } = renderHook(() => useTheme(), { wrapper });
        expect(result.current.theme).toBe('light');
    });

    it('toggles to dark theme', () => {
        const { result } = renderHook(() => useTheme(), { wrapper });
        act(() => {
            result.current.toggleTheme();
        });
        expect(result.current.theme).toBe('dark');
    });

    it('toggles back to light theme', () => {
        const { result } = renderHook(() => useTheme(), { wrapper });
        act(() => {
            result.current.toggleTheme();
        });
        act(() => {
            result.current.toggleTheme();
        });
        expect(result.current.theme).toBe('light');
    });

    it('sets data-theme="light" on mount', () => {
        renderHook(() => useTheme(), { wrapper });
        expect(document.documentElement.getAttribute('data-theme')).toBe('light');
    });

    it('sets data-theme="dark" after one toggle', () => {
        const { result } = renderHook(() => useTheme(), { wrapper });
        act(() => {
            result.current.toggleTheme();
        });
        expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    });
});
