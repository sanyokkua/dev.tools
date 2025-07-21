'use client';
import NextDocument, { DocumentContext, Head, Html, Main, NextScript } from 'next/document';
import Link from 'next/link';

export default class Document extends NextDocument {
    static getInitialProps(ctx: DocumentContext) {
        return NextDocument.getInitialProps(ctx);
    }

    render() {
        return (
            <Html suppressHydrationWarning>
                <Head>
                    <Link rel="icon" href="/favicon.ico?" />
                    <Link rel="icon" type="image/png" href="/favicon-16x16.png?" />
                    <Link rel="icon" type="image/png" href="/favicon-32x32.png?" />
                    <Link rel="apple-touch-icon" href="/apple-touch-icon.png?" />
                    <Link rel="android-chrome" href="/android-chrome-192x192.png?" />
                    <Link rel="android-chrome" href="/android-chrome-512x512.png?" />
                    <Link rel="manifest" href="/site.webmanifest" />
                </Head>
                <body>
                    <Main />
                    <NextScript />
                </body>
            </Html>
        );
    }
}
