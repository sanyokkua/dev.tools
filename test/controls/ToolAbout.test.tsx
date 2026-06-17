import { act, fireEvent, render, screen } from '@testing-library/react';
import { PageProvider } from '../../src/components/contexts/PageContext';
import ToolAbout from '../../src/components/controls/ToolAbout';

function renderToolAbout(routeKey: string, title: string, content: string) {
    return render(
        <PageProvider>
            <ToolAbout routeKey={routeKey} title={title}>
                {content}
            </ToolAbout>
        </PageProvider>,
    );
}

describe('ToolAbout', () => {
    beforeEach(() => {
        localStorage.clear();
    });

    afterEach(() => {
        localStorage.clear();
    });

    it('is hidden by default (no saved state)', async () => {
        renderToolAbout('test-tool', 'Test Tool', 'Tool description here.');
        await act(async () => {});
        expect(screen.queryByText('Tool description here.')).not.toBeInTheDocument();
    });

    it('shows title in the header button', async () => {
        renderToolAbout('test-tool', 'Test Tool', 'content');
        await act(async () => {});
        expect(screen.getByRole('button', { name: /test tool/i })).toBeInTheDocument();
    });

    it('clicking toggle shows the content when closed', async () => {
        renderToolAbout('test-tool', 'Test Tool', 'Tool description here.');
        await act(async () => {});

        const btn = screen.getByRole('button');
        fireEvent.click(btn);

        expect(screen.getByText('Tool description here.')).toBeInTheDocument();
    });

    it('clicking toggle twice hides content again', async () => {
        renderToolAbout('test-tool', 'Test Tool', 'Tool description here.');
        await act(async () => {});

        const btn = screen.getByRole('button');
        fireEvent.click(btn); // open
        fireEvent.click(btn); // close

        expect(screen.queryByText('Tool description here.')).not.toBeInTheDocument();
    });

    it('persists open state to localStorage after toggle', async () => {
        renderToolAbout('test-tool', 'Test Tool', 'content');
        await act(async () => {});

        fireEvent.click(screen.getByRole('button')); // open

        expect(localStorage.getItem('toolAbout:test-tool')).toBe('true');
    });

    it('persists closed state to localStorage after re-closing', async () => {
        renderToolAbout('test-tool', 'Test Tool', 'content');
        await act(async () => {});

        const btn = screen.getByRole('button');
        fireEvent.click(btn); // open
        fireEvent.click(btn); // close

        expect(localStorage.getItem('toolAbout:test-tool')).toBe('false');
    });

    it('respects saved closed state from localStorage on mount', async () => {
        localStorage.setItem('toolAbout:saved-tool', 'false');

        renderToolAbout('saved-tool', 'Saved Tool', 'Hidden content.');
        await act(async () => {});

        expect(screen.queryByText('Hidden content.')).not.toBeInTheDocument();
    });

    it('respects saved open state from localStorage on mount', async () => {
        localStorage.setItem('toolAbout:saved-tool', 'true');

        renderToolAbout('saved-tool', 'Saved Tool', 'Visible content.');
        await act(async () => {});

        expect(screen.getByText('Visible content.')).toBeInTheDocument();
    });

    it('button has correct aria-expanded when closed (default)', async () => {
        renderToolAbout('test-tool', 'Test Tool', 'content');
        await act(async () => {});

        expect(screen.getByRole('button')).toHaveAttribute('aria-expanded', 'false');
    });

    it('button has correct aria-expanded when open', async () => {
        renderToolAbout('test-tool', 'Test Tool', 'content');
        await act(async () => {});

        fireEvent.click(screen.getByRole('button'));

        expect(screen.getByRole('button')).toHaveAttribute('aria-expanded', 'true');
    });
});
