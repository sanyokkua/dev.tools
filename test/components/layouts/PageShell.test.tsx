import { render, screen } from '@testing-library/react';
import PageShell from '../../../src/components/layouts/PageShell';

describe('PageShell', () => {
    it('renders children inside a .page-shell div', () => {
        render(
            <PageShell>
                <span data-testid="child">content</span>
            </PageShell>,
        );
        const child = screen.getByTestId('child');
        expect(child.parentElement).toHaveClass('page-shell');
    });

    it('renders without crashing with no children', () => {
        const { container } = render(<PageShell>{null}</PageShell>);
        expect(container.querySelector('.page-shell')).toBeInTheDocument();
    });

    it('renders multiple children', () => {
        render(
            <PageShell>
                <span data-testid="a">A</span>
                <span data-testid="b">B</span>
            </PageShell>,
        );
        expect(screen.getByTestId('a')).toBeInTheDocument();
        expect(screen.getByTestId('b')).toBeInTheDocument();
    });
});
