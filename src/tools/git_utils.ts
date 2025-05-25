export type GitSetupCommands = {
    userNameCommand: string;
    userEmailCommand: string;
    sshCommand: string;
    combinedCommand: string;
};

export function generateGitConfig(
    userName: string | undefined | null,
    userEmail: string | undefined | null,
    isGlobal: boolean = true,
): GitSetupCommands {
    if (!userName || !userEmail || userName.trim().length === 0 || userEmail.trim().length === 0) {
        throw new Error(`Passed user name (${userName}) and email (${userEmail}) are not correct`);
    }
    const globalFlag: string = isGlobal ? ' --global ' : ' ';
    const gitConfigUserName: string = `git config${globalFlag}user.name "${userName.trim()}"`;
    const gitConfigUserEmail: string = `git config${globalFlag}user.email "${userEmail.trim()}"`;
    const sshCommand: string = `ssh-keygen -t ed25519 -C "${userEmail.trim()}"`;

    return {
        userNameCommand: gitConfigUserName,
        userEmailCommand: gitConfigUserEmail,
        sshCommand: sshCommand,
        combinedCommand: `${gitConfigUserName} && ${gitConfigUserEmail} && ${sshCommand}`,
    };
}
