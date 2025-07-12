import { MAC_OS_BREW_APPS } from '@/common/macos-utils';
import AppTransferInner from '@/elements/transfer/AppTransferComponent';
import React from 'react';

const BrewInstallApplications: React.FC = () => {
    return (
        <div>
            <h2>5. Install Applications</h2>
            <p>
                Use &#34;brew install&#34; to add your favorite applications. Below you can chose apps from the table
                and generate installation scripts:
            </p>

            <AppTransferInner items={MAC_OS_BREW_APPS} osType="macos" />
        </div>
    );
};

export default BrewInstallApplications;
