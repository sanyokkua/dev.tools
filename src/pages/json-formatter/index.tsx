import { usePage } from '@/contexts/PageContext';
import ToolAbout from '@/controls/ToolAbout';
import React, { useEffect } from 'react';
import JsonFormatterPage from './JsonFormatterPage';

const IndexPage: React.FC = () => {
    const { setPageTitle } = usePage();
    useEffect(() => {
        setPageTitle('JSON Formatter');
    }, [setPageTitle]);
    return (
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
            <ToolAbout routeKey="json-formatter" title="JSON Formatter">
                Format, validate, and explore JSON data. Beautify, minify, sort keys, or run JSONPath queries to extract
                values.
            </ToolAbout>
            <JsonFormatterPage />
        </div>
    );
};

export default IndexPage;
