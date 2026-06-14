import { useRouter } from 'next/router';
import { useEffect } from 'react';

export default function MacOsCheatSheetRedirect(): null {
    const router = useRouter();
    useEffect(() => {
        void router.replace('/mac-os-setup');
    }, [router]);
    return null;
}
