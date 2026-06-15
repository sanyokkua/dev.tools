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

    it('renders VRAM preset chips plus Custom chip', () => {
        const { container } = render(
            <VramCalculatorForm formState={INITIAL_FORM_STATE} onFormChange={noop} onCalculate={noop} onReset={noop} />,
        );
        const chips = container.querySelectorAll('.chip');
        // 8 presets (4,8,12,16,32,64,96,128) + 1 Custom = 9
        expect(chips.length).toBe(9);
        expect(chips[0].textContent).toBe('4');
        expect(chips[chips.length - 1].textContent).toBe('Custom');
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

    it('clicking Custom chip shows custom VRAM input and marks chip as .on', () => {
        const onChange = jest.fn();
        const { container } = render(
            <VramCalculatorForm
                formState={INITIAL_FORM_STATE}
                onFormChange={onChange}
                onCalculate={noop}
                onReset={noop}
            />,
        );
        const chips = container.querySelectorAll('.chip');
        const customChip = chips[chips.length - 1];
        expect(customChip.textContent).toBe('Custom');

        fireEvent.click(customChip);

        // Custom chip becomes active
        expect(customChip.classList.contains('on')).toBe(true);
        // Custom number input appears
        expect(container.querySelector('#vram_custom')).toBeTruthy();
        // onFormChange called with a vram_gb value (default 64)
        expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ vram_gb: '64' }));
    });

    it('clicking a preset chip after Custom hides the custom input', () => {
        const onChange = jest.fn();
        const { container } = render(
            <VramCalculatorForm
                formState={{ ...INITIAL_FORM_STATE, vram_gb: '64' }}
                onFormChange={onChange}
                onCalculate={noop}
                onReset={noop}
            />,
        );
        const chips = container.querySelectorAll('.chip');
        const customChip = chips[chips.length - 1];

        // Activate custom mode
        fireEvent.click(customChip);
        expect(container.querySelector('#vram_custom')).toBeTruthy();

        // Click preset chip to exit custom mode
        fireEvent.click(chips[0]); // 4 GB preset
        expect(container.querySelector('#vram_custom')).toBeNull();
        expect(onChange).toHaveBeenLastCalledWith(expect.objectContaining({ vram_gb: '4' }));
    });

    it('custom VRAM input clamps value to [4, 256]', () => {
        const onChange = jest.fn();
        const { container } = render(
            <VramCalculatorForm
                formState={{ ...INITIAL_FORM_STATE, vram_gb: '64' }}
                onFormChange={onChange}
                onCalculate={noop}
                onReset={noop}
            />,
        );
        const chips = container.querySelectorAll('.chip');
        const customChip = chips[chips.length - 1];
        fireEvent.click(customChip);

        const input = container.querySelector('#vram_custom') as HTMLInputElement;
        expect(input).toBeTruthy();

        // Value below min should clamp to 4
        fireEvent.change(input, { target: { value: '1' } });
        expect(onChange).toHaveBeenLastCalledWith(expect.objectContaining({ vram_gb: '4' }));

        // Value above max should clamp to 256
        fireEvent.change(input, { target: { value: '999' } });
        expect(onChange).toHaveBeenLastCalledWith(expect.objectContaining({ vram_gb: '256' }));

        // Value within range should pass through
        fireEvent.change(input, { target: { value: '48' } });
        expect(onChange).toHaveBeenLastCalledWith(expect.objectContaining({ vram_gb: '48' }));
    });
});
