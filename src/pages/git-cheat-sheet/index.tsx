'use client';
import React, { useEffect, useState } from 'react';

import { usePage } from '@/contexts/PageContext';
import ContentContainerFlex from '../../components/layout/ContentContainerFlex';
import AppGenericForm, { FormItem, SubmittedField } from '../../modules/ui/AppGenericForm';

const InstructionText: string = `
# Git Configuration Guide

Get your dev environment ready in minutes—let’s dive into setting up Git (plus optional SSH & GPG) on your machine.

---

## 1. Prerequisites

- A modern OS (Linux, macOS, Windows WSL/Cygwin)
- Internet access to download Git and, optionally, connect to a Git hosting service (GitHub, GitLab, Bitbucket…)
- A verified email on your VCS provider if you plan to sign commits with GPG

---

## 2. Install Git

1. Go to https://git-scm.com/ and grab the installer for your OS.  
2. Follow on-screen prompts. On Windows, you can stick with defaults; on macOS/Linux, package managers are your friends:

   \`\`\`bash
   # macOS (Homebrew)
   brew install git

   # Ubuntu/Debian
   sudo apt update && sudo apt install git

   # Fedora
   sudo dnf install git
   \`\`\`

3. Verify installation:

   \`\`\`bash
   git --version
   \`\`\`

---

## 3. Configure Username & Email

Tell Git who you are—this info will show up in every commit.

\`\`\`bash
git config --global user.name "Your Name"
git config --global user.email "you@example.com"
\`\`\`

To double-check:

\`\`\`bash
git config --global --list
\`\`\`

---

## 4. (Optional) Generate & Add an SSH Key

SSH keys let you push/pull without typing your password every time.

### 4.1 Create the Key

Replace \`you@example.com\` with your actual email:

\`\`\`bash
# Preferred: Ed25519 (more secure + faster)
ssh-keygen -t ed25519 -C "you@example.com"

# Fallback for older systems:
ssh-keygen -t rsa -b 4096 -C "you@example.com"
\`\`\`

- Press **Enter** to accept the default file location (\`~/.ssh/id_ed25519\` or \`id_rsa\`).  
- If you already have a key under that name, give it a custom name (e.g. \`id_ed25519_github\`).  
- Enter a strong passphrase when prompted.

### 4.2 Add SSH Key to Agent

\`\`\`bash
eval "$(ssh-agent -s)"
ssh-add ~/.ssh/id_ed25519
\`\`\`

*(Replace with your custom path/file if you chose one.)*

### 4.3 Copy & Register on Your VCS

\`\`\`bash
# macOS/Linux
cat ~/.ssh/id_ed25519.pub | pbcopy

# Windows (Git Bash)
cat ~/.ssh/id_ed25519.pub | clip
\`\`\`

1. Log into GitHub/GitLab/Bitbucket.  
2. Go to **Settings → SSH and GPG keys** → **New SSH key**.  
3. Paste the public key, give it a memorable title, and **Save**.

---

## 5. (Optional) Generate & Use a GPG Key for Signing

Signed commits and tags boost trust and traceability.

### 5.1 Install GPG

- macOS: \`brew install gnupg\`  
- Ubuntu/Debian: \`sudo apt install gnupg\`  
- Fedora: \`sudo dnf install gnupg2\`

### 5.2 Generate Your Key

\`\`\`bash
gpg --full-generate-key
\`\`\`

- Choose **RSA 4096** or press Enter to accept defaults.  
- Set expiry (or leave non-expiring).  
- Enter your **verified** email (or GitHub’s no-reply if you want privacy).  
- Supply a passphrase.

### 5.3 Extract Your Key ID

\`\`\`bash
gpg --list-secret-keys --keyid-format=long
\`\`\`

Look for the line \`sec   4096R/ABCDEFG123456789\`. Your key ID is the part after \`/\`.

### 5.4 Add Key to Your Git Provider

\`\`\`bash
gpg --armor --export ABCDEFG123456789
\`\`\`

Copy everything from \`-----BEGIN PGP PUBLIC KEY BLOCK-----\` to \`-----END PGP PUBLIC KEY BLOCK-----\`, then paste into **Settings → SSH and GPG keys → New GPG key** on GitHub (or equivalent).

### 5.5 Tell Git to Sign by Default

\`\`\`bash
git config --global user.signingkey ABCDEFG123456789
git config --global commit.gpgsign true
git config --global tag.gpgSign true
# If your GPG binary is gpg2 on Linux:
git config --global gpg.program gpg2
\`\`\`

---

## 6. Verify Everything Works

1. **SSH**:  
   \`\`\`bash
   ssh -T git@github.com
   \`\`\`
   You should see a “success” message.  
2. **GPG**:  
   \`\`\`bash
   echo "test" | git commit -S --file=-  # creates a signed commit
   git log --show-signature -1          # view signature
   \`\`\`

---

## 7. Troubleshooting Tips

- If SSH still asks for a password, check \`~/.ssh/config\` or ensure your private key is added to \`ssh-agent\`.  
- On macOS, you might need to enable keychain integration:

  \`\`\`bash
  git config --global credential.helper osxkeychain
  \`\`\`

- If GPG signing fails, ensure your pinentry tool can prompt for your passphrase. On Linux, install \`pinentry-curses\` or \`pinentry-gtk\`.

---

## What’s Next?

• **Global \`.gitignore\`**: ignore OS and editor files everywhere.  
• **Git aliases**: speed up common commands (\`st\` → \`status\`, \`ci\` → \`commit\`).  
• **Branch workflows**: Git Flow, GitHub Flow, trunk-based—pick one for your team.  
• **Commit templates**: enforce consistent messages.  
• **Credential managers**: Git Credential Manager Core for seamless HTTPS auth.  

Keen to dive deeper into any of these? Let me know, and we’ll level up your Git game!
`;

