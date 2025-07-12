import { Application, BrewType, Category, Command } from '@/common/types';

/**
 * List of applications available for installation via Homebrew on macOS.
 * Each application is represented as an object containing its unique identifier, name,
 * description, type of installation (CASK or BOTTLE), and category classification.
 * This list serves as a reference for managing and installing software packages on macOS systems.
 */
export const MAC_OS_BREW_APPS: Application[] = [
    {
        id: 'android-file-transfer',
        name: 'Android File Transfer',
        description: 'File transfer tool for Android devices',
        brewType: BrewType.CASK,
        category: Category.SYSTEM_UTILS,
    },
    {
        id: 'openmtp',
        name: 'OpenMTP',
        description: 'Android file transfer',
        brewType: BrewType.CASK,
        category: Category.SYSTEM_UTILS,
    },
    {
        id: 'appcleaner',
        name: 'AppCleaner',
        description: 'Application uninstaller tool',
        brewType: BrewType.CASK,
        category: Category.SYSTEM_UTILS,
    },
    {
        id: 'corretto',
        name: 'Amazon Corretto',
        description: 'OpenJDK (Latest) distribution from Amazon',
        brewType: BrewType.CASK,
        category: Category.RUNTIME_ENVIRONMENTS,
    },
    {
        id: 'corretto@11',
        name: 'Amazon Corretto 11',
        description: 'OpenJDK 11 distribution from Amazon',
        brewType: BrewType.CASK,
        category: Category.RUNTIME_ENVIRONMENTS,
    },
    {
        id: 'corretto@17',
        name: 'Amazon Corretto 17',
        description: 'OpenJDK 17 distribution from Amazon',
        brewType: BrewType.CASK,
        category: Category.RUNTIME_ENVIRONMENTS,
    },
    {
        id: 'corretto@21',
        name: 'Amazon Corretto 21',
        description: 'OpenJDK 21 distribution from Amazon',
        brewType: BrewType.CASK,
        category: Category.RUNTIME_ENVIRONMENTS,
    },
    {
        id: 'corretto@8',
        name: 'Amazon Corretto 8',
        description: 'OpenJDK 8 distribution from Amazon',
        brewType: BrewType.CASK,
        category: Category.RUNTIME_ENVIRONMENTS,
    },
    {
        id: 'dbeaver-community',
        name: 'DBeaver Community',
        description: 'Open-source database management tool',
        brewType: BrewType.CASK,
        category: Category.DATABASE_CLIENTS,
    },
    {
        id: 'docker-desktop',
        name: 'Docker Desktop',
        description: 'Container management platform',
        brewType: BrewType.CASK,
        category: Category.VIRTUALIZATION,
    },
    {
        id: 'drawio',
        name: 'Draw.io',
        description: 'Diagramming and flowchart tool',
        brewType: BrewType.CASK,
        category: Category.DIAGRAM_TOOLS,
    },
    {
        id: 'firefox',
        name: 'Firefox',
        description: 'Web browser by Mozilla',
        brewType: BrewType.CASK,
        category: Category.BROWSERS,
    },
    {
        id: 'google-chrome',
        name: 'Google Chrome',
        description: 'Web browser by Google',
        brewType: BrewType.CASK,
        category: Category.BROWSERS,
    },
    {
        id: 'iina',
        name: 'IINA',
        description: 'Modern video player for macOS',
        brewType: BrewType.CASK,
        category: Category.MEDIA_PLAYERS,
    },
    {
        id: 'intellij-idea',
        name: 'IntelliJ IDEA',
        description: 'Java IDE with advanced features',
        brewType: BrewType.CASK,
        category: Category.CODE_EDITORS,
    },
    {
        id: 'keka',
        name: 'Keka',
        description: 'File archiving utility',
        brewType: BrewType.CASK,
        category: Category.SYSTEM_UTILS,
    },
    {
        id: 'lm-studio',
        name: 'LM Studio',
        description: 'Local LLM platform',
        brewType: BrewType.CASK,
        category: Category.LLM_PLATFORMS,
    },
    {
        id: 'microsoft-edge',
        name: 'Microsoft Edge',
        description: 'Web browser by Microsoft',
        brewType: BrewType.CASK,
        category: Category.BROWSERS,
    },
    {
        id: 'microsoft-teams',
        name: 'Microsoft Teams',
        description: 'Collaboration and communication platform',
        brewType: BrewType.CASK,
        category: Category.COMMUNICATION,
    },
    {
        id: 'ollama-app',
        name: 'Ollama',
        description: 'Local LLM application',
        brewType: BrewType.CASK,
        category: Category.LLM_PLATFORMS,
    },
    {
        id: 'opera',
        name: 'Opera',
        description: 'Web browser with built-in ad blocker',
        brewType: BrewType.CASK,
        category: Category.BROWSERS,
    },
    {
        id: 'postman',
        name: 'Postman',
        description: 'API development and testing tool',
        brewType: BrewType.CASK,
        category: Category.API_TOOLS,
    },
    {
        id: 'signal',
        name: 'Signal',
        description: 'Secure messaging application',
        brewType: BrewType.CASK,
        category: Category.COMMUNICATION,
    },
    {
        id: 'spotify',
        name: 'Spotify',
        description: 'Music streaming service',
        brewType: BrewType.CASK,
        category: Category.MEDIA_PLAYERS,
    },
    {
        id: 'tad',
        name: 'Tad',
        description: 'Tabular data viewer',
        brewType: BrewType.CASK,
        category: Category.DIAGRAM_TOOLS,
    },
    {
        id: 'telegram',
        name: 'Telegram',
        description: 'Cloud-based messaging app',
        brewType: BrewType.CASK,
        category: Category.COMMUNICATION,
    },
    {
        id: 'tor-browser',
        name: 'Tor Browser',
        description: 'Privacy-focused web browser',
        brewType: BrewType.CASK,
        category: Category.BROWSERS,
    },
    {
        id: 'transmission',
        name: 'Transmission',
        description: 'BitTorrent client',
        brewType: BrewType.CASK,
        category: Category.DOWNLOAD_MANAGERS,
    },
    {
        id: 'visual-studio-code',
        name: 'Visual Studio Code',
        description: 'Open-source code editor',
        brewType: BrewType.CASK,
        category: Category.CODE_EDITORS,
    },
    {
        id: 'sublime-text',
        name: 'Sublime Text',
        description: 'Sophisticated text editor',
        brewType: BrewType.CASK,
        category: Category.CODE_EDITORS,
    },
    {
        id: 'vscodium',
        name: 'VSCodium',
        description: 'Open-source binary distribution of VS Code',
        brewType: BrewType.CASK,
        category: Category.CODE_EDITORS,
    },
    {
        id: 'cursor',
        name: 'Cursor',
        description: 'AI-powered code editor',
        brewType: BrewType.CASK,
        category: Category.CODE_EDITORS,
    },
    {
        id: 'windsurf',
        name: 'Windsurf Editor',
        description: 'Windsurf Editor is the AI agent-powered IDE',
        brewType: BrewType.CASK,
        category: Category.CODE_EDITORS,
    },
    {
        id: 'pycharm-ce',
        name: 'PyCharm Community',
        description: 'Python IDE (Community Edition)',
        brewType: BrewType.CASK,
        category: Category.CODE_EDITORS,
    },
    {
        id: 'pycharm',
        name: 'PyCharm',
        description: 'Python IDE (Professional Edition)',
        brewType: BrewType.CASK,
        category: Category.CODE_EDITORS,
    },
    {
        id: 'intellij-idea-ce',
        name: 'IntelliJ IDEA Community',
        description: 'Java IDE (Community Edition)',
        brewType: BrewType.CASK,
        category: Category.CODE_EDITORS,
    },
    {
        id: 'phpstorm',
        name: 'PhpStorm',
        description: 'PHP IDE',
        brewType: BrewType.CASK,
        category: Category.CODE_EDITORS,
    },
    {
        id: 'goland',
        name: 'GoLand',
        description: 'Go (Lang) IDE',
        brewType: BrewType.CASK,
        category: Category.CODE_EDITORS,
    },
    { id: 'rider', name: 'Rider', description: '.NET IDE', brewType: BrewType.CASK, category: Category.CODE_EDITORS },
    { id: 'clion', name: 'CLion', description: 'C/C++ IDE', brewType: BrewType.CASK, category: Category.CODE_EDITORS },
    {
        id: 'rustrover',
        name: 'RustRover',
        description: 'Rust IDE',
        brewType: BrewType.CASK,
        category: Category.CODE_EDITORS,
    },
    {
        id: 'rubymine',
        name: 'RubyMine',
        description: 'Ruby IDE',
        brewType: BrewType.CASK,
        category: Category.CODE_EDITORS,
    },
    {
        id: 'datagrip',
        name: 'DataGrip',
        description: 'Database IDE',
        brewType: BrewType.CASK,
        category: Category.DATABASE_CLIENTS,
    },
    {
        id: 'vlc',
        name: 'VLC Media Player',
        description: 'Open-source multimedia player',
        brewType: BrewType.CASK,
        category: Category.MEDIA_PLAYERS,
    },
    {
        id: 'codeedit',
        name: 'CodeEdit',
        description: 'Open-source code editor',
        brewType: BrewType.CASK,
        category: Category.CODE_EDITORS,
    },
    {
        id: 'eclipse-ide',
        name: 'Eclipse IDE',
        description: 'Open-source IDE for Java and other languages',
        brewType: BrewType.CASK,
        category: Category.CODE_EDITORS,
    },
    {
        id: 'springtoolsforeclipse',
        name: 'Spring Tools for Eclipse',
        description: 'Eclipse plugin for Spring Boot development',
        brewType: BrewType.CASK,
        category: Category.IDE_EXTENSIONS,
    },
    {
        id: 'netbeans',
        name: 'NetBeans',
        description: 'Java IDE',
        brewType: BrewType.CASK,
        category: Category.CODE_EDITORS,
    },
    {
        id: 'google-drive',
        name: 'Google Drive',
        description: 'Client for the Google Drive storage service',
        brewType: BrewType.CASK,
        category: Category.CLOUD_STORAGE,
    },
    {
        id: 'dropbox',
        name: 'Dropbox',
        description: 'Client for the Dropbox cloud storage service',
        brewType: BrewType.CASK,
        category: Category.CLOUD_STORAGE,
    },
    {
        id: 'thunderbird',
        name: 'Thunderbird',
        description: 'Email client',
        brewType: BrewType.CASK,
        category: Category.COMMUNICATION,
    },
    {
        id: 'libreoffice',
        name: 'LibreOffice',
        description: 'Office suite',
        brewType: BrewType.CASK,
        category: Category.DOCUMENT_EDITORS,
    },
    {
        id: 'openoffice',
        name: 'OpenOffice',
        description: 'Office suite',
        brewType: BrewType.CASK,
        category: Category.DOCUMENT_EDITORS,
    },
    {
        id: 'softmaker-freeoffice',
        name: 'SoftMaker FreeOffice',
        description: 'Office suite',
        brewType: BrewType.CASK,
        category: Category.DOCUMENT_EDITORS,
    },
    {
        id: 'brave-browser',
        name: 'Brave Browser',
        description: 'Web browser with built-in ad blocker',
        brewType: BrewType.CASK,
        category: Category.BROWSERS,
    },
    {
        id: 'blender',
        name: 'Blender',
        description: '3D creation suite',
        brewType: BrewType.CASK,
        category: Category.GRAPHICS_AND_3D,
    },
    {
        id: 'android-studio',
        name: 'Android Studio',
        description: 'Android IDE',
        brewType: BrewType.CASK,
        category: Category.CODE_EDITORS,
    },
    {
        id: 'docker',
        name: 'Docker',
        description: 'Containerization platform',
        brewType: BrewType.COMMAND,
        category: Category.VIRTUALIZATION,
    },
    {
        id: 'docker-compose',
        name: 'Docker Compose',
        description: 'Multi-container Docker orchestration',
        brewType: BrewType.COMMAND,
        category: Category.VIRTUALIZATION,
    },
    {
        id: 'neovim',
        name: 'Neovim',
        description: 'Text editor',
        brewType: BrewType.COMMAND,
        category: Category.DEV_UTILITIES,
    },
    {
        id: 'podman',
        name: 'Podman',
        description: 'Container runtime',
        brewType: BrewType.COMMAND,
        category: Category.VIRTUALIZATION,
    },
    {
        id: 'podman-compose',
        name: 'Podman Compose',
        description: 'Multi-container Podman orchestration',
        brewType: BrewType.COMMAND,
        category: Category.VIRTUALIZATION,
    },
    {
        id: 'node@22',
        name: 'Node.js 22',
        description: 'Node.js runtime version 22',
        brewType: BrewType.COMMAND,
        category: Category.RUNTIME_ENVIRONMENTS,
    },
    {
        id: 'go',
        name: 'Go',
        description: 'Go programming language',
        brewType: BrewType.COMMAND,
        category: Category.RUNTIME_ENVIRONMENTS,
    },
    {
        id: 'git',
        name: 'Git',
        description: 'Distributed version control system',
        brewType: BrewType.COMMAND,
        category: Category.DEV_UTILITIES,
    },
    {
        id: 'vim',
        name: 'Vim',
        description: 'Text editor',
        brewType: BrewType.COMMAND,
        category: Category.DEV_UTILITIES,
    },
    {
        id: 'wget',
        name: 'Wget',
        description: 'Network data retrieval tool',
        brewType: BrewType.COMMAND,
        category: Category.DOWNLOAD_MANAGERS,
    },
    {
        id: 'exiftool',
        name: 'ExifTool',
        description: 'Read/write metadata in files',
        brewType: BrewType.COMMAND,
        category: Category.SYSTEM_UTILS,
    },
    {
        id: 'jenv',
        name: 'JEnv',
        description: 'Manage Java environments',
        brewType: BrewType.COMMAND,
        category: Category.DEV_UTILITIES,
    },
    {
        id: 'node',
        name: 'Node.js',
        description: 'Node.js runtime',
        brewType: BrewType.COMMAND,
        category: Category.RUNTIME_ENVIRONMENTS,
    },
    {
        id: 'node@14',
        name: 'Node.js 14',
        description: 'Node.js version 14',
        brewType: BrewType.COMMAND,
        category: Category.RUNTIME_ENVIRONMENTS,
    },
    {
        id: 'node@18',
        name: 'Node.js 18',
        description: 'Node.js version 18',
        brewType: BrewType.COMMAND,
        category: Category.RUNTIME_ENVIRONMENTS,
    },
    {
        id: 'node@20',
        name: 'Node.js 20',
        description: 'Node.js version 20',
        brewType: BrewType.COMMAND,
        category: Category.RUNTIME_ENVIRONMENTS,
    },
    {
        id: 'python@3.13',
        name: 'Python 3.13',
        description: 'Python programming language version 3.13',
        brewType: BrewType.COMMAND,
        category: Category.RUNTIME_ENVIRONMENTS,
    },
    {
        id: 'maven',
        name: 'Maven',
        description: 'Project management and comprehension tool',
        brewType: BrewType.COMMAND,
        category: Category.BUILD_TOOLING,
    },
    {
        id: 'pinentry-mac',
        name: 'Pinentry',
        description: 'Password entry utility for GPG on Mac',
        brewType: BrewType.COMMAND,
        category: Category.SYSTEM_UTILS,
    },
];

