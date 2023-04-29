export const BREW_WEB_SITE: string = "https://brew.sh/";
export const BREW_INSTALL_COMMAND: string = `/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"`;
export const BREW_VERSIONS_COMMAND: string = "brew tap homebrew/cask-versions";
export const BREW_INSTALL_FORMULAE: string = "brew install {}";
export const BREW_INSTALL_CASK: string = "brew install --cask {}";
export const BREW_CASK_LIST: string[] = [
    "android-file-transfer",
    "google-chrome",
    "postman",
    "temurin17",
    "bitwarden",
    "intellij-idea",
    "skype",
    "tiles",
    "dbeaver-community",
    "keka",
    "spotify",
    "transmission",
    "docker",
    "microsoft-edge",
    "spybuster",
    "visual-studio-code",
    "drawio",
    "opera",
    "steam",
    "firefox",
    "origin",
    "tad",
];

export const BREW_FORMULAE_LIST: string[] = [
    "git",
    "node@18",
    "go",
    "poetry",
    "python@3.11",
];

