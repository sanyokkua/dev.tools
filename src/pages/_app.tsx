import Layout from '@/components/Layout';
import { PageProvider } from '@/contexts/PageContext';
import { ChakraProvider, defaultSystem } from '@chakra-ui/react';
import { ThemeProvider } from 'next-themes';
import { AppProps } from 'next/app';

export default function App({ Component, pageProps }: AppProps) {
    return (
        <ChakraProvider value={defaultSystem}>
            <ThemeProvider attribute="class" disableTransitionOnChange>
                <PageProvider>
                    <Layout>
                        <Component {...pageProps} />
                    </Layout>
                </PageProvider>
            </ThemeProvider>
        </ChakraProvider>
    );
}
