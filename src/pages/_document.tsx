import NextDocument, { DocumentContext, Head, Html, Main, NextScript } from 'next/document';
import { ToasterContainer } from '../custom-components/controls/toaster/ToasterContainer';

export default class Document extends NextDocument {
    static getInitialProps(ctx: DocumentContext) {
        return NextDocument.getInitialProps(ctx);
    }

    render() {
        return (
            <Html suppressHydrationWarning>
                <Head />
                <body>
                    <Main />
                    <NextScript />
                    <ToasterContainer />
                </body>
            </Html>
        );
    }
}
