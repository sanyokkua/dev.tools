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
            <ToolAbout routeKey="json-formatter">
                Format, inspect and query JSON. Beautify with 2/4/Tab indentation, minify, sort keys recursively,
                validate with a live valid/invalid badge and error position, and escape/unescape JSON strings. The{' '}
                <strong>Query (JSONPath)</strong> mode evaluates expressions like <code>$.items[*].id</code> and shows
                the matched values. Parsing is done with the browser's native JSON engine — nothing leaves your machine.
            </ToolAbout>
            <JsonFormatterPage />
        </div>
    );
};

export default IndexPage;
