import Layout from '../controllers/Layout';
import { PageProvider } from '@/contexts/PageContext';
import '@/styles/colors.scss';
import '@/styles/buttons.scss';
import '@/styles/input.scss';
import '@/styles/global.css';
import '@/styles/layout.scss';
import '@/styles/appbar.scss';
import '@/styles/sidebar.scss';
import '@/styles/menubar.scss';
import '@/styles/chip.scss';
import '@/styles/infopanel.scss';
import '@/styles/select.scss';
import '@/styles/toaster.scss';
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