enum PageFields {
    USERNAME = 'username',
    EMAIL = 'email',
    GLOBAL_CONFIG = 'globalConfig',
}

const IndexPage: React.FC = () => {
    const { setPageTitle } = usePage();

    useEffect(() => {
        setPageTitle('Git Cheat Sheet');
    }, [setPageTitle]);

    const [generatedCommands, setGeneratedCommands] = useState<string>('');

    const handleFormSubmit = (submittedFields: SubmittedField[]): void => {
        const fieldValues: Record<string, string> = {};
        submittedFields.forEach((field) => {
            fieldValues[field.itemKey] = String(field.itemValue);
        });

        if (!fieldValues[PageFields.GLOBAL_CONFIG]) {
            fieldValues[PageFields.GLOBAL_CONFIG] = 'false';
        }

        const isGlobal: string = fieldValues[PageFields.GLOBAL_CONFIG] === 'true' ? ' --global' : '';
        const commandsList: string[] = [];

        commandsList.push(`git config${isGlobal} user.name ${fieldValues[PageFields.USERNAME]}`);
        commandsList.push(`git config${isGlobal} user.email ${fieldValues[PageFields.EMAIL]}`);
        commandsList.push(`ssh-keygen -t ed25519 -C "${fieldValues[PageFields.USERNAME]}"`);
        commandsList.push(`ssh-keygen -t ed25519 -C "${fieldValues[PageFields.USERNAME]}"`);
        commandsList.push(`gpg --full-generate-key`);

        const bashCommands = commandsList.join('\n');
        setGeneratedCommands(`
## Commands to use:

\`\`\`bash
${bashCommands}
\`\`\`
    `);
    };

    const formItems: FormItem[] = [
        { itemKey: PageFields.USERNAME, itemType: 'text', itemName: 'User Name', isRequired: true },
        { itemKey: PageFields.EMAIL, itemType: 'email', itemName: 'User Email', isRequired: true },
        { itemKey: PageFields.GLOBAL_CONFIG, itemType: 'checkbox', itemName: 'Generate Global', isRequired: false },
    ];

    return (
        <ContentContainerFlex>
            <div>{InstructionText}</div>

            <h1>Commands Generator</h1>
            <p>
                Below you can find a command generation tool that will help to create all the required commands to set
                up Git
            </p>

            <div>
                <AppGenericForm items={formItems} onSubmit={handleFormSubmit} submitLabel="Generate" />
            </div>

            <div>{generatedCommands && <div>{generatedCommands}</div>}</div>
        </ContentContainerFlex>
    );
};

export default IndexPage;
