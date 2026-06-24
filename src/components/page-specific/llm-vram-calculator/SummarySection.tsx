'use client';
import type { SummaryStatistics } from '@/common/llm-vram-calc';
import React from 'react';

/** @description Props for the SummarySection component. */
interface SummarySectionProps {
    summary: SummaryStatistics;
}

/** @description Displays aggregate statistics: total configurations, fitting configurations, and VRAM size range. */
const SummarySection: React.FC<SummarySectionProps> = ({ summary }) => {
    return (
        <div className="card pad">
            <h2>Summary</h2>
            <dl className="vram-kv-grid">
                <dt>Total Configurations</dt>
                <dd>{summary.total_configurations}</dd>
                <dt>Fitting Configurations</dt>
                <dd>{summary.fitting_configurations ?? 'N/A (no VRAM specified)'}</dd>
                <dt>Smallest Config</dt>
                <dd>{summary.smallest_config_gb.toFixed(2)} GB</dd>
                <dt>Largest Config</dt>
                <dd>{summary.largest_config_gb.toFixed(2)} GB</dd>
            </dl>
        </div>
    );
};

export default SummarySection;
