'use client';
import { Color } from '@/controls/types';
import React, { ReactNode } from 'react';

interface AppMainContentContainerProps {
    children: ReactNode;
    colorStyle?: Color;
}

const AppMainContentContainer: React.FC<AppMainContentContainerProps> = ({ children, colorStyle = '' }) => {
    const classes = ['app-main-content-container', colorStyle && `color-${colorStyle}`].filter(Boolean).join(' ');
    return <div className={classes}>{children}</div>;
};

export default AppMainContentContainer;
