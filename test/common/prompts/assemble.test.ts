import { assemblePrompt } from '../../../src/common/prompts/assemble';
import type { PromptVariant } from '../../../src/common/prompts/model/types';
import { CONTEXTS, STYLES, TONES } from '../../../src/common/prompts/registries';

const baseVariant: PromptVariant = {
    id: 'test-variant',
    kind: 'user',
    categoryCode: 'A01',
    title: 'Test Prompt',
    description: 'A test prompt',
    template: '[[INJECT_RULES]]\n\nYour task: {{task_description}}',
    parameters: [{ name: 'task_description', control: 'textarea' }],
    keywords: [],
    executionContext: 'chat',
};

const noMarkerVariant: PromptVariant = {
    ...baseVariant,
    id: 'no-marker',
    template: 'You are a helpful assistant.\n\nYour task: {{task_description}}',
};

describe('assemblePrompt', () => {
    describe('param substitution', () => {
        it('replaces {{param}} tokens with provided values', () => {
            const result = assemblePrompt(baseVariant, { paramValues: { task_description: 'Write a function' } });
            expect(result).toContain('Write a function');
            expect(result).not.toContain('{{task_description}}');
        });

        it('leaves {{param}} token intact when value is not provided', () => {
            const result = assemblePrompt(baseVariant, { paramValues: {} });
            expect(result).toContain('{{task_description}}');
        });

        it('removes the [[INJECT_RULES]] marker when no style/tone/context is given', () => {
            const result = assemblePrompt(baseVariant, { paramValues: {} });
            expect(result).not.toContain('[[INJECT_RULES]]');
        });
    });

    describe('style injection', () => {
        it('injects the STYLE block at the [[INJECT_RULES]] marker', () => {
            const formalStyle = STYLES.find((s) => s.id === 'formal')!;
            const result = assemblePrompt(baseVariant, { paramValues: {}, style: 'formal' });
            expect(result).toContain(`[STYLE — ${formalStyle.label}]`);
            expect(result).toContain(formalStyle.definition);
            expect(result).not.toContain('[[INJECT_RULES]]');
        });

        it('includes all rules[] lines from the style option', () => {
            const formalStyle = STYLES.find((s) => s.id === 'formal')!;
            const result = assemblePrompt(baseVariant, { paramValues: {}, style: 'formal' });
            formalStyle.rules.forEach((rule) => expect(result).toContain(rule));
        });

        it('silently skips an unknown style id', () => {
            const result = assemblePrompt(baseVariant, { paramValues: {}, style: 'nonexistent-style-id' });
            expect(result).not.toContain('[STYLE —');
            expect(result).not.toContain('[[INJECT_RULES]]');
        });
    });

    describe('tone injection', () => {
        it('injects the TONE block at the [[INJECT_RULES]] marker', () => {
            const professionalTone = TONES.find((t) => t.id === 'professional')!;
            const result = assemblePrompt(baseVariant, { paramValues: {}, tone: 'professional' });
            expect(result).toContain(`[TONE — ${professionalTone.label}]`);
            expect(result).toContain(professionalTone.definition);
        });

        it('silently skips an unknown tone id', () => {
            const result = assemblePrompt(baseVariant, { paramValues: {}, tone: 'nonexistent-tone-id' });
            expect(result).not.toContain('[TONE —');
        });
    });

    describe('injection order', () => {
        it('places STYLE before TONE in the rules block', () => {
            const result = assemblePrompt(baseVariant, { paramValues: {}, style: 'formal', tone: 'professional' });
            const styleIdx = result.indexOf('[STYLE —');
            const toneIdx = result.indexOf('[TONE —');
            expect(styleIdx).toBeGreaterThanOrEqual(0);
            expect(toneIdx).toBeGreaterThanOrEqual(0);
            expect(styleIdx).toBeLessThan(toneIdx);
        });

        it('starts the rules block with "Apply the following exactly."', () => {
            const result = assemblePrompt(baseVariant, { paramValues: {}, style: 'formal' });
            expect(result).toMatch(/Apply the following exactly\./);
        });
    });

    describe('context override', () => {
        it('overrides manually-passed style with the context styleId', () => {
            const managerCtx = CONTEXTS.find((c) => c.id === 'manager')!;
            const overrideStyle = STYLES.find((s) => s.id === managerCtx.styleId)!;
            const manualStyle = STYLES.find((s) => s.id === 'formal')!;

            const result = assemblePrompt(baseVariant, { paramValues: {}, style: 'formal', context: 'manager' });

            expect(result).toContain(`[STYLE — ${overrideStyle.label}]`);
            if (overrideStyle.id !== manualStyle.id) {
                expect(result).not.toContain(`[STYLE — ${manualStyle.label}]`);
            }
        });

        it('overrides manually-passed tone with the context toneId', () => {
            const managerCtx = CONTEXTS.find((c) => c.id === 'manager')!;
            const overrideTone = TONES.find((t) => t.id === managerCtx.toneId)!;

            const result = assemblePrompt(baseVariant, { paramValues: {}, tone: 'formal', context: 'manager' });

            expect(result).toContain(`[TONE — ${overrideTone.label}]`);
        });

        it('injects the context [STRUCTURE] block', () => {
            const managerCtx = CONTEXTS.find((c) => c.id === 'manager')!;
            const result = assemblePrompt(baseVariant, { paramValues: {}, context: 'manager' });
            expect(result).toContain('[STRUCTURE]');
            managerCtx.structure.forEach((line) => expect(result).toContain(line));
        });

        it('appends context extraRules inside the STRUCTURE block', () => {
            const managerCtx = CONTEXTS.find((c) => c.id === 'manager')!;
            const result = assemblePrompt(baseVariant, { paramValues: {}, context: 'manager' });
            if (managerCtx.extraRules?.length) {
                managerCtx.extraRules.forEach((rule) => expect(result).toContain(rule));
            }
        });

        it('silently skips an unknown context id', () => {
            const result = assemblePrompt(baseVariant, { paramValues: {}, context: 'nonexistent-context' });
            expect(result).not.toContain('[STRUCTURE]');
        });
    });

    describe('no marker variant', () => {
        it('prepends the rules block when template has no [[INJECT_RULES]] marker', () => {
            const result = assemblePrompt(noMarkerVariant, { paramValues: {}, style: 'formal' });
            expect(result).toContain('[STYLE —');
            expect(result.indexOf('[STYLE —')).toBeLessThan(result.indexOf('You are a helpful assistant'));
        });
    });

    describe('snapshot', () => {
        it('assembles a prompt with style + tone + params (snapshot)', () => {
            const result = assemblePrompt(baseVariant, {
                paramValues: { task_description: 'Summarize this document' },
                style: 'formal',
                tone: 'professional',
            });
            expect(result).toMatchSnapshot();
        });
    });
});
