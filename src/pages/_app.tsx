import { PageProvider } from '@/contexts/PageContext';
import ApplicationLayout from '@/modules/ui/app-layout/ApplicationLayout';
import '@/styles/global.css';
import '@/styles/colors.scss';
import '@/styles/appbar.scss';
import '@/styles/buttons.scss';
import '@/styles/chip.scss';
import '@/styles/infopanel.scss';
import '@/styles/input.scss';
import '@/styles/layout.scss';
import '@/styles/menubar.scss';
import '@/styles/select.scss';
import '@/styles/sidebar.scss';
import '@/styles/toaster.scss';
import { AppProps } from 'next/app';

export default function App({ Component, pageProps }: AppProps) {
    return (
        <PageProvider>
            <ApplicationLayout>
                <Component {...pageProps} />
            </ApplicationLayout>
        </PageProvider>
    );
}
