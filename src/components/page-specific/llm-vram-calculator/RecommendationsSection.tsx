'use client';
import type { Recommendation } from '@/common/llm-vram-calc';
import { QUANT_CATALOG } from '@/common/llm-vram-calc';
import React from 'react';

/** @description Props for the RecommendationsSection component. */
interface RecommendationsSectionProps {
    recommendations: readonly Recommendation[];
}

/** @description Formats a recommendation tier identifier into a human-readable label. */
function formatTierLabel(tier: string): string {
    switch (tier) {
        case 'optimal':
            return 'Optimal';
        case 'minimum':
            return 'Minimum';
        case 'maximum_quality':
            return 'Maximum Quality';
        default:
            return tier;
    }
}

/**
 * @description Displays recommendation cards with tier badges (optimal, minimum, maximum quality)
 * showing the suggested quantization, context size, VRAM usage, and headroom for each tier.
 */
const RecommendationsSection: React.FC<RecommendationsSectionProps> = ({ recommendations }) => {
    return (
        <div>
            <h2>Recommendations</h2>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                {recommendations.map((rec) => {
                    const catalogEntry = QUANT_CATALOG[rec.quantization];
                    return (
                        <div key={rec.tier} className="card pad vram-recommendation-card">
                            <span className={`vram-tier-badge vram-tier-${rec.tier}`}>{formatTierLabel(rec.tier)}</span>
                            <dl className="vram-kv-grid">
                                <dt>Quantization</dt>
                                <dd>{rec.quantization}</dd>
                                <dt>Context</dt>
                                <dd>{rec.context_label}</dd>
                                <dt>KV Cache Quant</dt>
                                <dd>{rec.kv_cache_quant.toUpperCase()}</dd>
                                <dt>GGUF Size</dt>
                                <dd>{rec.estimated_gguf_gb.toFixed(2)} GB</dd>
                                <dt>Total VRAM</dt>
                                <dd>{rec.total_vram_gb.toFixed(2)} GB</dd>
                                <dt>Headroom</dt>
                                <dd>{rec.headroom_gb.toFixed(2)} GB</dd>
                                {catalogEntry?.hint && (
                                    <>
                                        <dt>Hint</dt>
                                        <dd>{catalogEntry.hint}</dd>
                                    </>
                                )}
                            </dl>
                            <p>{rec.description}</p>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default RecommendationsSection;
