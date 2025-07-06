'use client';
import React, { ReactNode } from 'react';

type Elevation = 1 | 2 | 3 | 4 | 5;

export interface PaperContainerProps {
    children: ReactNode;
    elevation?: Elevation;
}

const PaperContainer: React.FC<PaperContainerProps> = ({ children, elevation = 1 }) => {
    const classes = ['paper', `paper-${elevation}`].join(' ');
    return <div className={classes}>{children}</div>;
};

export default PaperContainer;
