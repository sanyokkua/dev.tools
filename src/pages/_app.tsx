'use client';
import { FileOpenProvider } from '@/contexts/FileOpenContext';
import { FileSaveDialogProvider } from '@/contexts/FileSaveDialogContext';
import { PageProvider } from '@/contexts/PageContext';
import { ToasterProvider } from '@/contexts/ToasterContext';
import ApplicationLayout from '@/modules/ui/app-layout/ApplicationLayout';
import '@/styles/appbar.scss';
import '@/styles/buttons.scss';
import '@/styles/chip.scss';
import '@/styles/colors.scss';
import '@/styles/global.css';
import '@/styles/infopanel.scss';
import '@/styles/input.scss';
import '@/styles/layout.scss';
import '@/styles/menubar.scss';
import '@/styles/modal.scss';
import '@/styles/select.scss';
import '@/styles/sidebar.scss';
import '@/styles/surfaces.scss';
import '@/styles/toaster.scss';
import { AppProps } from 'next/app';

export default function App({ Component, pageProps }: AppProps) {
    return (
        <>
            <div id="modal-root"></div>
            <div id="toaster-root"></div>
            <PageProvider>
                <ToasterProvider>
                    <FileOpenProvider>
                        <FileSaveDialogProvider>
                            <ApplicationLayout>
                                <Component {...pageProps} />
                            </ApplicationLayout>
                        </FileSaveDialogProvider>
                    </FileOpenProvider>
                </ToasterProvider>
            </PageProvider>
        </>
    );
}
