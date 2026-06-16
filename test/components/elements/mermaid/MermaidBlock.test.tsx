jest.mock('@/common/mermaid', () => ({ renderMermaid: jest.fn() }));

import { renderMermaid } from '@/common/mermaid';
import { act, render, screen } from '@testing-library/react';
import MermaidBlock from '../../../../src/components/elements/mermaid/MermaidBlock';

const mockRenderMermaid = renderMermaid as jest.Mock;

beforeEach(() => {
    jest.clearAllMocks();
    mockRenderMermaid.mockResolvedValue('<svg data-testid="mermaid-svg">diagram</svg>');
});

describe('MermaidBlock', () => {
    it('shows loading state before renderMermaid resolves', () => {
        mockRenderMermaid.mockImplementation(() => new Promise(() => {})); // never resolves
        render(<MermaidBlock src="graph TD\nA-->B" />);
        expect(screen.getByText(/rendering diagram/i)).toBeInTheDocument();
    });

    it('renders SVG via dangerouslySetInnerHTML when renderMermaid resolves', async () => {
        await act(async () => {
            render(<MermaidBlock src="graph TD\nA-->B" />);
        });
        const container = document.querySelector('.mermaid-block');
        expect(container?.innerHTML).toContain('mermaid-svg');
    });

    it('shows error message when renderMermaid rejects', async () => {
        mockRenderMermaid.mockRejectedValue(new Error('Parse error at line 1'));
        await act(async () => {
            render(<MermaidBlock src="invalid!!!" />);
        });
        expect(screen.getByText('Parse error at line 1')).toBeInTheDocument();
        expect(document.querySelector('.mermaid-block--error')).toBeInTheDocument();
    });

    it('cancels in-flight render on src change', async () => {
        let firstResolve!: (s: string) => void;
        mockRenderMermaid
            .mockImplementationOnce(
                () =>
                    new Promise((r) => {
                        firstResolve = r;
                    }),
            )
            .mockResolvedValue('<svg>new</svg>');

        const { rerender } = render(<MermaidBlock src="graph TD\nA-->B" />);
        await act(async () => {
            rerender(<MermaidBlock src="graph LR\nX-->Y" />);
        });

        // resolving the stale first call must NOT update the svg
        await act(async () => {
            firstResolve('<svg>old</svg>');
        });

        const container = document.querySelector('.mermaid-block');
        expect(container?.innerHTML).toContain('new');
        expect(container?.innerHTML).not.toContain('old');
    });

    it('passes src to renderMermaid', async () => {
        const src = '  graph TD\nA-->B  ';
        await act(async () => {
            render(<MermaidBlock src={src} />);
        });
        expect(mockRenderMermaid).toHaveBeenCalledWith(expect.stringMatching(/^mermaid/), src);
    });

    it('re-renders with a new diagram when src prop changes', async () => {
        mockRenderMermaid.mockResolvedValueOnce('<svg>first</svg>').mockResolvedValueOnce('<svg>second</svg>');

        const { rerender } = render(<MermaidBlock src="graph TD\nA-->B" />);
        await act(async () => {});

        await act(async () => {
            rerender(<MermaidBlock src="graph LR\nX-->Y" />);
        });

        const container = document.querySelector('.mermaid-block');
        expect(container?.innerHTML).toContain('second');
    });

    it('renders .mermaid-block--error when renderMermaid rejects with non-Error', async () => {
        mockRenderMermaid.mockRejectedValue('string error');
        await act(async () => {
            render(<MermaidBlock src="bad" />);
        });
        expect(screen.getByText('string error')).toBeInTheDocument();
    });

    it('renders empty-string src without throwing', async () => {
        mockRenderMermaid.mockResolvedValue('<svg>empty</svg>');
        await act(async () => {
            render(<MermaidBlock src="" />);
        });
        expect(document.querySelector('.mermaid-block')).toBeInTheDocument();
    });
});
