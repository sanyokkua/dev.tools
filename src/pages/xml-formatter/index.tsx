import { usePage } from '@/contexts/PageContext';
import ToolAbout from '@/controls/ToolAbout';
import React, { useEffect } from 'react';
import XmlFormatterPage from './XmlFormatterPage';

const IndexPage: React.FC = () => {
    const { setPageTitle } = usePage();
    useEffect(() => {
        setPageTitle('XML Formatter');
    }, [setPageTitle]);
    return (
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
            <ToolAbout routeKey="xml-formatter">
                Format, validate and inspect XML. Beautify with configurable indentation, minify, and validate structure
                with a live error indicator. The <strong>XPath Query</strong> mode accepts standard XPath 1.0
                expressions and displays all matching nodes and values. Parsing uses the browser's built-in XML engine —
                nothing leaves your machine.
            </ToolAbout>
            <XmlFormatterPage />
        </div>
    );
};

export default IndexPage;
