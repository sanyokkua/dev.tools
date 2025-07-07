'use client';
import { forwardRef, ReactNode, Ref } from 'react';

export interface TextContainerProps {
    children: ReactNode;
}

const TextContainer = forwardRef<HTMLDivElement, TextContainerProps>(({ children }, ref: Ref<HTMLDivElement>) => {
    return (
        <div className="text-container" ref={ref}>
            {children}
        </div>
    );
});
TextContainer.displayName = 'TextContainer';

export default TextContainer;
