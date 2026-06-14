import { fireEvent, render, screen } from '@testing-library/react';
import { PageProvider } from '../../src/components/contexts/PageContext';
import { ToasterProvider } from '../../src/components/contexts/ToasterContext';
import ConvertingToolsPage from '../../src/pages/converting-tools/index';

function renderPage(): ReturnType<typeof render> {
    return render(
        <ToasterProvider>
            <PageProvider>
                <ConvertingToolsPage />
            </PageProvider>
        </ToasterProvider>,
    );
}

describe('ConvertingToolsPage — number-base mode (default)', () => {
    it('renders standard base rows on first load', () => {
        renderPage();
        expect(screen.getByText('Decimal')).toBeInTheDocument();
        expect(screen.getByText('Hexadecimal')).toBeInTheDocument();
        expect(screen.getByText('Binary')).toBeInTheDocument();
        expect(screen.getByText('Octal')).toBeInTheDocument();
    });

    it('custom base input is NOT visible before toggle', () => {
        renderPage();
        expect(screen.queryByLabelText('Base (2–36):')).not.toBeInTheDocument();
    });

    it('"Base 36" result row is NOT shown before toggle', () => {
        renderPage();
        expect(screen.queryByText('Base 36')).not.toBeInTheDocument();
    });

    it('toggling "Show custom base" reveals the custom base input', () => {
        renderPage();
        fireEvent.click(screen.getByRole('switch', { name: /show custom base/i }));
        expect(screen.getByLabelText('Base (2–36):')).toBeInTheDocument();
    });

    it('"Base 36" result row appears after toggle (default customBase is 36)', () => {
        renderPage();
        fireEvent.click(screen.getByRole('switch', { name: /show custom base/i }));
        expect(screen.getByText('Base 36')).toBeInTheDocument();
    });
});
