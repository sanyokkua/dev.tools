import { usePage } from '@/contexts/PageContext';
import ToolAbout from '@/controls/ToolAbout';
import React, { useEffect } from 'react';
import ContentContainerFlex from '../../components/layouts/ContentContainerFlex';
import DiffPage from './DiffPage';

const IndexPage: React.FC = () => {
    const { setPageTitle } = usePage();
    useEffect(() => {
        setPageTitle('Diff');
    }, [setPageTitle]);
    return (
        <ContentContainerFlex>
            <ToolAbout routeKey="diff" title="Diff">
                Compare two text blocks side-by-side. Select Text, JSON, or XML — JSON and XML inputs are automatically
                normalized (pretty-printed, keys sorted) for a semantic comparison that ignores irrelevant formatting
                differences.
            </ToolAbout>
            <DiffPage />
        </ContentContainerFlex>
    );
};

export default IndexPage;
