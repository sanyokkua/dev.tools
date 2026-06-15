import { fireEvent, render, screen } from '@testing-library/react';
import VramCalculatorForm, {
    INITIAL_FORM_STATE,
} from '../../../src/components/page-specific/llm-vram-calculator/VramCalculatorForm';

const noop = () => {};

describe('VramCalculatorForm', () => {
    it('renders with .card.pad wrapper, not .paper', () => {
        const { container } = render(
            <VramCalculatorForm formState={INITIAL_FORM_STATE} onFormChange={noop} onCalculate={noop} onReset={noop} />,
        );
        expect(container.querySelector('.card.pad')).toBeTruthy();
        expect(container.querySelector('.paper')).toBeNull();
    });

    it('renders .steplabel elements for sections A, B, C', () => {
        const { container } = render(
            <VramCalculatorForm formState={INITIAL_FORM_STATE} onFormChange={noop} onCalculate={noop} onReset={noop} />,
        );
        const stepLabels = container.querySelectorAll('.steplabel');
        expect(stepLabels.length).toBe(3);
        const ns = container.querySelectorAll('.steplabel .n');
        expect(ns[0].textContent).toBe('A');
        expect(ns[1].textContent).toBe('B');
        expect(ns[2].textContent).toBe('C');
    });

    it('renders a Switch (role=switch) for KV cache, not a checkbox input', () => {
        render(
            <VramCalculatorForm formState={INITIAL_FORM_STATE} onFormChange={noop} onCalculate={noop} onReset={noop} />,
        );
        const switchEl = screen.getByRole('switch');
        expect(switchEl).toBeTruthy();
        expect(screen.queryByRole('checkbox')).toBeNull();
    });

    it('toggles KV cache via Switch', () => {
        const onChange = jest.fn();
        render(
            <VramCalculatorForm
                formState={INITIAL_FORM_STATE}
                onFormChange={onChange}
                onCalculate={noop}
                onReset={noop}
            />,
        );
        const switchEl = screen.getByRole('switch');
        fireEvent.click(switchEl);
        expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ kv_cache_enabled: false }));
    });

    it('renders VRAM preset chips', () => {
        const { container } = render(
            <VramCalculatorForm formState={INITIAL_FORM_STATE} onFormChange={noop} onCalculate={noop} onReset={noop} />,
        );
        const chips = container.querySelectorAll('.chip');
        expect(chips.length).toBe(8);
        expect(chips[0].textContent).toBe('4');
    });

    it('marks preset chip as .on when value matches vram_gb', () => {
        const { container } = render(
            <VramCalculatorForm
                formState={{ ...INITIAL_FORM_STATE, vram_gb: '16' }}
                onFormChange={noop}
                onCalculate={noop}
                onReset={noop}
            />,
        );
        const onChips = container.querySelectorAll('.chip.on');
        expect(onChips.length).toBe(1);
        expect(onChips[0].textContent).toBe('16');
    });

    it('renders .detailsbox for Advanced Architecture and MoE sections', () => {
        const { container } = render(
            <VramCalculatorForm formState={INITIAL_FORM_STATE} onFormChange={noop} onCalculate={noop} onReset={noop} />,
        );
        const boxes = container.querySelectorAll('details.detailsbox');
        expect(boxes.length).toBe(2);
        expect(boxes[0].querySelector('summary')?.textContent).toContain('Advanced Architecture');
        expect(boxes[1].querySelector('summary')?.textContent).toContain('MoE Parameters');
    });

    it('renders .formgrid containers for field layout', () => {
        const { container } = render(
            <VramCalculatorForm formState={INITIAL_FORM_STATE} onFormChange={noop} onCalculate={noop} onReset={noop} />,
        );
        const grids = container.querySelectorAll('.formgrid');
        expect(grids.length).toBeGreaterThanOrEqual(4);
    });

    it('submitting the form calls onCalculate', () => {
        const onCalculate = jest.fn();
        const { container } = render(
            <VramCalculatorForm
                formState={INITIAL_FORM_STATE}
                onFormChange={noop}
                onCalculate={onCalculate}
                onReset={noop}
            />,
        );
        fireEvent.submit(container.querySelector('form')!);
        expect(onCalculate).toHaveBeenCalledTimes(1);
    });
});
