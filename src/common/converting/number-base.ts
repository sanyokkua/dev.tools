export interface BaseConversion {
    label: string;
    base: number;
    value: string;
    error?: string;
}

const STANDARD_BASES = [
    { base: 10, label: 'Decimal', prefix: '', groupSize: 0 },
    { base: 16, label: 'Hexadecimal', prefix: '0x', groupSize: 0 },
    { base: 2, label: 'Binary', prefix: '0b', groupSize: 4 },
    { base: 8, label: 'Octal', prefix: '0o', groupSize: 0 },
] as const;

export function parseInputAsDecimal(input: string, fromBase: number): number | null {
    let cleaned = input.trim();
    if (!cleaned) return null;
    if (fromBase === 16 && /^0[xX]/.test(cleaned)) cleaned = cleaned.slice(2);
    else if (fromBase === 2 && /^0[bB]/.test(cleaned)) cleaned = cleaned.slice(2);
    else if (fromBase === 8 && /^0[oO]/.test(cleaned)) cleaned = cleaned.slice(2);
    cleaned = cleaned.replace(/\s/g, '');
    if (!cleaned) return null;
    const value = parseInt(cleaned, fromBase);
    return isNaN(value) ? null : value;
}

function groupBits(bits: string, size: number): string {
    const pad = (size - (bits.length % size)) % size;
    const padded = '0'.repeat(pad) + bits;
    const groups: string[] = [];
    for (let i = 0; i < padded.length; i += size) {
        groups.push(padded.slice(i, i + size));
    }
    return groups.join(' ');
}

export function convertNumberBase(input: string, fromBase: number, customBase?: number): BaseConversion[] {
    const decimal = parseInputAsDecimal(input, fromBase);

    const bases = [...STANDARD_BASES] as Array<{ base: number; label: string; prefix: string; groupSize: number }>;
    if (customBase !== undefined && customBase >= 2 && customBase <= 36 && !bases.some((b) => b.base === customBase)) {
        bases.push({ base: customBase, label: `Base ${customBase}`, prefix: '', groupSize: 0 });
    }

    return bases.map(({ base, label, prefix, groupSize }) => {
        if (decimal === null) {
            return { label, base, value: '', error: 'Invalid input' };
        }
        let raw = Math.abs(decimal).toString(base).toUpperCase();
        if (groupSize > 0 && raw.length > groupSize) {
            raw = groupBits(raw, groupSize);
        }
        const sign = decimal < 0 ? '-' : '';
        return { label, base, value: `${sign}${prefix}${raw}` };
    });
}
