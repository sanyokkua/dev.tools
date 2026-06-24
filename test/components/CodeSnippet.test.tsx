import { render, screen } from '@testing-library/react';
import { ToasterProvider } from '../../src/components/contexts/ToasterContext';
import CodeSnippet from '../../src/components/elements/CodeSnippet';

function renderSnippet(props: Partial<React.ComponentProps<typeof CodeSnippet>> = {}) {
    return render(
        <ToasterProvider>
            <CodeSnippet content="echo hello" {...props} />
        </ToasterProvider>,
    );
}

describe('CodeSnippet', () => {
    it('renders with code-block container class', () => {
        const { container } = renderSnippet();
        expect(container.querySelector('.code-block')).toBeInTheDocument();
    });

    it('renders the Copy button', () => {
        renderSnippet();
        expect(screen.getByRole('button', { name: 'Copy' })).toBeInTheDocument();
    });

    it('shows headerText when provided', () => {
        renderSnippet({ headerText: 'install.sh' });
        expect(screen.getByText('install.sh')).toBeInTheDocument();
    });

    it('falls back to language name when headerText is omitted', () => {
        renderSnippet({ language: 'bash' });
        expect(screen.getByText('bash')).toBeInTheDocument();
    });

    it('does not render Download button when onDownload is omitted', () => {
        renderSnippet();
        expect(screen.queryByRole('button', { name: /download/i })).not.toBeInTheDocument();
    });

    it('renders Download button when onDownload prop is provided', () => {
        renderSnippet({ onDownload: jest.fn() });
        expect(screen.getByRole('button', { name: /download/i })).toBeInTheDocument();
    });

    it('applies the language class to the code element', () => {
        const { container } = renderSnippet({ language: 'powershell' });
        expect(container.querySelector('code.language-powershell')).toBeInTheDocument();
    });

    it('applies hljs class to the code element for syntax highlighting', () => {
        const { container } = renderSnippet();
        expect(container.querySelector('code.hljs')).toBeInTheDocument();
    });
});
