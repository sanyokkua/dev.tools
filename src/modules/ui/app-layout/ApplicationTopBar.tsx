import { usePage } from '@/contexts/PageContext';
import { useRouter } from 'next/router';
import React from 'react';
import Appbar from '../elements/navigation/appbar/Appbar';

const ApplicationTopBar: React.FC = () => {
    const { pageTitle } = usePage();
    const router = useRouter();

    const onAppTitleClick = () => {
        router.push('/').catch((err: unknown) => {
            console.error(err);
        });
    };

    return <Appbar appTitle={'Developer Utils'} pageTitle={pageTitle} onAppTitleClick={onAppTitleClick} />;
};

export default ApplicationTopBar;
