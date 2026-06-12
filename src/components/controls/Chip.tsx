'use client';
import React from 'react';

type ChipProps = { text: string; selected?: boolean; onClick?: () => void; onRemove?: () => void };

const Chip: React.FC<ChipProps> = ({ text, selected = false, onClick, onRemove }) => {
    const classes = ['chip', selected && 'chip-selected', !onClick && !onRemove && 'chip-static']
        .filter(Boolean)
        .join(' ');

    return (
        <div
            className={classes}
            onClick={onClick}
            role={onClick ? 'button' : undefined}
            aria-pressed={onClick ? selected : undefined}
            tabIndex={onClick ? 0 : undefined}
            onKeyDown={onClick ? (e) => e.key === 'Enter' && onClick() : undefined}
        >
            {text}
            {onRemove && (
                <span
                    className="chip-x"
                    onClick={(e) => {
                        e.stopPropagation();
                        onRemove();
                    }}
                    aria-label="Remove"
                >
                    ×
                </span>
            )}
        </div>
    );
};

export default Chip;
