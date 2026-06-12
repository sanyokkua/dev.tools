import { FileOpenProvider } from '@/contexts/FileOpenContext';
import { FileSaveDialogProvider } from '@/contexts/FileSaveDialogContext';
import { PageProvider } from '@/contexts/PageContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { ToasterProvider } from '@/contexts/ToasterContext';
import '@/styles/appbar.scss';
import '@/styles/buttons.scss';
import '@/styles/checkbox.scss';
import '@/styles/chip.scss';
import '@/styles/code-editor.scss';
import '@/styles/colors.scss';
import '@/styles/git-cheat-sheet.scss';
import '@/styles/global.css';
import '@/styles/infopanel.scss';
import '@/styles/input.scss';
import '@/styles/installer.scss';
import '@/styles/layout.scss';
import '@/styles/linux-setup.scss';
import '@/styles/mac-os-setup.scss';
import '@/styles/markdown-tools.scss';
import '@/styles/menubar.scss';
import '@/styles/modal.scss';
import '@/styles/segmented-control.scss';
import '@/styles/select.scss';
import '@/styles/sidebar.scss';
import '@/styles/surfaces.scss';
import '@/styles/switch.scss';
import '@/styles/table.scss';
import '@/styles/terminal-utils.scss';
import '@/styles/texteditor.scss';
import '@/styles/toaster.scss';
import '@/styles/vram-calculator.scss';
import '@/styles/windows-setup.scss';
import { AppProps } from 'next/app';
import React from 'react';
import ApplicationLayout from '../components/app-layout/ApplicationLayout';

export default function App({ Component, pageProps }: AppProps): React.JSX.Element {
    return (
        <>
            <div id="modal-root"></div>
            <div id="toaster-root"></div>
            <ThemeProvider>
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
            </ThemeProvider>
        </>
    );
}
