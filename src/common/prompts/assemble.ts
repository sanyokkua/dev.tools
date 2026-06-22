import type { ContextOption, PromptVariant, RuleOption } from './model/types';
import { CONTEXTS, STYLES, TONES } from './registries';

const INJECT_MARKER = '[[INJECT_RULES]]';

function buildRuleOptionBlock(prefix: string, option: RuleOption): string {
    const lines: string[] = [`[${prefix} — ${option.label}]`, option.definition, ...option.rules];
    if (option.do?.length) lines.push(...option.do.map((d) => `Do: ${d}`));
    if (option.dont?.length) lines.push(...option.dont.map((d) => `Don't: ${d}`));
    return lines.join('\n');
}

function buildRulesBlock(
    styleOption: RuleOption | null,
    toneOption: RuleOption | null,
    contextOption: ContextOption | null,
): string {
    const parts: string[] = [];
    if (styleOption) parts.push(buildRuleOptionBlock('STYLE', styleOption));
    if (toneOption) parts.push(buildRuleOptionBlock('TONE', toneOption));
    if (contextOption && (contextOption.structure.length > 0 || (contextOption.extraRules?.length ?? 0) > 0)) {
        const structLines = ['[STRUCTURE]', ...contextOption.structure, ...(contextOption.extraRules ?? [])];
        parts.push(structLines.join('\n'));
    }
    if (parts.length === 0) return '';
    return `Apply the following exactly.\n${parts.join('\n\n')}`;
}

export interface AssembleOptions {
    paramValues: Record<string, string>;
    style?: string;
    tone?: string;
    context?: string;
}

export function assemblePrompt(variant: PromptVariant, options: AssembleOptions): string {
    const { paramValues, context: contextId } = options;
    let { style: styleId, tone: toneId } = options;

    let contextOption: ContextOption | null = null;
    if (contextId) {
        contextOption = CONTEXTS.find((c) => c.id === contextId) ?? null;
        if (contextOption) {
            styleId = contextOption.styleId;
            toneId = contextOption.toneId;
        }
    }

    const styleOption = styleId ? (STYLES.find((s) => s.id === styleId) ?? null) : null;
    const toneOption = toneId ? (TONES.find((t) => t.id === toneId) ?? null) : null;

    const rulesBlock = buildRulesBlock(styleOption, toneOption, contextOption);

    let text = variant.template;

    if (rulesBlock) {
        if (text.includes(INJECT_MARKER)) {
            text = text.replace(INJECT_MARKER, rulesBlock);
        } else {
            text = `${rulesBlock}\n\n${text}`;
        }
    } else {
        text = text.replace(INJECT_MARKER, '');
    }

    text = text.replace(/\{\{(\w+)\}\}/g, (_, key: string) => paramValues[key] ?? `{{${key}}}`);

    return text;
}
