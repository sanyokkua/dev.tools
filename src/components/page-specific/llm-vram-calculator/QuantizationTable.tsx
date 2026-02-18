'use client';
import type { QuantizationAnalysis } from '@/common/llm-vram-calc';
import React from 'react';

/** @description Props for the QuantizationTable component. */
interface QuantizationTableProps {
    analysis: QuantizationAnalysis;
    defaultOpen?: boolean;
}

/**
 * @description Collapsible per-quantization context table showing KV cache size, VRAM usage
 * (with and without cache), and fit status for each context size.
 */
const QuantizationTable: React.FC<QuantizationTableProps> = ({ analysis, defaultOpen = false }) => {
    const fitsCount = analysis.context_table.filter((e) => e.fits_in_vram === true).length;
    const totalCount = analysis.context_table.length;

    return (
        <details open={defaultOpen || undefined}>
            <summary>
                <span className="vram-quant-header">
                    <strong>{analysis.quantization}</strong>
                    <span className="vram-quant-stat">
                        {analysis.bits_per_param} bits/param
                        {analysis.estimated_gguf_gb !== null && ` | ~${analysis.estimated_gguf_gb.toFixed(2)} GB GGUF`}
                        {' | '}Min VRAM: {analysis.min_vram_no_cache_gb.toFixed(2)} GB (no cache),{' '}
                        {analysis.min_vram_with_cache_gb.toFixed(2)} GB (with cache)
                        {totalCount > 0 && ` | ${fitsCount}/${totalCount} contexts fit`}
                    </span>
                </span>
            </summary>
            <table className="transfer-table">
                <thead>
                    <tr>
                        <th className="transfer-th-td">Context</th>
                        <th className="transfer-th-td">KV Cache (GB)</th>
                        <th className="transfer-th-td">VRAM w/ Cache</th>
                        <th className="transfer-th-td">VRAM w/o Cache</th>
                        <th className="transfer-th-td">Fits?</th>
                    </tr>
                </thead>
                <tbody>
                    {analysis.context_table.map((entry) => (
                        <tr key={entry.context_size}>
                            <td className="transfer-th-td">{entry.context_label}</td>
                            <td className="transfer-th-td">{entry.kv_cache_gb.toFixed(2)}</td>
                            <td className="transfer-th-td">{entry.vram_with_cache_gb.toFixed(2)} GB</td>
                            <td className="transfer-th-td">{entry.vram_without_cache_gb.toFixed(2)} GB</td>
                            <td className="transfer-th-td">
                                {entry.fits_in_vram === true && <span className="vram-fits-yes">Yes</span>}
                                {entry.fits_in_vram === false && <span className="vram-fits-no">No</span>}
                                {entry.fits_in_vram === null && <span className="vram-fits-unknown">—</span>}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </details>
    );
};

export default QuantizationTable;
