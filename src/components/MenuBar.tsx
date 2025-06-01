import { usePage } from '@/contexts/PageContext';
import Link from 'next/link';
import React from 'react';

const MenuBar: React.FC = () => {
    const { pageTitle } = usePage();

    return (
        <nav className="menuBarConfig menuBarStyle">
            {/* Left Column: App Name */}
            <Link role={'p'} href="/" className="menuBarTitle">
                Developer Utils
            </Link>

            {/* Center Column: Current Page Title */}
            <div style={{ textAlign: 'center', flex: 1 }}>
                <h2 style={{ margin: 0 }}>{pageTitle}</h2>
            </div>

            {/* Right Column: Empty element for spacing */}
            <div style={{ width: '100px' }} />
        </nav>
    );
};

export default MenuBar;
