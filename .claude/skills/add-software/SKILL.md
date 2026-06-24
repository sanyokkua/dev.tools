---
name: add-software
description: Add or update an app in the dev.tools software installer catalog
---

# Add Software to the Catalog

Edit `src/common/apps-catalog.json` directly — no code generation step.

## File map

| File                               | Purpose                                                |
| ---------------------------------- | ------------------------------------------------------ |
| `src/common/apps-catalog.json`     | Catalog data (~572 KB) — edit directly                 |
| `src/common/apps-catalog-types.ts` | TypeScript types (`CatalogApp`, `CatalogMethod`, etc.) |
| `src/common/apps-catalog.ts`       | Thin re-export — do not edit                           |

## Steps

- [ ]   1. **Add the app entry** to the `apps` array in `apps-catalog.json`:

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

- [ ]   2. **Linux methods** (if `platforms.linux: true`) — Flatpak/Snap/AppImage are merged into every Linux distro entry. Use `LinuxMethods` structure from `apps-catalog-types.ts`.

- [ ]   3. **Optional fields**:
    - `site` — official website URL
    - `notes` — shown in the UI
    - `verifyBeforeEmit: true` — prepends version-check before install
    - `parameterized: true` + `versions: ["1.0", "2.0"]` — enables version picker

- [ ]   4. **Verify**:

    ```bash
    npm run build               # confirms JSON parses + no TypeScript errors
    npm run verify              # lint + test pipeline
    npm run verify:ui           # navigate to Software Installer, search the app, confirm commands appear
    ```

- [ ]   5. **Commit**: `git add src/common/apps-catalog.json && git commit -m "feat(catalog): add <name>"` then `git status` clean.

## Adding a new package manager

1. Add the manager identifier to `CatalogManager` union in `apps-catalog-types.ts`.
2. Add method entries in `apps-catalog.json`.
3. Update the manager selector UI in `src/pages/software-installer/`.
