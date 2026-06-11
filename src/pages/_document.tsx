import NextDocument, { DocumentContext, DocumentInitialProps, Head, Html, Main, NextScript } from 'next/document';
import React from 'react';

export default class Document extends NextDocument {
    static getInitialProps(ctx: DocumentContext): Promise<DocumentInitialProps> {
        return NextDocument.getInitialProps(ctx);
    }

    render(): React.JSX.Element {
        return (
            <Html suppressHydrationWarning>
                <Head>
                    <link rel="icon" href="/favicon.ico" />
                    <link rel="icon" type="image/png" href="/favicon-16x16.png" />
                    <link rel="icon" type="image/png" href="/favicon-32x32.png" />
                    <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
                    <link rel="icon" type="image/png" sizes="192x192" href="/android-chrome-192x192.png" />
                    <link rel="icon" type="image/png" sizes="512x512" href="/android-chrome-512x512.png" />
                    <link rel="manifest" href="/site.webmanifest" />
                </Head>

                <body>
                    <Main />
                    <NextScript />
                </body>
            </Html>
        );
    }
}
