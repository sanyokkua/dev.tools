import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { FileOpenProvider } from '../../../src/components/contexts/FileOpenContext';
import { FileSaveDialogProvider } from '../../../src/components/contexts/FileSaveDialogContext';
import { ToasterProvider } from '../../../src/components/contexts/ToasterContext';
import ToolView, { ToolViewFunctionGroups } from '../../../src/components/elements/column/ToolView';

jest.mock('../../../src/components/elements/editor/CodeEditor', () => ({
    __esModule: true,
    default: () => <div data-testid="code-editor" />,
}));

function makeGroups(count: number): ToolViewFunctionGroups {
    const map: ToolViewFunctionGroups = new Map();
    for (let i = 0; i < count; i++) {
        const id = `group-${i}`;
        map.set(id, {
            funcGroupId: id,
            funcGroupName: `Group ${i}`,
            functions: [
                { funcId: `fn-${i}-a`, funcName: `Action A${i}`, func: jest.fn() },
                { funcId: `fn-${i}-b`, funcName: `Action B${i}`, func: jest.fn() },
            ],
        });
    }
    return map;
}

function renderToolView(props: Partial<React.ComponentProps<typeof ToolView>> = {}): ReturnType<typeof render> {
    const defaults = { toolViewFunctionGroups: makeGroups(1) };
    return render(
        <ToasterProvider>
            <FileOpenProvider>
                <FileSaveDialogProvider>
                    <ToolView {...defaults} {...props} />
                </FileSaveDialogProvider>
            </FileOpenProvider>
        </ToasterProvider>,
    );
}

describe('ToolView', () => {
    it('wraps the middle column in .card.pad', () => {
        const { container } = renderToolView();
        expect(container.querySelector('.card.pad')).toBeInTheDocument();
    });

    it('renders left and right .editorpane elements', () => {
        const { container } = renderToolView();
        const panes = container.querySelectorAll('.editorpane');
        expect(panes.length).toBeGreaterThanOrEqual(2);
    });

    it('renders a searchable input with class "input" (not func-search-input)', () => {
        const { container } = renderToolView({ searchable: true });
        const input = container.querySelector('input[aria-label="Filter functions"]');
        expect(input).toBeInTheDocument();
        expect(input!.classList.contains('input')).toBe(true);
        expect(input!.classList.contains('func-search-input')).toBe(false);
    });

    it('does NOT render a select when there is only one group', () => {
        const { container } = renderToolView({ toolViewFunctionGroups: makeGroups(1) });
        expect(container.querySelector('select.input')).not.toBeInTheDocument();
    });

    it('renders a select.input when there are multiple groups', () => {
        const { container } = renderToolView({ toolViewFunctionGroups: makeGroups(3) });
        const sel = container.querySelector('select.input');
        expect(sel).toBeInTheDocument();
        expect(sel!.querySelectorAll('option')).toHaveLength(3);
    });

    it('filters function buttons when search query is typed', () => {
        const groups = makeGroups(1);
        renderToolView({ toolViewFunctionGroups: groups, searchable: true });

        const beforeFilter = document.querySelectorAll('button.func-btn');
        expect(beforeFilter.length).toBe(2);

        fireEvent.change(screen.getByLabelText('Filter functions'), { target: { value: 'Action A0' } });

        const afterFilter = document.querySelectorAll('button.func-btn');
        expect(afterFilter.length).toBe(1);
        expect(afterFilter[0].textContent).toBe('Action A0');
    });
});
