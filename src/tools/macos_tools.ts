import {joinTerminalCommands} from "@/tools/common_tools";

export const BREW_WEB_SITE: string = "https://brew.sh/";
export const BREW_INSTALL_COMMAND: string = `/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"`;
export const BREW_VERSIONS_COMMAND: string = "brew tap homebrew/cask-versions";
export const BREW_INSTALL_FORMULAE: string = "brew install {}";
export const BREW_INSTALL_CASK: string = "brew install --cask {}";
export const BREW_CASK_LIST: string[] = [
    "google-chrome",
    "microsoft-edge",
    "opera",
    "firefox",
    "tor-browser",
    "tiles",
    "skype",
    "keka",
    "bitwarden",
    "android-file-transfer",
    "temurin17",
    "docker",
    "visual-studio-code",
    "atom",
    "sublime-text",
    "intellij-idea",
    "intellij-idea-ce",
    "webstorm",
    "clion",
    "goland",
    "pycharm",
    "pycharm-ce",
    "eclipse-ide",
    "springtoolsuite",
    "brackets",
    "dbeaver-community",
    "postman",
    "tad",
    "drawio",
    "microsoft-remote-desktop",
    "microsoft-teams",
    "spotify",
    "transmission",
    "spybuster",
    "steam",
    "origin",
];

export const BREW_FORMULAE_LIST: string[] = [
    "git",
    "node@18",
    "go",
    "python@3.11",
    "poetry",
    "vim",
    "wget",
];


export function buildTerminalAppsCommand(values: string[]): string {
    const commands: string[] = [];
    if (values && values.length > 0) {
        values.forEach(value => {
            commands.push(BREW_INSTALL_FORMULAE.replace("{}", value));
        });
    }
    const result = joinTerminalCommands(commands, true);
    console.log(result);
    return result;
}

export function buildDesktopAppsCommand(values: string[]): string {
    const commands: string[] = [];
    if (values && values.length > 0) {
        values.forEach(value => {
            commands.push(BREW_INSTALL_CASK.replace("{}", value));
        });
    }
    const result = joinTerminalCommands(commands, true);
    console.log(result);
    return result;
}

