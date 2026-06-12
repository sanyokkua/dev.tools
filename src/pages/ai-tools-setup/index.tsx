import { useRouter } from 'next/router';
import { useEffect } from 'react';

const AiToolsSetupRedirect = (): null => {
    const router = useRouter();
    useEffect(() => {
        void router.replace('/software-installer');
    }, [router]);
    return null;
};

export default AiToolsSetupRedirect;
