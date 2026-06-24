import { fireEvent, render, screen } from '@testing-library/react';
import ColumnMenu from '../../src/components/elements/column/ColumnMenu';

describe('ColumnMenu', () => {
    it('renders a func-btn button for each available function', () => {
        const fns = [
            { name: 'Format', onClick: jest.fn() },
            { name: 'Minify', onClick: jest.fn() },
        ];
        render(<ColumnMenu availableFunctions={fns} />);
        const buttons = document.querySelectorAll('button.func-btn');
        expect(buttons).toHaveLength(2);
    });

    it('renders button text matching the function name', () => {
        const fns = [{ name: 'Slugify with underscore low', onClick: jest.fn() }];
        render(<ColumnMenu availableFunctions={fns} />);
        expect(screen.getByText('Slugify with underscore low')).toBeInTheDocument();
    });

    it('calls onClick when a button is clicked', () => {
        const handler = jest.fn();
        render(<ColumnMenu availableFunctions={[{ name: 'Run', onClick: handler }]} />);
        fireEvent.click(screen.getByText('Run'));
        expect(handler).toHaveBeenCalledTimes(1);
    });

    it('renders nothing when availableFunctions is empty', () => {
        render(<ColumnMenu availableFunctions={[]} />);
        expect(document.querySelectorAll('button')).toHaveLength(0);
    });
});
