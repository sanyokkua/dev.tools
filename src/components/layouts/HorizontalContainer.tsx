'use client';
import React, { ReactNode } from 'react';

export interface HorizontalContainerProps {
    children: ReactNode;
    centerItems?: boolean;
}

const HorizontalContainer: React.FC<HorizontalContainerProps> = ({ children, centerItems }) => {
    return (
        <div className={`horizontal-container ${centerItems ? 'horizontal-container-place-center' : ''}`}>
            {children}
        </div>
    );
};

export default HorizontalContainer;
