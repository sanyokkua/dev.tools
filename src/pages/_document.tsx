import NextDocument, { DocumentContext, DocumentInitialProps, Head, Html, Main, NextScript } from 'next/document';
import React from 'react';

export default class Document extends NextDocument {
    static getInitialProps(ctx: DocumentContext): Promise<DocumentInitialProps> {
        return NextDocument.getInitialProps(ctx);
    }

    render(): React.JSX.Element {
        const bp = process.env.NEXT_PUBLIC_BASE_PATH ?? '';
        return (
            <Html lang="en" data-theme="light" suppressHydrationWarning>
                <Head>
                    <link rel="icon" href={`${bp}/favicon.ico`} />
                    <link rel="icon" type="image/png" href={`${bp}/favicon-16x16.png`} />
                    <link rel="icon" type="image/png" href={`${bp}/favicon-32x32.png`} />
                    <link rel="apple-touch-icon" href={`${bp}/apple-touch-icon.png`} />
                    <link rel="icon" type="image/png" sizes="192x192" href={`${bp}/android-chrome-192x192.png`} />
                    <link rel="icon" type="image/png" sizes="512x512" href={`${bp}/android-chrome-512x512.png`} />
                    <link rel="manifest" href={`${bp}/site.webmanifest`} />
                    <meta name="application-name" content="dev.tools" />
                    <meta name="apple-mobile-web-app-capable" content="yes" />
                    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
                    <meta name="apple-mobile-web-app-title" content="dev.tools" />
                    <meta name="format-detection" content="telephone=no" />
                    <meta name="mobile-web-app-capable" content="yes" />
                    <meta name="theme-color" content="#1c1c1e" />
                </Head>

                <body>
                    <Main />
                    <NextScript />
                </body>
            </Html>
        );
    }
}
