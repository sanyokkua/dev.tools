import {
    DEFAULT_VRAM_PRESET,
    VRAM_PRESETS,
    VramPresetGb,
    generateVramScript,
} from '../../src/common/vram-script-generator';

const PRESET_MB: Record<VramPresetGb, number> = { 4: 4096, 8: 8192, 16: 16384, 24: 24576, 26: 26624, 28: 28672 };

describe('generateVramScript', () => {
    it('starts with shebang on every mode and preset', () => {
        VRAM_PRESETS.forEach((preset) => {
            (['apply', 'dry-run', 'reset', 'show-current'] as const).forEach((mode) => {
                expect(generateVramScript(preset, mode)).toMatch(/^#!\/usr\/bin\/env bash/);
            });
        });
    });

    it('includes Apple Silicon guard in every mode', () => {
        VRAM_PRESETS.forEach((preset) => {
            (['apply', 'dry-run', 'reset', 'show-current'] as const).forEach((mode) => {
                expect(generateVramScript(preset, mode)).toContain('arm64');
            });
        });
    });

    describe('apply mode', () => {
        it('embeds the correct MB value for each preset', () => {
            VRAM_PRESETS.forEach((preset) => {
                const script = generateVramScript(preset, 'apply');
                expect(script).toContain(String(PRESET_MB[preset]));
            });
        });

        it('includes RAM safety check', () => {
            const script = generateVramScript(26, 'apply');
            expect(script).toContain('SAFE_LIMIT_MB');
            expect(script).toContain('4096');
        });

        it('includes sudo sysctl apply command', () => {
            const script = generateVramScript(16, 'apply');
            expect(script).toContain('sudo sysctl iogpu.wired_limit_mb=16384');
        });

        it('includes verification after apply', () => {
            const script = generateVramScript(26, 'apply');
            expect(script).toContain('sysctl -n iogpu.wired_limit_mb');
        });
    });

    describe('dry-run mode', () => {
        it('does NOT contain the apply sudo sysctl command', () => {
            const script = generateVramScript(26, 'dry-run');
            expect(script).not.toContain('sudo sysctl iogpu.wired_limit_mb=');
        });

        it('includes DRY RUN marker', () => {
            const script = generateVramScript(26, 'dry-run');
            expect(script).toContain('DRY RUN');
        });

        it('includes no-changes notice', () => {
            const script = generateVramScript(26, 'dry-run');
            expect(script).toContain('No changes made');
        });
    });

    describe('reset mode', () => {
        it('sets limit to 0', () => {
            const script = generateVramScript(26, 'reset');
            expect(script).toContain('iogpu.wired_limit_mb=0');
        });

        it('does NOT embed preset MB value', () => {
            const script = generateVramScript(16, 'reset');
            expect(script).not.toContain('16384');
        });
    });

    describe('show-current mode', () => {
        it('reads the current limit', () => {
            const script = generateVramScript(26, 'show-current');
            expect(script).toContain('iogpu.wired_limit_mb');
        });

        it('does NOT contain sudo', () => {
            const script = generateVramScript(26, 'show-current');
            expect(script).not.toContain('sudo');
        });
    });

    it('DEFAULT_VRAM_PRESET is 26', () => {
        expect(DEFAULT_VRAM_PRESET).toBe(26);
    });

    it('VRAM_PRESETS contains all six values', () => {
        expect(VRAM_PRESETS).toEqual([4, 8, 16, 24, 26, 28]);
    });
});
