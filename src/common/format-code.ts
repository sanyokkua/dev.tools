import type { Options } from 'prettier';

const FORMATTABLE_LANGS = new Set([
    'javascript',
    'jsx',
    'typescript',
    'tsx',
    'json',
    'json5',
    'html',
    'css',
    'scss',
    'less',
    'markdown',
    'sql',
    'xml',
]);

export function isFormattable(languageId: string): boolean {
    return FORMATTABLE_LANGS.has(languageId);
}

const PROJECT_PRETTIER_OPTIONS: Options = {
    printWidth: 120,
    tabWidth: 4,
    singleQuote: true,
    semi: true,
    trailingComma: 'all',
    bracketSpacing: true,
    arrowParens: 'always',
};

type PluginKey = 'babel' | 'typescript' | 'html' | 'postcss' | 'markdown';

async function formatWithPrettier(parser: string, src: string, pluginKeys: PluginKey[]): Promise<string> {
    const [prettier, estree, ...rest] = await Promise.all([
        import('prettier/standalone').then((m) => m.default ?? m),
        import('prettier/plugins/estree').then((m) => m.default ?? m),
        ...pluginKeys.map((k) =>
            (() => {
                const loaders: Record<PluginKey, () => Promise<unknown>> = {
                    babel: () => import('prettier/plugins/babel').then((m) => m.default ?? m),
                    typescript: () => import('prettier/plugins/typescript').then((m) => m.default ?? m),
                    html: () => import('prettier/plugins/html').then((m) => m.default ?? m),
                    postcss: () => import('prettier/plugins/postcss').then((m) => m.default ?? m),
                    markdown: () => import('prettier/plugins/markdown').then((m) => m.default ?? m),
                };
                return loaders[k]();
            })(),
        ),
    ]);
    // estree is needed for babel/typescript parsers; html/postcss/markdown don't need it
    const needsEstree = parser === 'babel' || parser === 'typescript' || parser === 'json' || parser === 'json5';
    const plugins = needsEstree ? [estree, ...rest] : [...rest];
    return (prettier as { format: (src: string, opts: Options) => Promise<string> }).format(src, {
        ...PROJECT_PRETTIER_OPTIONS,
        parser,
        plugins,
    });
}

async function formatWithSql(src: string): Promise<string> {
    const { format } = await import('sql-formatter');
    return format(src, { language: 'sql', tabWidth: 4 });
}

async function formatWithXml(src: string): Promise<string> {
    const [prettier, pluginXml] = await Promise.all([
        import('prettier/standalone').then((m) => m.default ?? m),
        import('@prettier/plugin-xml').then((m) => m.default ?? m),
    ]);
    return (prettier as { format: (src: string, opts: Options) => Promise<string> }).format(src, {
        ...PROJECT_PRETTIER_OPTIONS,
        parser: 'xml',
        plugins: [pluginXml],
        // @ts-expect-error -- @prettier/plugin-xml option not in base types
        xmlWhitespaceSensitivity: 'ignore',
    });
}

export async function formatCode(languageId: string, src: string): Promise<string> {
    if (!src.trim() || !isFormattable(languageId)) return src;

    switch (languageId) {
        case 'javascript':
        case 'jsx':
            return formatWithPrettier('babel', src, ['babel']);
        case 'typescript':
        case 'tsx':
            return formatWithPrettier('typescript', src, ['typescript']);
        case 'json':
            return formatWithPrettier('json', src, ['babel']);
        case 'json5':
            return formatWithPrettier('json5', src, ['babel']);
        case 'html':
            return formatWithPrettier('html', src, ['html']);
        case 'css':
            return formatWithPrettier('css', src, ['postcss']);
        case 'scss':
            return formatWithPrettier('scss', src, ['postcss']);
        case 'less':
            return formatWithPrettier('less', src, ['postcss']);
        case 'markdown':
            return formatWithPrettier('markdown', src, ['markdown']);
        case 'sql':
            return formatWithSql(src);
        case 'xml':
            return formatWithXml(src);
        default:
            return src;
    }
}
