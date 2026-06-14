import { ThemeProvider, useTheme } from '@/contexts/ThemeContext';
import { act, render, screen } from '@testing-library/react';
import React from 'react';
import CodeEditor from '../../../src/components/elements/editor/CodeEditor';

jest.mock('@monaco-editor/react', () => ({
    Editor: (props: { theme?: string; height?: string }) => (
        <div data-testid="monaco" data-theme={props.theme} data-height={props.height} />
    ),
}));

const ThemeToggler: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { toggleTheme } = useTheme();
    return (
        <>
            <button onClick={toggleTheme}>toggle</button>
            {children}
        </>
    );
};

function renderWithTheme(): ReturnType<typeof render> {
    return render(
        <ThemeProvider>
            <ThemeToggler>
                <CodeEditor />
            </ThemeToggler>
        </ThemeProvider>,
    );
}

describe('CodeEditor — theme sync', () => {
    beforeEach(() => {
        document.documentElement.removeAttribute('data-theme');
        window.matchMedia = jest
            .fn()
            .mockReturnValue({ matches: false, addEventListener: jest.fn(), removeEventListener: jest.fn() });
    });

    it('uses "vs" (light) Monaco theme by default', () => {
        renderWithTheme();
        expect(screen.getByTestId('monaco')).toHaveAttribute('data-theme', 'vs');
    });

    it('switches to "vs-dark" when app theme is toggled to dark', () => {
        renderWithTheme();
        act(() => {
            screen.getByRole('button', { name: 'toggle' }).click();
        });
        expect(screen.getByTestId('monaco')).toHaveAttribute('data-theme', 'vs-dark');
    });

    it('switches back to "vs" when toggled back to light', () => {
        renderWithTheme();
        act(() => {
            screen.getByRole('button', { name: 'toggle' }).click();
        });
        act(() => {
            screen.getByRole('button', { name: 'toggle' }).click();
        });
        expect(screen.getByTestId('monaco')).toHaveAttribute('data-theme', 'vs');
    });

    it('passes height="100%" to Monaco by default', () => {
        render(
            <ThemeProvider>
                <CodeEditor />
            </ThemeProvider>,
        );
        expect(screen.getByTestId('monaco')).toHaveAttribute('data-height', '100%');
    });

    it('passes custom height to Monaco when provided', () => {
        render(
            <ThemeProvider>
                <CodeEditor height="50vh" />
            </ThemeProvider>,
        );
        expect(screen.getByTestId('monaco')).toHaveAttribute('data-height', '50vh');
    });
});
