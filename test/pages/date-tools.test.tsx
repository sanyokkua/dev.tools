import { fireEvent, render, screen } from '@testing-library/react';
import DateToolsPage from '../../src/pages/date-tools/index';

jest.mock('../../src/components/contexts/PageContext', () => ({
    usePage: () => ({
        setPageTitle: jest.fn(),
        helpVisible: false,
        setHelpVisible: jest.fn(),
        hasToolAbout: false,
        setHasToolAbout: jest.fn(),
    }),
}));
jest.mock('../../src/components/contexts/ToasterContext', () => ({ useToast: () => ({ showToast: jest.fn() }) }));

describe('DateToolsPage — button variants (Task 2.4)', () => {
    it('Convert button has btn primary classes', () => {
        render(<DateToolsPage />);
        const convertBtn = screen.getByRole('button', { name: /convert timestamp/i });
        expect(convertBtn.className).toContain('btn');
        expect(convertBtn.className).toContain('primary');
        expect(convertBtn.className).not.toContain('button-primary');
        expect(convertBtn.className).not.toContain('button-filled');
    });

    it('Now button has btn ghost classes', () => {
        render(<DateToolsPage />);
        const nowBtn = screen.getByRole('button', { name: /use current timestamp/i });
        expect(nowBtn.className).toContain('btn');
        expect(nowBtn.className).toContain('ghost');
        expect(nowBtn.className).not.toContain('button-outlined');
    });

    it('copy buttons have btn ghost classes', () => {
        render(<DateToolsPage />);
        const copyBtns = screen.getAllByRole('button', { name: /copy/i });
        copyBtns.forEach((btn) => {
            expect(btn.className).toContain('btn');
            expect(btn.className).toContain('ghost');
            expect(btn.className).not.toContain('button-text');
        });
    });
});

describe('DateToolsPage — timestamp conversion behavior', () => {
    it('renders the mode selector with Timestamp and Duration options', () => {
        render(<DateToolsPage />);
        expect(screen.getAllByRole('button', { name: /timestamp/i }).length).toBeGreaterThan(0);
        expect(screen.getAllByRole('button', { name: /duration/i }).length).toBeGreaterThan(0);
    });

    it('defaults to timestamp mode showing the Unix timestamp input', () => {
        render(<DateToolsPage />);
        expect(screen.getByLabelText(/unix timestamp/i)).toBeInTheDocument();
    });

    it('pre-fills the timestamp input with a default value', () => {
        render(<DateToolsPage />);
        const input = screen.getByLabelText(/unix timestamp/i) as HTMLInputElement;
        expect(input.value).toBeTruthy();
        expect(Number(input.value)).toBeGreaterThan(0);
    });

    it('shows conversion results for the default timestamp (a valid number)', () => {
        render(<DateToolsPage />);
        // The default timestamp 1760000000 should render breakdown results
        // The day-of-week row should appear in the table
        expect(screen.getByText('Day of week')).toBeInTheDocument();
    });

    it('shows Relative to now label in the KPI row', () => {
        render(<DateToolsPage />);
        expect(screen.getByText('Relative to now')).toBeInTheDocument();
    });

    it('clears conversion output when timestamp input is cleared', () => {
        render(<DateToolsPage />);
        const input = screen.getByLabelText(/unix timestamp/i);
        fireEvent.change(input, { target: { value: '' } });
        expect(screen.getByText(/enter a valid unix timestamp/i)).toBeInTheDocument();
    });

    it('shows no output for a non-numeric timestamp input', () => {
        render(<DateToolsPage />);
        const input = screen.getByLabelText(/unix timestamp/i);
        fireEvent.change(input, { target: { value: 'not-a-number' } });
        expect(screen.getByText(/enter a valid unix timestamp/i)).toBeInTheDocument();
    });

    it('Now button sets the timestamp input to a recent epoch value', () => {
        render(<DateToolsPage />);
        const input = screen.getByLabelText(/unix timestamp/i) as HTMLInputElement;
        const before = Math.floor(Date.now() / 1000) - 5;
        fireEvent.click(screen.getByRole('button', { name: /use current timestamp/i }));
        const after = Math.floor(Date.now() / 1000) + 5;
        const value = Number(input.value);
        expect(value).toBeGreaterThanOrEqual(before);
        expect(value).toBeLessThanOrEqual(after);
    });
});

describe('DateToolsPage — duration mode behavior', () => {
    it('switching to Duration mode shows start and end date inputs', () => {
        render(<DateToolsPage />);
        fireEvent.click(screen.getByRole('button', { name: /duration/i }));
        expect(screen.getByLabelText(/start date/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/end date/i)).toBeInTheDocument();
    });

    it('duration mode shows computed stat labels', () => {
        render(<DateToolsPage />);
        fireEvent.click(screen.getByRole('button', { name: /duration/i }));
        expect(screen.getByText('Total days')).toBeInTheDocument();
        expect(screen.getByText('Working days')).toBeInTheDocument();
        expect(screen.getByText('Weeks')).toBeInTheDocument();
    });

    it('duration mode shows Start and End endpoint cards', () => {
        render(<DateToolsPage />);
        fireEvent.click(screen.getByRole('button', { name: /duration/i }));
        expect(screen.getByText('Start')).toBeInTheDocument();
        expect(screen.getByText('End')).toBeInTheDocument();
    });
});
