import { renderMermaid } from '@/common/mermaid';
import React, { useEffect, useId, useState } from 'react';

interface MermaidBlockProps {
    src: string;
}

const MermaidBlock: React.FC<MermaidBlockProps> = ({ src }) => {
    const rawId = useId();
    const diagramId = `mermaid${rawId.replace(/\W/g, '')}`;
    const [svg, setSvg] = useState<string>('');
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;
        setSvg('');
        setError(null);
        renderMermaid(diagramId, src)
            .then((result) => {
                if (!cancelled) setSvg(result);
            })
            .catch((err: unknown) => {
                if (!cancelled) setError(String((err as Error)?.message ?? err));
            });
        return () => {
            cancelled = true;
        };
    }, [src, diagramId]);

    if (error) return <div className="mermaid-block mermaid-block--error">{error}</div>;
    if (!svg) return <div className="mermaid-block mermaid-block--loading">Rendering diagram…</div>;
    return <div className="mermaid-block" dangerouslySetInnerHTML={{ __html: svg }} />;
};

MermaidBlock.displayName = 'MermaidBlock';
export default MermaidBlock;
