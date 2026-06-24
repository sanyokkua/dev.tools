export type XmlValidationResult = { valid: true } | { valid: false; error: string; line?: number; column?: number };
export type XPathQueryResult =
    | { type: 'nodes'; nodes: string[]; count: number }
    | { type: 'string'; value: string }
    | { type: 'number'; value: number }
    | { type: 'boolean'; value: boolean }
    | { error: string };

export function validateXml(xmlStr: string): XmlValidationResult {
    const doc = new DOMParser().parseFromString(xmlStr, 'text/xml');
    const parseerror = doc.querySelector('parsererror');
    if (!parseerror) return { valid: true };
    const errorText = parseerror.textContent ?? 'Unknown parse error';
    const line = new RegExp(/line (\d+)/i).exec(errorText)?.[1];
    const col = new RegExp(/column (\d+)/i).exec(errorText)?.[1];
    return {
        valid: false,
        error: errorText,
        ...(line === undefined ? {} : { line: Number(line) }),
        ...(col === undefined ? {} : { column: Number(col) }),
    };
}

function escapeXml(s: string): string {
    return s.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
}

function escapeAttr(s: string): string {
    return escapeXml(s).replaceAll('"', '&quot;');
}

export function formatXml(xmlStr: string, indent: number | string = 2): string {
    const doc = new DOMParser().parseFromString(xmlStr, 'text/xml');
    const parseerror = doc.querySelector('parsererror');
    if (parseerror) throw new Error(parseerror.textContent ?? 'Unknown parse error');

    const indentStr = typeof indent === 'number' ? ' '.repeat(indent) : indent;

    function serializeNode(node: Node, depth: number): string {
        const pad = indentStr.repeat(depth);
        switch (node.nodeType) {
            case Node.TEXT_NODE: {
                const text = node.nodeValue ?? '';
                if (!text.trim()) return '';
                return `${pad}${escapeXml(text.trim())}\n`;
            }
            case Node.COMMENT_NODE:
                return `${pad}<!--${node.nodeValue ?? ''}-->\n`;
            case Node.CDATA_SECTION_NODE:
                return `${pad}<![CDATA[${node.nodeValue ?? ''}]]>\n`;
            case Node.PROCESSING_INSTRUCTION_NODE: {
                const pi = node as ProcessingInstruction;
                return `${pad}<?${pi.target} ${pi.data}?>\n`;
            }
            case Node.DOCUMENT_TYPE_NODE: {
                const dt = node as DocumentType;
                return `${pad}<!DOCTYPE ${dt.name}>\n`;
            }
            case Node.ELEMENT_NODE: {
                const el = node as Element;
                const attrs = Array.from(el.attributes)
                    .map((a) => ` ${a.name}="${escapeAttr(a.value)}"`)
                    .join('');
                const children = Array.from(el.childNodes)
                    .map((child) => serializeNode(child, depth + 1))
                    .filter((s) => s !== '')
                    .join('');
                if (!children) return `${pad}<${el.tagName}${attrs}/>\n`;
                const singleTextChild =
                    el.childNodes.length === 1 &&
                    el.childNodes[0].nodeType === Node.TEXT_NODE &&
                    (el.childNodes[0].nodeValue ?? '').trim() !== '';
                if (singleTextChild) {
                    return `${pad}<${el.tagName}${attrs}>${escapeXml((el.childNodes[0].nodeValue ?? '').trim())}</${el.tagName}>\n`;
                }
                return `${pad}<${el.tagName}${attrs}>\n${children}${pad}</${el.tagName}>\n`;
            }
            default:
                return '';
        }
    }

    const parts: string[] = ['<?xml version="1.0" encoding="UTF-8"?>\n'];
    doc.childNodes.forEach((child) => {
        const s = serializeNode(child, 0);
        if (s) parts.push(s);
    });
    return parts.join('');
}

export function minifyXml(xmlStr: string): string {
    const doc = new DOMParser().parseFromString(xmlStr, 'text/xml');
    const parseerror = doc.querySelector('parsererror');
    if (parseerror) throw new Error(parseerror.textContent ?? 'Unknown parse error');

    const whitespaceNodes: Node[] = [];
    function collectWhitespace(node: Node): void {
        node.childNodes.forEach((child) => {
            if (child.nodeType === Node.TEXT_NODE && child.nodeValue?.trim() === '') {
                whitespaceNodes.push(child);
            } else {
                collectWhitespace(child);
            }
        });
    }
    collectWhitespace(doc);
    whitespaceNodes.forEach((node) => node.parentNode?.removeChild(node));

    return new XMLSerializer().serializeToString(doc);
}

export function queryXPath(xmlStr: string, xpath: string): XPathQueryResult {
    try {
        const validationResult = validateXml(xmlStr);
        if (!validationResult.valid) return { error: validationResult.error };

        const doc = new DOMParser().parseFromString(xmlStr, 'text/xml');
        const result = document.evaluate(xpath, doc, null, XPathResult.ANY_TYPE, null);

        switch (result.resultType) {
            case XPathResult.NUMBER_TYPE:
                return { type: 'number', value: result.numberValue };
            case XPathResult.STRING_TYPE:
                return { type: 'string', value: result.stringValue };
            case XPathResult.BOOLEAN_TYPE:
                return { type: 'boolean', value: result.booleanValue };
            default: {
                const nodes: string[] = [];
                const serializer = new XMLSerializer();
                let node = result.iterateNext();
                while (node) {
                    nodes.push(serializer.serializeToString(node));
                    node = result.iterateNext();
                }
                return { type: 'nodes', nodes, count: nodes.length };
            }
        }
    } catch (e) {
        return { error: e instanceof Error ? e.message : String(e) };
    }
}
