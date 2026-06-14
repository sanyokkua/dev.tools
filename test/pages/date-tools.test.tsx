import { render, screen } from '@testing-library/react';
import DateToolsPage from '../../src/pages/date-tools/index';

jest.mock('../../src/components/contexts/PageContext', () => ({ usePage: () => ({ setPageTitle: jest.fn() }) }));
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
