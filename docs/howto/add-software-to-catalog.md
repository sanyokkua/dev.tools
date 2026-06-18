# How to Add Software to the Apps Catalog

## How the catalog works end-to-end

**Data layer**

| File                               | Purpose                                                                   |
| ---------------------------------- | ------------------------------------------------------------------------- |
| `src/common/apps-catalog.json`     | The catalog data (~572 KB). Edit this file directly — no code generation. |
| `src/common/apps-catalog-types.ts` | TypeScript types (`CatalogApp`, `CatalogMethod`, `AppsCatalog`, etc.)     |
| `src/common/apps-catalog.ts`       | Thin re-export of the JSON typed as `AppsCatalog`                         |

**Runtime layer**

| File                            | Purpose                                                                             |
| ------------------------------- | ----------------------------------------------------------------------------------- |
| `src/common/catalog-utils.ts`   | Filters and resolves the catalog at runtime                                         |
| `src/common/script-builder.ts`  | `buildCombined()` / `buildIndividual()` — turns resolved methods into shell scripts |
| `src/pages/software-installer/` | UI — consumes `APPS_CATALOG` via `catalog-utils.ts`                                 |

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
    verifyBeforeEmit?: boolean;
    parameterized?: boolean;
    versions?: string[];
}

export interface CatalogMethod {
    manager: CatalogManager;
    id?: string;
    kind?: 'cask' | 'formula';
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
- `verifyBeforeEmit: true` — inserts a version-check command before the install command in generated scripts.
- `parameterized: true` — enables version selection in the UI.
- `versions: ["1.0", "2.0"]` — list of selectable versions when `parameterized` is true.

---

## Add a platform or manager for an existing app

Find the app by `id` in `apps-catalog.json`, then add or edit the relevant platform key under `methods`. Each platform accepts an array of `CatalogMethod` objects, so multiple managers can coexist (e.g. both `brew` and `mas` for macOS).

---

## Remove an app

Delete its JSON entry from `apps-catalog.json`. TypeScript compilation confirms no code references it by ID.

---

## Add a new Linux package manager

1. Add the manager identifier to the `CatalogManager` union type in `src/common/apps-catalog-types.ts`.
2. Add method entries using the new manager to relevant apps in `apps-catalog.json`.
3. Update the manager selector UI in `src/pages/software-installer/` to surface the new manager.

---

## Verification

1. `npm run build` — confirms the JSON parses and there are no TypeScript errors.
2. `npm run verify:ui` — navigate to the Software Installer page, search for the app, confirm the generated commands appear correctly.
3. `npm run verify` — full lint + test pipeline.
