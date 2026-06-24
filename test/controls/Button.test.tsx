import { fireEvent, render, screen } from '@testing-library/react';
import Button from '../../src/components/controls/Button';

describe('Button', () => {
    it('renders with .btn base class', () => {
        render(<Button text="Click" />);
        expect(screen.getByRole('button')).toHaveClass('btn');
    });

    it('variant="solid" → .btn.primary', () => {
        render(<Button text="Click" variant="solid" />);
        const btn = screen.getByRole('button');
        expect(btn).toHaveClass('btn');
        expect(btn).toHaveClass('primary');
    });

    it('variant="filled" → .btn.tonal', () => {
        render(<Button text="Click" variant="filled" />);
        expect(screen.getByRole('button')).toHaveClass('tonal');
    });

    it('variant="outlined" → .btn.outline', () => {
        render(<Button text="Click" variant="outlined" />);
        expect(screen.getByRole('button')).toHaveClass('outline');
    });

    it('variant="text" → .btn.ghost', () => {
        render(<Button text="Click" variant="text" />);
        expect(screen.getByRole('button')).toHaveClass('ghost');
    });

    it('size="small" → .btn.sm', () => {
        render(<Button text="Click" size="small" />);
        expect(screen.getByRole('button')).toHaveClass('sm');
    });

    it('size="large" → .button-large', () => {
        render(<Button text="Click" size="large" />);
        expect(screen.getByRole('button')).toHaveClass('button-large');
    });

    it('danger=true → adds danger class', () => {
        render(<Button text="Click" danger />);
        expect(screen.getByRole('button')).toHaveClass('danger');
    });

    it('ghost=true → adds ghost class', () => {
        render(<Button text="Click" ghost />);
        expect(screen.getByRole('button')).toHaveClass('ghost');
    });

    it('disabled=true → button is disabled', () => {
        render(<Button text="Click" disabled />);
        expect(screen.getByRole('button')).toBeDisabled();
    });

    it('loading=true → has button-loading class and click does not call onClick', () => {
        const onClick = jest.fn();
        render(<Button text="Click" loading onClick={onClick} />);
        const btn = screen.getByRole('button');
        expect(btn).toHaveClass('button-loading');
        fireEvent.click(btn);
        expect(onClick).not.toHaveBeenCalled();
    });

    it('block=true → has button-block class', () => {
        render(<Button text="Click" block />);
        expect(screen.getByRole('button')).toHaveClass('button-block');
    });

    it('icon renders before text', () => {
        const icon = <span data-testid="icon">★</span>;
        render(<Button text="Label" icon={icon} />);
        const btn = screen.getByRole('button');
        const children = Array.from(btn.childNodes);
        const iconEl = screen.getByTestId('icon');
        expect(children[0]).toBe(iconEl);
    });

    it('calls onClick on click', () => {
        const onClick = jest.fn();
        render(<Button text="Click" onClick={onClick} />);
        fireEvent.click(screen.getByRole('button'));
        expect(onClick).toHaveBeenCalledTimes(1);
    });

    it('does not call onClick when disabled', () => {
        const onClick = jest.fn();
        render(<Button text="Click" onClick={onClick} disabled />);
        fireEvent.click(screen.getByRole('button'));
        expect(onClick).not.toHaveBeenCalled();
    });

    it('renders text content', () => {
        render(<Button text="Hello World" />);
        expect(screen.getByRole('button')).toHaveTextContent('Hello World');
    });

    it('type="submit" sets submit attribute', () => {
        render(<Button text="Submit" type="submit" />);
        expect(screen.getByRole('button')).toHaveAttribute('type', 'submit');
    });

    it('passes ariaLabel as aria-label attribute', () => {
        render(<Button text="⧉" ariaLabel="Copy" onClick={jest.fn()} />);
        const btn = screen.getByRole('button', { name: /copy/i });
        expect(btn).toHaveAttribute('aria-label', 'Copy');
        expect(btn).toHaveTextContent('⧉');
    });
});
