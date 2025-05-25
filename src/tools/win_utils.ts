import { buildCommand } from '@/tools/common_tools';

export const WIN_GET_URL: string = 'https://github.com/microsoft/winget-cli';
export const WIN_GET_WEB_RESOURCES = ['https://winstall.app/', 'https://winget.run/'];
export const WIN_GET_INSTALL_TEMPLATE: string = 'winget install --id={} -e';
export const WIN_GET_APPS_LIST: string[] = [
    '7zip.7zip',
    'Adobe.Brackets',
    'AntonyCourtney.Tad',
    'Docker.DockerDesktop',
    'EclipseAdoptium.Temurin.17.JDK',
    'ElectronicArts.EADesktop',
    'Git.Git',
    'GoLang.Go.1.19',
    'Google.Chrome',
    'JGraph.Draw',
    'JetBrains.CLion',
    'JetBrains.GoLand',
    'JetBrains.IntelliJIDEA.Community',
    'JetBrains.IntelliJIDEA.Ultimate',
    'JetBrains.PyCharm.Community',
    'JetBrains.PyCharm.Professional',
    'JetBrains.WebStorm',
    'Microsoft.Edge',
    'Microsoft.RemoteDesktopClient',
    'Microsoft.Skype',
    'Microsoft.Teams',
    'Microsoft.VisualStudioCode',
    'Mozilla.Firefox',
    'OpenJS.NodeJS.LTS',
    'Opera.Opera',
    'Postman.Postman',
    'Python.Python.3.11',
    'Spotify.Spotify',
    'SublimeHQ.SublimeText.3',
    'SublimeHQ.SublimeText.4',
    'TorProject.TorBrowser',
    'Transmission.Transmission',
    'Valve.Steam',
    'dbeaver.dbeaver',
];

export function buildWindowsAppInstallCommand(values: string[]): string {
    return buildCommand(values, WIN_GET_INSTALL_TEMPLATE);
}
