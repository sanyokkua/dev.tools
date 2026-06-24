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
            <ToolAbout routeKey="diff">
                Compare two text blocks side-by-side with <strong>Text, JSON,</strong> or <strong>XML</strong> mode. In
                JSON mode, both inputs are parsed and pretty-printed with keys sorted before diffing — so semantic
                changes show but whitespace or key-order differences don't. XML mode normalises inputs similarly.
                Differences are highlighted inline; added, removed, and unchanged lines are colour-coded. Everything
                runs locally.
            </ToolAbout>
            <DiffPage />
        </ContentContainerFlex>
    );
};

export default IndexPage;
