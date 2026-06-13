import { fireEvent, render, screen } from '@testing-library/react';
import { Toaster } from '../../src/components/controls/toaster/Toaster';
import { ToastType } from '../../src/components/controls/toaster/types';

const makeToast = (overrides: Record<string, unknown> = {}) => ({
    id: 'test-id',
    message: 'Test message',
    type: ToastType.INFO,
    ...overrides,
});

describe('Toaster', () => {
    it('renders a toast message', () => {
        render(<Toaster toasts={[makeToast()]} />);
        expect(screen.getByText('Test message')).toBeInTheDocument();
    });

    it('renders toast title when provided', () => {
        render(<Toaster toasts={[makeToast({ title: 'My Title' })]} />);
        expect(screen.getByText('My Title')).toBeInTheDocument();
    });

    it('omits title element when title is falsy', () => {
        render(<Toaster toasts={[makeToast({ title: '' })]} />);
        expect(document.querySelector('.toast-title')).not.toBeInTheDocument();
    });

    it.each([
        [ToastType.INFO, 'info'],
        [ToastType.SUCCESS, 'success'],
        [ToastType.WARNING, 'warning'],
        [ToastType.ERROR, 'error'],
    ])('applies correct type class for %s toast', (type, expectedClass) => {
        render(<Toaster toasts={[makeToast({ type })]} />);
        expect(document.querySelector(`.toast.${expectedClass}`)).toBeInTheDocument();
    });

    it.each([ToastType.INFO, ToastType.SUCCESS, ToastType.WARNING, ToastType.ERROR])(
        'renders leading icon for %s toast',
        (type) => {
            render(<Toaster toasts={[makeToast({ type })]} />);
            expect(document.querySelector('.toast-icon')).toBeInTheDocument();
        },
    );

    it('renders dismiss button when onDismiss is provided', () => {
        render(<Toaster toasts={[makeToast()]} onDismiss={() => {}} />);
        expect(screen.getByRole('button', { name: /dismiss/i })).toBeInTheDocument();
    });

    it('does not render dismiss button when onDismiss is omitted', () => {
        render(<Toaster toasts={[makeToast()]} />);
        expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });

    it('calls onDismiss with the toast id when dismiss button is clicked', () => {
        const onDismiss = jest.fn();
        render(<Toaster toasts={[makeToast({ id: 'abc-123' })]} onDismiss={onDismiss} />);
        fireEvent.click(screen.getByRole('button', { name: /dismiss/i }));
        expect(onDismiss).toHaveBeenCalledWith('abc-123');
    });

    it('applies toast--exiting class when toast.exiting is true', () => {
        render(<Toaster toasts={[makeToast({ exiting: true })]} />);
        expect(document.querySelector('.toast--exiting')).toBeInTheDocument();
    });

    it('does not apply toast--exiting class when toast.exiting is false', () => {
        render(<Toaster toasts={[makeToast({ exiting: false })]} />);
        expect(document.querySelector('.toast--exiting')).not.toBeInTheDocument();
    });

    it('renders multiple toasts', () => {
        render(
            <Toaster toasts={[makeToast({ id: '1', message: 'First' }), makeToast({ id: '2', message: 'Second' })]} />,
        );
        expect(screen.getByText('First')).toBeInTheDocument();
        expect(screen.getByText('Second')).toBeInTheDocument();
    });
});
