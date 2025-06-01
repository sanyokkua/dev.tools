import Layout from '@/components/Layout';
import { PageProvider } from '@/contexts/PageContext';
import '@/styles/global.css';
import { ThemeProvider } from 'next-themes';
import { AppProps } from 'next/app';

export default function App({ Component, pageProps }: AppProps) {
    return (
        <ThemeProvider attribute="class" disableTransitionOnChange>
            <PageProvider>
                <Layout>
                    <Component {...pageProps} />
                </Layout>
            </PageProvider>
        </ThemeProvider>
    );
}
