'use client';
import { createContext, Dispatch, ReactNode, SetStateAction, useContext, useState } from 'react';

interface PageContextType {
    pageTitle: string;
    setPageTitle: Dispatch<SetStateAction<string>>;
}

const PageContext = createContext<PageContextType | undefined>(undefined);

export const usePage = (): PageContextType => {
    const context = useContext(PageContext);
    if (context === undefined) {
        throw new Error('usePage must be used within a PageProvider');
    }
    return context;
};

export const PageProvider = ({ children }: { children: ReactNode }) => {
    const [pageTitle, setPageTitle] = useState<string>('');

    return <PageContext.Provider value={{ pageTitle, setPageTitle }}>{children}</PageContext.Provider>;
};
