'use client';
import { usePage } from '@/contexts/PageContext';
import { useEffect } from 'react';
import AppMainContainer from '../components/layouts/AppMainContainer';

const Home = () => {
    const { setPageTitle } = usePage();
    useEffect(() => {
        setPageTitle('Main Page');
    }, [setPageTitle]);

    return (
        <AppMainContainer>
            <section>
                <header>
                    <h1>Client-Side Text Editing and Transformation Suite</h1>
                    <p>
                        A browser-based toolkit for text manipulation, code editing, and using guides to setup your
                        environment.
                    </p>
                    <p>
                        All operations run locally in the browser — no data is transmitted to servers. Built with the
                        Monaco Editor (VS Code&#39;s engine) and deployed via GitHub Pages, this Next.js application
                        ensures secure, offline-ready workflows for developers and technical users.
                    </p>
                    <p>
                        Source code is available on{' '}
                        <a target="_blank" href="https://github.com/sanyokkua/dev.tools">
                            dev.tools
                        </a>
                    </p>
                </header>

                <section>
                    <h2>Core Capabilities</h2>
                    <ul>
                        <li>
                            <strong>String &amp; Case Conversion</strong>: Transform text with slugify, camelCase,
                            snake_case, PascalCase, and over 20+ text transformations.
                        </li>
                        <li>
                            <strong>Code Editor</strong>: Edit files with syntax highlighting, manual syntax selection,
                            and Monaco&#39;s built-in commands (press <code>F1</code> for commands).
                        </li>
                        <li>
                            <strong>JSON Formatter</strong>: Minify or beautify JSON with 4-space indentation.
                        </li>
                        <li>
                            <strong>Hashing &amp; Encoding</strong>: Generate MD5, SHA256, SHA512 hashes or
                            encode/decode Base64 and URL-safe strings.
                        </li>
                        <li>
                            <strong>Markdown Editor</strong>: Write, preview, and export markdown to PDF.
                        </li>
                        <li>
                            <strong>Terminal Tools</strong>: Edit Bash, PowerShell, or Shell scripts with syntax
                            highlighting.
                        </li>
                        <li>
                            <strong>Git Setup Assistant</strong>: Interactive guides for Git configuration (SSH, GPG)
                            and command generation.
                        </li>
                        <li>
                            <strong>MacOS Setup Assistant via brew</strong>: Interactive guides for MacOS configuration
                            (install brew and popular dev apps via brew) and command generation.
                        </li>
                        <li>
                            <strong>Prompts Collection</strong>: Access a variety of pre-built prompts organized by task
                            categories and available in multiple formats.
                        </li>
                    </ul>
                    <p>
                        Additional functionality will be added later to assist with setting up your development
                        environment, including prompt collections and other tools.
                    </p>
                </section>

                <section>
                    <h2>Why Use It?</h2>
                    <ul>
                        <li>
                            <strong>Privacy First</strong>: No data leaves your browser.
                        </li>
                        <li>
                            <strong>No Installation</strong>: Works instantly in any modern browser.
                        </li>
                    </ul>
                </section>

                <footer>
                    <h2>Open Source &amp; Transparent</h2>
                    <p>The source code is publicly available on GitHub.</p>
                </footer>
            </section>
        </AppMainContainer>
    );
};

export default Home;
