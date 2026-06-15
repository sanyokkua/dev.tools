import { ToasterProvider, useToast } from '@/contexts/ToasterContext';
import { ToastType } from '@/controls/toaster/types';
import { act, fireEvent, render, screen } from '@testing-library/react';
import React from 'react';

const ShowToastButton: React.FC<{ message?: string; type?: ToastType; title?: string; durationMs?: number }> = ({
    message = 'Test message',
    type,
    title,
    durationMs,
}) => {
    const { showToast } = useToast();
    return <button onClick={() => showToast({ message, type, title, durationMs })}>Show Toast</button>;
};

describe('ToasterContext', () => {
    beforeEach(() => {
        jest.useFakeTimers();
    });

    afterEach(() => {
        act(() => {
            jest.runAllTimers();
        });
        jest.useRealTimers();
    });

    it('useToast throws when called outside ToasterProvider', () => {
        const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
        const BrokenComponent: React.FC = () => {
            useToast();
            return null;
        };
        expect(() => render(<BrokenComponent />)).toThrow('useToast must be used within a ToasterProvider');
        consoleSpy.mockRestore();
    });

    it('showToast appends a toast to the rendered Toaster', () => {
        render(
            <ToasterProvider>
                <ShowToastButton />
            </ToasterProvider>,
        );
        act(() => {
            fireEvent.click(screen.getByRole('button', { name: 'Show Toast' }));
        });
        expect(screen.getByText('Test message')).toBeInTheDocument();
    });

    it('showToast defaults type to INFO when omitted', () => {
        render(
            <ToasterProvider>
                <ShowToastButton />
            </ToasterProvider>,
        );
        act(() => {
            fireEvent.click(screen.getByRole('button', { name: 'Show Toast' }));
        });
        expect(document.querySelector('.toast.info')).toBeInTheDocument();
    });

    it('showToast uses the provided type', () => {
        render(
            <ToasterProvider>
                <ShowToastButton type={ToastType.SUCCESS} />
            </ToasterProvider>,
        );
        act(() => {
            fireEvent.click(screen.getByRole('button', { name: 'Show Toast' }));
        });
        expect(document.querySelector('.toast.success')).toBeInTheDocument();
    });

    it('showToast uses the provided title and message', () => {
        render(
            <ToasterProvider>
                <ShowToastButton title="Alert Title" message="Alert body" />
            </ToasterProvider>,
        );
        act(() => {
            fireEvent.click(screen.getByRole('button', { name: 'Show Toast' }));
        });
        expect(screen.getByText('Alert Title')).toBeInTheDocument();
        expect(screen.getByText('Alert body')).toBeInTheDocument();
    });

    it('dismissToast marks the toast as exiting', () => {
        render(
            <ToasterProvider>
                <ShowToastButton />
            </ToasterProvider>,
        );
        act(() => {
            fireEvent.click(screen.getByRole('button', { name: 'Show Toast' }));
        });
        act(() => {
            fireEvent.click(screen.getByRole('button', { name: /dismiss/i }));
        });
        expect(document.querySelector('.toast--exiting')).toBeInTheDocument();
    });

    it('toast is auto-removed after durationMs', () => {
        render(
            <ToasterProvider>
                <ShowToastButton durationMs={1000} />
            </ToasterProvider>,
        );
        act(() => {
            fireEvent.click(screen.getByRole('button', { name: 'Show Toast' }));
        });
        expect(screen.getByText('Test message')).toBeInTheDocument();
        act(() => {
            jest.advanceTimersByTime(1001);
        });
        expect(screen.queryByText('Test message')).not.toBeInTheDocument();
    });

    it('toast starts exiting EXIT_DURATION before durationMs', () => {
        render(
            <ToasterProvider>
                <ShowToastButton durationMs={1000} />
            </ToasterProvider>,
        );
        act(() => {
            fireEvent.click(screen.getByRole('button', { name: 'Show Toast' }));
        });
        // EXIT_DURATION = 300ms; exitAt = 1000 - 300 = 700ms; advance past that
        act(() => {
            jest.advanceTimersByTime(701);
        });
        expect(document.querySelector('.toast--exiting')).toBeInTheDocument();
        expect(screen.getByText('Test message')).toBeInTheDocument();
    });
});
