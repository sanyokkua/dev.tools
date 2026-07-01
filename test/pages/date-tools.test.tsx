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
    it('renders the mode selector with Timestamp and Calculator options', () => {
        render(<DateToolsPage />);
        expect(screen.getAllByRole('button', { name: /timestamp/i }).length).toBeGreaterThan(0);
        expect(screen.getAllByRole('button', { name: /calculator/i }).length).toBeGreaterThan(0);
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

describe('DateToolsPage — calculator mode / between-dates sub-mode', () => {
    it('switching to Calculator mode shows start and end date inputs', () => {
        render(<DateToolsPage />);
        fireEvent.click(screen.getByRole('button', { name: /calculator/i }));
        expect(screen.getByLabelText(/start date/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/end date/i)).toBeInTheDocument();
    });

    it('calculator mode shows computed stat labels', () => {
        render(<DateToolsPage />);
        fireEvent.click(screen.getByRole('button', { name: /calculator/i }));
        expect(screen.getByText('Total days')).toBeInTheDocument();
        expect(screen.getByText('Working days')).toBeInTheDocument();
        expect(screen.getByText('Weeks')).toBeInTheDocument();
    });

    it('calculator mode shows Start and End endpoint cards', () => {
        render(<DateToolsPage />);
        fireEvent.click(screen.getByRole('button', { name: /calculator/i }));
        expect(screen.getByText('Start')).toBeInTheDocument();
        expect(screen.getByText('End')).toBeInTheDocument();
    });
});

describe('DateToolsPage — timestamp direction toggle', () => {
    it('defaults to Unix -> Date direction showing the Unix timestamp input', () => {
        render(<DateToolsPage />);
        expect(screen.getByLabelText(/unix timestamp/i)).toBeInTheDocument();
    });

    it('switching to Date -> Unix direction shows the date/time input and hides the Unix input', () => {
        render(<DateToolsPage />);
        fireEvent.click(screen.getByRole('button', { name: /date → unix/i }));
        expect(screen.getByLabelText(/date & time/i)).toBeInTheDocument();
        expect(screen.queryByLabelText(/unix timestamp/i)).not.toBeInTheDocument();
    });

    it('Date -> Unix direction shows Unix seconds and milliseconds results', () => {
        render(<DateToolsPage />);
        fireEvent.click(screen.getByRole('button', { name: /date → unix/i }));
        expect(screen.getByText('Unix seconds')).toBeInTheDocument();
        expect(screen.getByText('Unix milliseconds')).toBeInTheDocument();
    });

    it('switching back to Unix -> Date restores the Unix timestamp input', () => {
        render(<DateToolsPage />);
        fireEvent.click(screen.getByRole('button', { name: /date → unix/i }));
        fireEvent.click(screen.getByRole('button', { name: /unix → date/i }));
        expect(screen.getByLabelText(/unix timestamp/i)).toBeInTheDocument();
    });
});

describe('DateToolsPage — formatter mode', () => {
    it('switching to Formatter mode shows the value, pattern, and timezone inputs', () => {
        render(<DateToolsPage />);
        fireEvent.click(screen.getByRole('button', { name: /formatter/i }));
        expect(screen.getByLabelText(/value to parse/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/input pattern/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/output pattern/i)).toBeInTheDocument();
    });

    it('formats the default seeded value using the default output pattern', () => {
        render(<DateToolsPage />);
        fireEvent.click(screen.getByRole('button', { name: /formatter/i }));
        expect(screen.getByText('2025-10-09 08:53:20')).toBeInTheDocument();
    });

    it('shows a parse-error message for an unparseable value', () => {
        render(<DateToolsPage />);
        fireEvent.click(screen.getByRole('button', { name: /formatter/i }));
        fireEvent.change(screen.getByLabelText(/value to parse/i), { target: { value: 'not-a-date' } });
        expect(screen.getByText(/could not parse this value/i)).toBeInTheDocument();
    });

    it('uses the pattern strategy when an input pattern matches an all-digit value', () => {
        render(<DateToolsPage />);
        fireEvent.click(screen.getByRole('button', { name: /formatter/i }));
        fireEvent.change(screen.getByLabelText(/value to parse/i), { target: { value: '20251009' } });
        fireEvent.change(screen.getByLabelText(/input pattern/i), { target: { value: 'YYYYMMDD' } });
        expect(screen.getByText('pattern')).toBeInTheDocument();
    });
});
