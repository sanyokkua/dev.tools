import { act, render, screen } from '@testing-library/react';
import React, { useEffect } from 'react';
import { PageProvider, usePage } from '../../src/components/contexts/PageContext';
import ToolAbout from '../../src/components/controls/ToolAbout';

function renderToolAbout(routeKey: string, content: string) {
    return render(
        <PageProvider>
            <ToolAbout routeKey={routeKey}>{content}</ToolAbout>
        </PageProvider>,
    );
}

/** Helper that renders ToolAbout and exposes setHelpVisible from PageContext */
function renderWithContext(routeKey: string, content: string) {
    let externalSetHelpVisible: React.Dispatch<React.SetStateAction<boolean>> = () => {};

    function ContextCapture() {
        const { setHelpVisible } = usePage();
        useEffect(() => {
            externalSetHelpVisible = setHelpVisible;
        }, [setHelpVisible]);
        return null;
    }

    render(
        <PageProvider>
            <ContextCapture />
            <ToolAbout routeKey={routeKey}>{content}</ToolAbout>
        </PageProvider>,
    );

    return { setHelpVisible: (v: boolean) => externalSetHelpVisible(v) };
}

describe('ToolAbout', () => {
    beforeEach(() => {
        localStorage.clear();
    });

    afterEach(() => {
        localStorage.clear();
    });

    it('is hidden by default (no saved localStorage entry) — renders null', async () => {
        renderToolAbout('test-tool', 'Tool description here.');
        await act(async () => {});
        expect(screen.queryByTestId('tool-about')).not.toBeInTheDocument();
    });

    it('is visible when localStorage has "true" for the routeKey', async () => {
        localStorage.setItem('toolAbout:saved-tool', 'true');
        renderToolAbout('saved-tool', 'Visible content.');
        await act(async () => {});
        expect(screen.getByTestId('tool-about')).toBeInTheDocument();
        expect(screen.getByText('Visible content.')).toBeInTheDocument();
    });

    it('is hidden when localStorage has "false" for the routeKey', async () => {
        localStorage.setItem('toolAbout:saved-tool', 'false');
        renderToolAbout('saved-tool', 'Hidden content.');
        await act(async () => {});
        expect(screen.queryByTestId('tool-about')).not.toBeInTheDocument();
    });

    it('persists helpVisible=true to localStorage when changed via context', async () => {
        const { setHelpVisible } = renderWithContext('persist-tool', 'content');
        await act(async () => {});

        await act(async () => {
            setHelpVisible(true);
        });

        expect(localStorage.getItem('toolAbout:persist-tool')).toBe('true');
    });

    it('persists helpVisible=false to localStorage when changed via context', async () => {
        localStorage.setItem('toolAbout:persist-tool', 'true');
        const { setHelpVisible } = renderWithContext('persist-tool', 'content');
        await act(async () => {});

        // First set to true (read from localStorage), then close
        await act(async () => {
            setHelpVisible(false);
        });

        expect(localStorage.getItem('toolAbout:persist-tool')).toBe('false');
    });

    it('re-reads localStorage when routeKey changes', async () => {
        localStorage.setItem('toolAbout:route-a', 'false');
        localStorage.setItem('toolAbout:route-b', 'true');

        const { rerender } = render(
            <PageProvider>
                <ToolAbout routeKey="route-a">Route A content</ToolAbout>
            </PageProvider>,
        );
        await act(async () => {});
        expect(screen.queryByTestId('tool-about')).not.toBeInTheDocument();

        rerender(
            <PageProvider>
                <ToolAbout routeKey="route-b">Route B content</ToolAbout>
            </PageProvider>,
        );
        await act(async () => {});
        expect(screen.getByTestId('tool-about')).toBeInTheDocument();
        expect(screen.getByText('Route B content')).toBeInTheDocument();
    });

    it('registers itself with PageContext (setHasToolAbout called on mount)', async () => {
        let capturedHasToolAbout = false;

        function Inspector() {
            const { hasToolAbout } = usePage();
            useEffect(() => {
                capturedHasToolAbout = hasToolAbout;
            }, [hasToolAbout]);
            return null;
        }

        render(
            <PageProvider>
                <Inspector />
                <ToolAbout routeKey="register-tool">content</ToolAbout>
            </PageProvider>,
        );
        await act(async () => {});
        expect(capturedHasToolAbout).toBe(true);
    });
});
