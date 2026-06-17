'use client';
import { createContext, Dispatch, ReactNode, SetStateAction, useContext, useState } from 'react';

/**
 * Provides context for page-level components, including title management
 * @param pageTitle - The current title of the page
 * @param helpVisible - Whether the tool-about panel is currently open
 * @param hasToolAbout - Whether the current page has a ToolAbout panel mounted
 * @returns An object containing methods to manipulate the page's state
 */
interface PageContextType {
    pageTitle: string;
    setPageTitle: Dispatch<SetStateAction<string>>;
    helpVisible: boolean;
    setHelpVisible: Dispatch<SetStateAction<boolean>>;
    hasToolAbout: boolean;
    setHasToolAbout: Dispatch<SetStateAction<boolean>>;
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
 * Provider component for managing page title and help-panel context across the application.
 */
export const PageProvider = ({ children }: { children: ReactNode }): React.ReactElement => {
    const [pageTitle, setPageTitle] = useState<string>('');
    const [helpVisible, setHelpVisible] = useState<boolean>(false);
    const [hasToolAbout, setHasToolAbout] = useState<boolean>(false);

    return (
        <PageContext.Provider
            value={{ pageTitle, setPageTitle, helpVisible, setHelpVisible, hasToolAbout, setHasToolAbout }}
        >
            {children}
        </PageContext.Provider>
    );
};
