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
            <ToolAbout routeKey="xml-formatter" title="XML Formatter">
                Format, validate, and explore XML data. Beautify, minify, or run XPath queries to extract nodes and
                values.
            </ToolAbout>
            <XmlFormatterPage />
        </div>
    );
};

export default IndexPage;
