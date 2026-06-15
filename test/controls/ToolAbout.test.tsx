import { act, fireEvent, render, screen } from '@testing-library/react';
import ToolAbout from '../../src/components/controls/ToolAbout';

describe('ToolAbout', () => {
    beforeEach(() => {
        localStorage.clear();
    });

    afterEach(() => {
        localStorage.clear();
    });

    it('renders content expanded by default on first render', async () => {
        render(
            <ToolAbout routeKey="test-tool" title="Test Tool">
                Tool description here.
            </ToolAbout>,
        );
        await act(async () => {});
        expect(screen.getByText('Tool description here.')).toBeInTheDocument();
    });

    it('shows title in the header button', async () => {
        render(
            <ToolAbout routeKey="test-tool" title="Test Tool">
                content
            </ToolAbout>,
        );
        await act(async () => {});
        expect(screen.getByRole('button', { name: /test tool/i })).toBeInTheDocument();
    });

    it('clicking toggle hides the content', async () => {
        render(
            <ToolAbout routeKey="test-tool" title="Test Tool">
                Tool description here.
            </ToolAbout>,
        );
        await act(async () => {});

        const btn = screen.getByRole('button');
        fireEvent.click(btn);

        expect(screen.queryByText('Tool description here.')).not.toBeInTheDocument();
    });

    it('clicking toggle twice restores content', async () => {
        render(
            <ToolAbout routeKey="test-tool" title="Test Tool">
                Tool description here.
            </ToolAbout>,
        );
        await act(async () => {});

        const btn = screen.getByRole('button');
        fireEvent.click(btn);
        fireEvent.click(btn);

        expect(screen.getByText('Tool description here.')).toBeInTheDocument();
    });

    it('persists closed state to localStorage after toggle', async () => {
        render(
            <ToolAbout routeKey="test-tool" title="Test Tool">
                content
            </ToolAbout>,
        );
        await act(async () => {});

        fireEvent.click(screen.getByRole('button'));

        expect(localStorage.getItem('toolAbout:test-tool')).toBe('false');
    });

    it('persists open state to localStorage after re-opening', async () => {
        render(
            <ToolAbout routeKey="test-tool" title="Test Tool">
                content
            </ToolAbout>,
        );
        await act(async () => {});

        const btn = screen.getByRole('button');
        fireEvent.click(btn);
        fireEvent.click(btn);

        expect(localStorage.getItem('toolAbout:test-tool')).toBe('true');
    });

    it('respects saved closed state from localStorage on mount', async () => {
        localStorage.setItem('toolAbout:saved-tool', 'false');

        render(
            <ToolAbout routeKey="saved-tool" title="Saved Tool">
                Hidden content.
            </ToolAbout>,
        );
        await act(async () => {});

        expect(screen.queryByText('Hidden content.')).not.toBeInTheDocument();
    });

    it('respects saved open state from localStorage on mount', async () => {
        localStorage.setItem('toolAbout:saved-tool', 'true');

        render(
            <ToolAbout routeKey="saved-tool" title="Saved Tool">
                Visible content.
            </ToolAbout>,
        );
        await act(async () => {});

        expect(screen.getByText('Visible content.')).toBeInTheDocument();
    });

    it('button has correct aria-expanded when open', async () => {
        render(
            <ToolAbout routeKey="test-tool" title="Test Tool">
                content
            </ToolAbout>,
        );
        await act(async () => {});

        expect(screen.getByRole('button')).toHaveAttribute('aria-expanded', 'true');
    });

    it('button has correct aria-expanded when closed', async () => {
        render(
            <ToolAbout routeKey="test-tool" title="Test Tool">
                content
            </ToolAbout>,
        );
        await act(async () => {});

        fireEvent.click(screen.getByRole('button'));

        expect(screen.getByRole('button')).toHaveAttribute('aria-expanded', 'false');
    });
});
