import { usePage } from '@/contexts/PageContext';
import GuideChooser from '@/elements/GuideChooser';
import BrewInstallApplications from '@/page-specific/mac-os-cheat-sheet/BrewInstallApplications';
import BrewInstallSteps from '@/page-specific/mac-os-cheat-sheet/BrewInstallSteps';
import VramScriptSection from '@/page-specific/mac-os-cheat-sheet/VramScriptSection';
import React, { useEffect, useState } from 'react';
import ContentContainerFlex from '../../components/layouts/ContentContainerFlex';

const IndexPage = (): React.JSX.Element => {
    const { setPageTitle } = usePage();
    const [chosenSection, setChosenSection] = useState<string>('');

    useEffect(() => {
        setPageTitle('MacOS Cheat Sheet');
    }, [setPageTitle]);

    const options = [
        { label: 'Homebrew Installation', value: 'homebrew' },
        { label: 'Apple Silicon VRAM Manager', value: 'vram' },
        { label: 'Install Applications', value: 'apps' },
    ];

    return (
        <ContentContainerFlex>
            <section>
                <h1>MacOS Cheat Sheet</h1>
                <p>Choose a section:</p>
                <GuideChooser options={options} selectedValue={chosenSection} onChange={setChosenSection} />
                <br />
                {chosenSection === 'homebrew' && <BrewInstallSteps />}
                {chosenSection === 'vram' && <VramScriptSection />}
                {chosenSection === 'apps' && <BrewInstallApplications />}
            </section>
        </ContentContainerFlex>
    );
};

export default IndexPage;
