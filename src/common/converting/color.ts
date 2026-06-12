export type ColorFormat = 'hex' | 'rgb' | 'hsl' | 'hsv';

interface Rgb {
    r: number;
    g: number;
    b: number;
}

export interface ColorConversion {
    format: ColorFormat;
    label: string;
    value: string;
    swatchColor: string;
    error?: string;
}

const FORMAT_LABELS: Record<ColorFormat, string> = { hex: 'HEX', rgb: 'RGB', hsl: 'HSL', hsv: 'HSV' };

function clamp(v: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, v));
}

function hexToRgb(hex: string): Rgb | null {
    const cleaned = hex.replace(/^#/, '');
    const full =
        cleaned.length === 3
            ? cleaned
                  .split('')
                  .map((c) => c + c)
                  .join('')
            : cleaned;
    if (full.length !== 6) return null;
    const n = parseInt(full, 16);
    if (isNaN(n)) return null;
    return { r: (n >> 16) & 0xff, g: (n >> 8) & 0xff, b: n & 0xff };
}

function rgbStringToRgb(input: string): Rgb | null {
    const m = input.match(/^rgb\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)$/i);
    if (!m) return null;
    const r = +m[1],
        g = +m[2],
        b = +m[3];
    if (r > 255 || g > 255 || b > 255) return null;
    return { r, g, b };
}

function hslToRgb(h: number, s: number, l: number): Rgb {
    const sn = s / 100,
        ln = l / 100;
    const c = (1 - Math.abs(2 * ln - 1)) * sn;
    const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
    const m = ln - c / 2;
    let r = 0,
        g = 0,
        b = 0;
    if (h < 60) {
        r = c;
        g = x;
    } else if (h < 120) {
        r = x;
        g = c;
    } else if (h < 180) {
        g = c;
        b = x;
    } else if (h < 240) {
        g = x;
        b = c;
    } else if (h < 300) {
        r = x;
        b = c;
    } else {
        r = c;
        b = x;
    }
    return { r: Math.round((r + m) * 255), g: Math.round((g + m) * 255), b: Math.round((b + m) * 255) };
}

function hslStringToRgb(input: string): Rgb | null {
    const m = input.match(/^hsl\s*\(\s*([\d.]+)\s*,\s*([\d.]+)%?\s*,\s*([\d.]+)%?\s*\)$/i);
    if (!m) return null;
    return hslToRgb(+m[1], +m[2], +m[3]);
}

function hsvStringToRgb(input: string): Rgb | null {
    const m = input.match(/^hsv\s*\(\s*([\d.]+)\s*,\s*([\d.]+)%?\s*,\s*([\d.]+)%?\s*\)$/i);
    if (!m) return null;
    const h = +m[1],
        s = +m[2] / 100,
        v = +m[3] / 100;
    const c = v * s;
    const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
    const m2 = v - c;
    let r = 0,
        g = 0,
        b = 0;
    if (h < 60) {
        r = c;
        g = x;
    } else if (h < 120) {
        r = x;
        g = c;
    } else if (h < 180) {
        g = c;
        b = x;
    } else if (h < 240) {
        g = x;
        b = c;
    } else if (h < 300) {
        r = x;
        b = c;
    } else {
        r = c;
        b = x;
    }
    return { r: Math.round((r + m2) * 255), g: Math.round((g + m2) * 255), b: Math.round((b + m2) * 255) };
}

function parseColor(input: string, format: ColorFormat): Rgb | null {
    const trimmed = input.trim();
    switch (format) {
        case 'hex':
            return hexToRgb(trimmed);
        case 'rgb':
            return rgbStringToRgb(trimmed);
        case 'hsl':
            return hslStringToRgb(trimmed);
        case 'hsv':
            return hsvStringToRgb(trimmed);
    }
}

function rgbToHex({ r, g, b }: Rgb): string {
    return '#' + [r, g, b].map((v) => clamp(v, 0, 255).toString(16).toUpperCase().padStart(2, '0')).join('');
}

function rgbToHsl({ r, g, b }: Rgb): string {
    const rn = r / 255,
        gn = g / 255,
        bn = b / 255;
    const max = Math.max(rn, gn, bn),
        min = Math.min(rn, gn, bn);
    const l = (max + min) / 2;
    if (max === min) return `hsl(0, 0%, ${Math.round(l * 100)}%)`;
    const d = max - min;
    const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    let h = 0;
    if (max === rn) h = ((gn - bn) / d + (gn < bn ? 6 : 0)) / 6;
    else if (max === gn) h = ((bn - rn) / d + 2) / 6;
    else h = ((rn - gn) / d + 4) / 6;
    return `hsl(${Math.round(h * 360)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%)`;
}

function rgbToHsv({ r, g, b }: Rgb): string {
    const rn = r / 255,
        gn = g / 255,
        bn = b / 255;
    const max = Math.max(rn, gn, bn),
        min = Math.min(rn, gn, bn);
    const v = max;
    const d = max - min;
    const s = max === 0 ? 0 : d / max;
    let h = 0;
    if (d !== 0) {
        if (max === rn) h = ((gn - bn) / d + (gn < bn ? 6 : 0)) / 6;
        else if (max === gn) h = ((bn - rn) / d + 2) / 6;
        else h = ((rn - gn) / d + 4) / 6;
    }
    return `hsv(${Math.round(h * 360)}, ${Math.round(s * 100)}%, ${Math.round(v * 100)}%)`;
}

export const COLOR_FORMATS: ColorFormat[] = ['hex', 'rgb', 'hsl', 'hsv'];

export function convertColor(input: string, fromFormat: ColorFormat): ColorConversion[] {
    const rgb = parseColor(input, fromFormat);
    const errorSwatch = 'rgb(128,128,128)';

    if (!rgb) {
        return COLOR_FORMATS.map((f) => ({
            format: f,
            label: FORMAT_LABELS[f],
            value: '',
            swatchColor: errorSwatch,
            error: 'Invalid color',
        }));
    }

    const swatch = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
    return COLOR_FORMATS.map((f) => {
        let value: string;
        switch (f) {
            case 'hex':
                value = rgbToHex(rgb);
                break;
            case 'rgb':
                value = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
                break;
            case 'hsl':
                value = rgbToHsl(rgb);
                break;
            case 'hsv':
                value = rgbToHsv(rgb);
                break;
        }
        return { format: f, label: FORMAT_LABELS[f], value, swatchColor: swatch };
    });
}
