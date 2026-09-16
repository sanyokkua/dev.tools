# How to Add Software to the Apps Catalog

## How the catalog works end-to-end

**Data layer**

| File                               | Purpose                                                                   |
| ---------------------------------- | ------------------------------------------------------------------------- |
| `src/common/apps-catalog.json`     | The catalog data (~572 KB). Edit this file directly — no code generation. |
| `src/common/apps-catalog-types.ts` | TypeScript types (`CatalogApp`, `CatalogMethod`, `AppsCatalog`, etc.)     |
| `src/common/apps-catalog.ts`       | Thin re-export of the JSON typed as `AppsCatalog`                         |

**Runtime layer**

| File                                      | Purpose                                                                                                     |
| ----------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| `src/common/catalog-utils.ts`             | Filters and resolves the catalog at runtime                                                                 |
| `src/common/script-builder.ts`            | Resolves methods and builds selected-app or batch maintenance scripts                                       |
| `src/common/manager-bootstrap-catalog.ts` | Maps each non-OS-native `CatalogManager` to how it gets bootstrapped (the "Setup managers" tab) — see below |
| `src/pages/software-installer/`           | UI — consumes `APPS_CATALOG` via `catalog-utils.ts`                                                         |

---

## Key types

```ts
export type CatalogPlatform = 'macos' | 'windows' | 'linux';

export type LinuxDistro = 'debian' | 'fedora' | 'arch' | 'suse';

export type CatalogManager =
    | 'brew'
    | 'mas'
    | 'winget'
    | 'choco'
    | 'scoop'
    | 'apt'
    | 'dnf'
    | 'pacman'
    | 'zypper'
    | 'flatpak'
    | 'snap'
    | 'appimage'
    | 'npm'
    | 'uv'
    | 'pipx'
    | 'cargo'
    | 'go'
    | 'script'
    | 'installer';

export interface CatalogApp {
    id: string;
    name: string;
    category: string;
    description: string;
    site?: string;
    platforms: { macos: boolean; windows: boolean; linux: boolean };
    methods: { macos?: CatalogMethod[]; windows?: CatalogMethod[]; linux?: LinuxMethods };
    notes?: string;
    platformNotes?: Partial<Record<CatalogPlatform, string>>;
    parameterized?: boolean;
    versions?: string[];
}

export interface CatalogMethod {
    manager: CatalogManager;
    id?: string;
    kind?: 'cask' | 'formula';
    repoSetup?: string; // one-time repo/GPG-key registration; runs before `install`; never re-run for update/remove
    install: string;
    update?: string;
    upgrade?: string;
    remove?: string;
    verify?: string;
}
```

---

## Add an app

Add a JSON object to the `apps` array in `src/common/apps-catalog.json`. Minimum required fields:

```json
{
    "id": "my-app",
    "name": "My App",
    "category": "Developer Tools",
    "description": "One-line description",
    "platforms": { "macos": true, "windows": true, "linux": false },
    "methods": {
        "macos": [
            {
                "manager": "brew",
                "kind": "cask",
                "install": "brew install --cask my-app",
                "update": "brew upgrade --cask my-app",
                "upgrade": "brew upgrade --cask my-app",
                "remove": "brew uninstall --cask my-app",
                "verify": "my-app --version"
            }
        ],
        "windows": [
            {
                "manager": "winget",
                "id": "Publisher.MyApp",
                "install": "winget install --id Publisher.MyApp",
                "upgrade": "winget upgrade --id Publisher.MyApp",
                "remove": "winget uninstall --id Publisher.MyApp"
            }
        ]
    }
}
```

**Optional fields:**

- `site` — official website URL.
- `notes` — shown to the user in the UI.
- `platformNotes` — factual OS, distro, architecture, or minimum-version constraints shown in the UI.
- `parameterized: true` — enables version selection in the UI.
- `versions: ["1.0", "2.0"]` — list of selectable versions when `parameterized` is true.

Every catalog method must be executable. Do not add prose such as “download this installer” or
URL-only values. Use a complete shell, PowerShell, package-manager, or language-package command.
If no stable executable installer exists for a platform, omit that platform method and set its
platform flag to `false`.

