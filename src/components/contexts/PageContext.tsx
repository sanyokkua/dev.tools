'use client';
import { createContext, Dispatch, ReactNode, SetStateAction, useContext, useState } from 'react';

/**
 * Provides context for page-level components, including title management
 * @param pageTitle - The current title of the page
 * @returns An object containing methods to manipulate the page's title state
 */
interface PageContextType {
    pageTitle: string;
    setPageTitle: Dispatch<SetStateAction<string>>;
}

/**
 * Provides context for managing page-level state and configuration across the component tree.
 */
const PageContext = createContext<PageContextType | undefined>(undefined);

/**
 * Retrieves the current page context from the component hierarchy.
 * @returns The active page context object
 */
export const usePage = (): PageContextType => {
    const context = useContext(PageContext);
    if (context === undefined) {
        throw new Error('usePage must be used within a PageProvider');
    }
    return context;
};

/**
 * Provider component for managing page title context across the application.
 */
export const PageProvider = ({ children }: { children: ReactNode }) => {
    const [pageTitle, setPageTitle] = useState<string>('');

    return <PageContext.Provider value={{ pageTitle, setPageTitle }}>{children}</PageContext.Provider>;
};