/**
 * Maps an application to a corresponding command for installation.
 *
 * This function determines whether the given application is of type `BrewType.COMMAND`
 * or `BrewType.CASK` and constructs the appropriate Homebrew install command.
 *
 * @param app - The application object containing details about the application to be installed.
 * @returns An object representing the command with a description and the actual installation command string.
 */
export function mapApplicationToCommand(app: Application): Command {
    const brewCommandInstall: string = 'brew install';
    const brewCaskInstall: string = 'brew install --cask';
    return {
        description: app.name,
        command: app.brewType === BrewType.COMMAND ? `${brewCommandInstall} ${app.id}` : `${brewCaskInstall} ${app.id}`,
    };
}

/**
 * The official URL for Homebrew, a package manager for macOS.
 * This constant is used to reference the Homebrew website where users can find installation instructions and resources.
 */
export const MAC_OS_BREW_HOME_LINK = 'https://brew.sh/';
/**
 * The shell script command used to install Homebrew on macOS.
 * This command executes a bash script that downloads and runs the Homebrew installation process
 * from the official GitHub repository.
 */
export const MAC_OS_BREW_INSTALL_SCRIPT =
    '/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"';
/**
 * A command string to create a `.zprofile` file in the user's home directory on macOS.
 * This is typically used to set up environment variables or aliases specific to the shell session.
 */
export const MAC_OS_CREATE_ZPROFILE = 'cd ~ && touch .zprofile';
/**
 * This constant represents a shell command that appends the Homebrew shell environment to the user's profile.
 * The command ensures that Homebrew is initialized in new shell sessions, making its binaries available in the PATH.
 */
export const MAC_OS_BREW_ADD_TO_PROFILE = `echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> /Users/ok/.zprofile`;
/**
 * A command to verify the installation of Homebrew on macOS systems.
 * This command runs `brew doctor`, which checks for potential issues in the Homebrew installation and environment.
 */
export const MAC_OS_BREW_VERIFY_INSTALLATION = 'brew doctor';
/**
 * Represents the command to update, upgrade, and clean up Homebrew packages on macOS.
 * This command ensures that all installed Homebrew formulas are up to date,
 * removes outdated versions of installed formulae, and cleans up cached downloads.
 */
export const MAC_OS_BREW_UPDATE_UPGRADE = ' brew update && brew upgrade && brew autoremove && brew cleanup\n';
