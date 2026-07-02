export const GOOD_PATHS = [
    `echo 'export FOO=bar' >> ~/foo`,
    `echo $HOME/foo`,
    `echo %USERPROFILE%\\foo`,
    `/usr/local/go`,
    `/opt/homebrew/opt/go/libexec`,
    `/Library/Java/JavaVirtualMachines/foo`,
    `/etc/environment`,
    `echo 'eval "$(/home/linuxbrew/.linuxbrew/bin/brew shellenv)"' >> ~/.bashrc`,
    `/Users/Shared/stuff`,
];