`platformNotes` is informational only. Use it for factual minimum OS versions, architectures, or
distro limitations; it must not become a substitute for an executable method. A method's
`install`, `repoSetup`, `update`, `upgrade`, `remove`, and `verify` values are all validated as
commands when present. Parameterized apps must use `{version}` only with `parameterized: true` and
must provide a non-empty, duplicate-free `versions` list.

The catalog does not retain GUI-only or manual-only routes. This includes direct downloads,
AppImage, `.deb`, `.rpm`, `.pkg`, and `.msi` entries without a complete stable command and
required permissions. Keep the app/platform only when the command can be executed reliably.

For maintenance, package-manager-wide operations belong in
`src/common/manager-maintenance-catalog.ts`. App-level update commands should match the manager:
use package-specific reinstall/upgrade commands for npm, uv, pipx, Cargo, Go, and script
installers. Do not add project initialization commands such as `openspec init`, `serena init`, or
`specify init`.

---

## Add a platform or manager for an existing app

Find the app by `id` in `apps-catalog.json`, then add or edit the relevant platform key under `methods`. Each platform accepts an array of `CatalogMethod` objects, so multiple managers can coexist (e.g. both `brew` and `mas` for macOS).

---

## Remove an app

Delete its JSON entry from `apps-catalog.json`. TypeScript compilation confirms no code references it by ID.

---

## Add a new package manager

1. Add the manager identifier to the `CatalogManager` union type in `src/common/apps-catalog-types.ts`.
2. Add method entries using the new manager to relevant apps in `apps-catalog.json`.
3. Update the manager selector UI in `src/pages/software-installer/` to surface the new manager.
4. **Unless the manager is OS-native** (ships with the OS — `apt`/`dnf`/`pacman`/`zypper`/`winget`), add a
   `MANAGER_BOOTSTRAP` entry in `src/common/manager-bootstrap-catalog.ts` (see below) so the "Setup managers" tab
   knows how to bootstrap it. Skipping this step doesn't break anything at build time, but the generated Install
   script will fail on a machine that doesn't already have the manager, with no bootstrap script offered to fix it.

---

## Package-manager bootstrap ("Setup managers" tab)

The Software Installer assumes every non-native manager it resolves an app against is already usable in the shell
that runs the script. `manager-bootstrap-catalog.ts` is what lets it generate a separate script to fix that first.
Every `CatalogManager` falls into one of three buckets:

1. **OS-native** (`apt`, `dnf`, `pacman`, `zypper`, `winget`) — no entry in `MANAGER_BOOTSTRAP` at all. Absence from
   the catalog _is_ the signal that nothing needs to be bootstrapped.
2. **Root/self-contained** (`brew`, `choco`, `scoop`, `flatpak`, `snap`) — a `kind: 'fixed'` entry whose `command`/
   `verify` strings are imported directly from the existing `macos-utils.ts` / `windows-utils.ts` / `linux-utils.ts`
   constants (the same ones the `mac-os-setup` / `windows-setup` / `linux-setup` cheat-sheet pages already render).
   **Never re-type these commands** — reuse the constant, so the two places can't drift.
3. **Provider-app** (`npm`, `go`, `uv`, `cargo`, `pipx`) — a `kind: 'provider-app'` entry listing, in priority order,
   the `apps-catalog.json` app id(s) that provide that manager once installed (e.g. `npm` → `['node', 'nvm', 'fnm']`).
   The Setup tab resolves the _provider app's own_ install command using `resolveProviderCommand()` in
   `script-builder.ts` — which itself only ever picks an OS-native or root/self-contained method for that provider
   app, never another provider-resolved manager. That one rule is what keeps a bootstrap chain to at most two levels
   (e.g. `npm` → `node` → `brew`) and makes cycles (e.g. `uv`'s own methods list `pipx` and `cargo`) structurally
   impossible — don't work around it by hand-picking a "safe" method elsewhere.

If a dev-manager has no provider app yet in `apps-catalog.json` (this was true for `cargo`/Rust and `pipx` until
they were added), add one first, following the normal "Add an app" steps above, before wiring the
`MANAGER_BOOTSTRAP` entry.

---

## Verification

1. `npm run test:fast` — runs structural catalog and script-builder tests, including `validateCatalog`.
2. `npm run build` — confirms the JSON parses and there are no TypeScript errors.
3. `npm run verify:ui` — navigate to the Software Installer page, search for the app, and confirm the generated commands appear correctly.
4. `npm run verify` — full format, lint, path, and test pipeline.
