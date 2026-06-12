export type VramPresetGb = 4 | 8 | 16 | 24 | 26 | 28;
export type VramMode = 'apply' | 'dry-run' | 'reset' | 'show-current';

export const VRAM_PRESETS: VramPresetGb[] = [4, 8, 16, 24, 26, 28];
export const DEFAULT_VRAM_PRESET: VramPresetGb = 26;

const PRESET_MB: Record<VramPresetGb, number> = { 4: 4096, 8: 8192, 16: 16384, 24: 24576, 26: 26624, 28: 28672 };

const SILICON_GUARD = `is_apple_silicon() { [[ "$(uname -m)" == "arm64" ]]; }
if ! is_apple_silicon; then echo "Error: Apple Silicon Macs only"; exit 1; fi`;

function applyBody(presetGb: VramPresetGb): string {
    const limitMb = PRESET_MB[presetGb];
    return `${SILICON_GUARD}

TOTAL_RAM_MB=$(( $(sysctl -n hw.memsize) / 1024 / 1024 ))
SAFE_LIMIT_MB=$(( TOTAL_RAM_MB - 4096 ))
if (( ${limitMb} >= SAFE_LIMIT_MB )); then
  echo "Error: ${presetGb} GB exceeds safe limit for this Mac (needs >= 4 GB for macOS)"
  exit 1
fi

LIMIT_MB=${limitMb}
echo "Applying VRAM limit: ${presetGb} GB (${limitMb} MB)"
sudo sysctl iogpu.wired_limit_mb=${limitMb}

APPLIED=$(sysctl -n iogpu.wired_limit_mb)
if [[ "$APPLIED" == "${limitMb}" ]]; then
  echo "SUCCESS: VRAM limit applied"
else
  echo "ERROR: Verification failed"
  exit 1
fi`;
}

function dryRunBody(presetGb: VramPresetGb): string {
    const limitMb = PRESET_MB[presetGb];
    return `${SILICON_GUARD}

TOTAL_RAM_MB=$(( $(sysctl -n hw.memsize) / 1024 / 1024 ))
SAFE_LIMIT_MB=$(( TOTAL_RAM_MB - 4096 ))
if (( ${limitMb} >= SAFE_LIMIT_MB )); then
  echo "Warning: ${presetGb} GB may exceed safe limit on this Mac"
fi

echo "DRY RUN -- Would apply: ${presetGb} GB (${limitMb} MB)"
echo "Target sysctl key: iogpu.wired_limit_mb -> ${limitMb} (not executed)"
echo "(No changes made)"`;
}

function resetBody(): string {
    return `${SILICON_GUARD}

echo "Resetting VRAM limit to macOS automatic behavior"
sudo sysctl iogpu.wired_limit_mb=0

CURRENT=$(sysctl -n iogpu.wired_limit_mb)
if [[ "$CURRENT" == "0" ]]; then
  echo "SUCCESS: VRAM limit reset"
else
  echo "ERROR: Reset verification failed"
  exit 1
fi`;
}

function showCurrentBody(): string {
    return `${SILICON_GUARD}

CURRENT=$(sysctl -n iogpu.wired_limit_mb 2>/dev/null || echo "0")
if [[ "$CURRENT" == "0" ]]; then
  echo "Current VRAM limit: macOS automatic (no override set)"
else
  echo "Current VRAM limit: $((CURRENT / 1024)) GB ($CURRENT MB)"
fi`;
}

const MODE_COMMENT: Record<VramMode, (preset: VramPresetGb) => string> = {
    'apply': (p) => `Apply ${p} GB`,
    'dry-run': (p) => `Dry-run ${p} GB`,
    'reset': () => 'Reset to macOS default',
    'show-current': () => 'Show current limit',
};

export function generateVramScript(preset: VramPresetGb, mode: VramMode): string {
    const header = `#!/usr/bin/env bash
# Apple Silicon VRAM Manager -- ${MODE_COMMENT[mode](preset)}

set -uo pipefail

`;
    const bodies: Record<VramMode, string> = {
        'apply': applyBody(preset),
        'dry-run': dryRunBody(preset),
        'reset': resetBody(),
        'show-current': showCurrentBody(),
    };
    return header + bodies[mode];
}
