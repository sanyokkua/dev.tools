# Specification — Software Installer Overhaul + Dev Environment Setup Page

**App:** dev.tools (Next.js 16 Pages Router, React 19, TypeScript, SCSS, static export to GitHub Pages)
**Status:** Draft, to be treated as final for implementation planning purposes.
**Scope:** (1) Improve the existing Software Installer script generator so it is a trustworthy source of truth for install/update/upgrade/uninstall across every OS and package manager it claims to support. (2) Add a new "Dev Environment Setup" tool page — a cheat sheet for provisioning a developer workstation (Java, Python, Go, Node.js, Bun) across macOS/Windows/Linux and every relevant package manager.

This document describes requirements and the logic of work. It does not assume the reader has any other file open — every fact it depends on is restated inline, with the source code location cited so it can be independently verified against the repository.

---

## Part 0 — How the app is structured today (grounding facts)

These facts come directly from reading the dev.tools source and are the foundation the rest of this spec builds on.

- **Two separate "catalogs" exist and must not be confused.** `src/common/apps-catalog.json` (148 entries today, schema in `src/common/apps-catalog-types.ts`) drives the Software Installer. A completely different system, `src/common/prompts/catalog/` (TypeScript modules, domains A–D), drives the Prompts Collection and is unrelated to this work — nothing in this spec touches the prompts catalog or its `npm run build:prompts` codegen step.
- **Catalog schema** (`apps-catalog-types.ts`): a `CatalogApp` has `id`, `name`, `category`, `description`, `platforms: {macos,windows,linux}`, `methods: {macos?: CatalogMethod[], windows?: CatalogMethod[], linux?: Partial<Record<'debian'|'fedora'|'arch'|'suse', CatalogMethod[]>>}`, plus optional `notes`, `parameterized`, `versions: string[]`. A `CatalogMethod` has `manager` (one of `brew|mas|winget|choco|scoop|apt|dnf|pacman|zypper|flatpak|snap|appimage|npm|uv|pipx|cargo|go|script|installer`), optional `id`/`kind`, and `install`/`update`/`upgrade`/`remove`/`verify` command strings. **Critically: today, when a Linux package needs a custom repository added first (true for every JDK vendor except distro-native OpenJDK), that repo-add/GPG-key-import sequence is concatenated directly into the `install` string as one long `&&`-chained command.** There is no separate field for it, and no way for the UI to show "this one requires adding a repo" as a distinct fact.
- **Script generation logic** (`src/common/script-builder.ts`, pure functions, no React): `resolveManager(app, config)` picks which manager to use per app (per-app override → first matching manager in priority order → optional fallback-to-any-available → skip). `getCommand(method, action, version?)` extracts the right string for `install|update|upgrade|remove` (upgrade falls back to `update` if no distinct `upgrade` string exists) and does `{version}` substitution. `buildCombinedScript(apps, action, config)` emits ONE script (bash `#!/usr/bin/env bash` + a `run_task` helper on macOS/Linux, PowerShell try/catch with `$ok`/`$fail` counters on Windows) that loops over the given `apps` array and runs each one's resolved command, with skipped apps rendered as a `# reason` comment line. `buildPerAppScripts(apps, action, config)` returns one script string per app instead (apps with no resolvable command are simply omitted). **Both functions only ever iterate the apps you hand them — there is no concept today of "update everything this manager has installed, regardless of what's in the app list."**
- **Page/UI** (`src/pages/software-installer/index.tsx`, `src/components/page-specific/software-installer/{AppCatalog,AppBasket,ScriptOutput}.tsx`): a 4-step Custom-pattern page — Step 1 platform (+ Linux distro) via `SegmentedControl`; Step 2 preferred package managers as toggle `chip` buttons (order = priority) plus a `preferred-only` vs `fallback` `SegmentedControl`; Step 3 app catalog + basket (search/filter, per-app manager override, per-app version multi-select for `parameterized` apps); Step 4 `ScriptOutput`, which has its own `action` (install/update/upgrade/remove) and `scope` (`combined` single script vs `per-app` one-per-app) `SegmentedControl`s, rendering result(s) through `CodeSnippet` (`src/components/elements/CodeSnippet.tsx` — a `.code-block` with syntax highlighting via `highlight.js`, a Copy button wired to `copyToClipboard()` + a toast, and an optional Download button that the caller wires up). Today's download implementation (`downloadScript()` in `ScriptOutput.tsx`, lines ~39-47) is a local `Blob`/`URL.createObjectURL` helper; a second, different download implementation (`saveTextFile()` in `src/common/file-utils.ts`) is used by the macOS VRAM Manager elsewhere in the app — two implementations of the same idea exist today.
- **The ToolAbout copy on the Software Installer page currently says "160+ apps"** (`src/pages/software-installer/index.tsx` line ~138) while the actual catalog has 148 entries (`APPS_CATALOG.appCount` / `APPS_CATALOG.apps.length` in `apps-catalog.json`) — a stale/inaccurate number that should be corrected, ideally by rendering the live count instead of a hardcoded string.
- **Design tokens** (`src/styles/colors.scss`): CSS custom properties only, light theme on `:root`, dark theme under `[data-theme='dark']`. Key tokens: `--primary` (#006b5f light / #82d5c7 dark), `--on-primary`, `--primary-container`/`--on-primary-container`, `--secondary`/`--tertiary` (+ containers), semantic `--success`/`--warning`/`--error`/`--info` (+ containers), surfaces `--bg`/`--surface`/`--card`/`--card-2`, text `--on-surface`/`--on-surface-variant`/`--muted`, `--outline`/`--outline-soft`/`--hover-overlay`, code `--code-bg`/`--code-fg`/`--code-line`, shadows `--shadow-sm/md/lg`, radii `--r-sm`(8px)/`--r-md`(12px)/`--r-lg`(18px)/`--r-pill`, spacing `--s1`(4px)…`--s6`(32px), `--font` (system sans, no serif anywhere — the app's `verify:ui` script fails the build if a serif font is detected), `--mono` (JetBrains Mono stack). Never hardcode hex colors in new SCSS; use the tokens.
- **Reusable primitives already available** (`src/styles/primitives.scss`, `chip.scss`, `surfaces.scss` — do not redefine these, only reuse): `.btn`/`.button-*` variants (primary/tonal/outline/ghost/danger, `.sm` size, `:disabled`), `.steplabel` (a numbered-circle step header — `.n` is a 22×22 `var(--primary)` circle), `.pill`/`.pill.ok/.no/.muted/.warn` (status badges), `.chip`/`.chip.on` (toggle tag buttons, used for the manager pickers), `.card`/`.card.pad`, `.code-block` (used inside `CodeSnippet`).
- **Comparable existing pages** worth reusing patterns from: `src/pages/mac-os-setup/index.tsx` (+ `windows-setup`, `linux-setup`) — each a `PageShell` + `ToolAbout` + top-level `SegmentedControl` for 2-3 tabs, each tab rendering `.card.pad` "Step" components (numbered `.steplabel` + description + one or more `CodeSnippet`s); `linux-setup`'s `PackageManagersSection.tsx` takes a `distro` prop and looks up commands from per-distro `Record<LinuxDistro, string>` tables — this is the closest existing precedent for "pick a distro, show the right commands." `src/pages/git-cheat-sheet/index.tsx` is the closest precedent for an Interactive-vs-Manual toggle feeding either a form-driven generator or static per-OS command sections.
- **Page-adding process** (from the `new-tool`/`add-tool-page` skills): a new page needs a route folder under `src/pages/<name>/index.tsx`, a sidebar entry in `ApplicationSidebar.tsx` (`navGroups`, single-emoji `icon`, kebab-case route), a `src/styles/<name>.scss` imported once in `_app.tsx`, a `ToolAbout routeKey="<name>"` with real descriptive copy, a render test at `test/pages/<name>.test.tsx`, and — because two hardcoded route arrays exist outside the page itself — the new route must also be added to the `ROUTES` list in `scripts/verify-ui.mjs` and `scripts/validate-sw-precache.mjs` (currently 24 routes in both) or the mandatory `npm run verify:ui` / `npm run validate:sw` gates will fail post-merge even though the page itself works.
- **Mandatory verification pipeline** (from `CLAUDE.md`, applies to every change in this spec): `npm run verify` (format→lint→test) → `npm run build` → `npm run validate:sw` → `npm run verify:ui` (24 routes × 3 widths × 2 themes + smoke tests, zero tolerance for overflow/console-errors/serif-font/Monaco-height failures) → commit with a clean `git status`.

---

## Part 1 — Feature A: Software Installer overhaul

### 1.1 Problem statement

The Software Installer already generates working single-command install/update/upgrade/remove strings per app, which is a solid foundation. Three things keep it from being a trustworthy "source of truth":

1. **Repository/key setup is invisible.** For every JDK vendor except distro-native OpenJDK (Temurin, Corretto, Microsoft OpenJDK, Zulu — see Part 2 for the fact-checked exact commands), installing on Debian/Ubuntu, Fedora, or openSUSE requires importing a GPG key and registering a third-party repository _before_ the package install command will work at all. Today this is buried inside one long chained `install` string, which (a) is correct and functional but (b) gives the user no visibility that a repo is being added to their system, and (c) means the repo-add re-runs every time `install` is regenerated even though it should be a one-time step, and cannot be reused independently (e.g. if a user wants "just give me the repo-add step" or wants to add the repo once and then install multiple JDK versions from it without repeating the key-import).
2. **"Update" and "upgrade" always operate per-selected-app, never per-manager.** This is actually correct default behavior (nobody wants a hidden "update everything on my machine" side effect from an app picker) — but there is no opt-in way to instead say "I don't care which specific apps I ticked, just update/upgrade everything Homebrew (or npm, or uv, or apt, …) currently has installed," which is a materially different and very common request (it's exactly what a machine-maintenance script does, and it's what your own `update_n_clean.sh`/`update-dev-tools.sh.sh`-style scripts already do by hand).
3. **There is no cross-manager "maintain my whole machine" script.** Even with per-manager global-update commands added, a user who has Homebrew + npm + uv + Docker + Snap installed has to generate four separate scripts and run them one at a time. A single generated script that runs the OS-appropriate update-everything + cleanup sequence for every manager they select, in the right order, does not exist.

### 1.2 New schema additions

**`CatalogMethod` gains one new optional field:**

```ts
export interface CatalogMethod {
    manager: CatalogManager;
    id?: string;
    kind?: 'cask' | 'formula';
    repoSetup?: string; // NEW — one-time repo/key registration, run before `install`, never re-run on update/remove
    install: string;
    update?: string;
    upgrade?: string;
    remove?: string;
    verify?: string;
}
```

Existing catalog entries whose `install` string currently inlines a repo-add sequence (Temurin/Corretto/Zulu on apt/dnf/zypper — 3 vendors × 3 distros = 9 methods — plus Microsoft OpenJDK on apt/zypper only, 2 methods, since Microsoft does not document a Fedora/dnf install path at all — 11 methods total, see Part 2 for the exact split) get migrated so the repo/key commands move into `repoSetup` and `install` keeps only the actual package-install command. This is a data migration, not a breaking schema change — `repoSetup` is optional, so every other entry in the catalog needs zero changes.

**A new manager-level (not per-app) metadata structure**, `src/common/manager-maintenance-catalog.ts`, models the "update everything this manager manages" and "clean up after updates" commands per (platform, manager) or (linuxDistro, manager) pair:

```ts
export interface ManagerMaintenanceEntry {
    manager: CatalogManager;
    label: string; // display name, reuse MANAGER_LABEL where possible
    updateAllCommand?: string; // e.g. brew: "brew update && brew upgrade --greedy"
    listOutdatedCommand?: string; // e.g. "brew outdated"
    cleanupCommand?: string; // e.g. "brew autoremove && brew cleanup -s"
    rebootCheckCommand?: string; // OS-specific, only present where one exists
    notes?: string; // caveats, e.g. winget's requiresExplicitUpgrade exclusions
}
```

This is intentionally a _separate_ catalog from `apps-catalog.json` because it describes manager-wide behavior, not any single app — it belongs conceptually next to `apps-catalog-types.ts` but should not be merged into the `CatalogApp` shape. See `catalog-data-reference.md` (a companion file in this same folder) for the fully fact-checked command set to seed this file with — every command in it is sourced directly from official vendor/project documentation, not invented.

### 1.3 New UI behavior

**Step 2 (package managers) — no change to selection UX**, but the manager chips gain a small `pill` badge (reusing the existing `.pill.warn` class) reading "requires repo" when at least one currently-selected app+platform combination would need a `repoSetup` step, so the user sees this before reaching the output step.

**Step 4 (Output) — three behavior changes:**

1. When the generated script includes any app whose resolved method has a `repoSetup` value, the combined script gets a clearly labeled `### Repository setup (one-time)` section emitted _once per unique repo_ (deduplicated — if two selected apps both need the Adoptium repo, e.g. two different Temurin versions, the key-import/repo-add block appears only once), followed by `### Install` with the actual install commands. Per-app scripts show the same split inside that app's own snippet.
2. A new toggle, next to the existing Action (`install|update|upgrade|remove`) and Scope (`combined|per-app`) `SegmentedControl`s: **"Update scope"** — `Selected apps only` (today's behavior, default) vs `Everything this manager manages` (new). This toggle is only enabled/visible when Action is `update` or `upgrade`. When set to "Everything," the generator ignores the app basket entirely and instead, for each manager present in `selectedManagers` that has a `updateAllCommand` in the new maintenance catalog, emits that one command (plus its `cleanupCommand` if the user also has a "include cleanup" checkbox checked). If a selected manager has no entry in the maintenance catalog (i.e. it's not one of the system/dev package managers this applies to), it's skipped with an inline comment, mirroring the existing skip-reason-comment pattern.
3. A new third **Scope** option, **"System-wide maintenance"**, sitting alongside `combined`/`per-app`. Selecting it hides the app basket dependency entirely (it does not require any app to be selected) and instead surfaces a manager multi-select (reusing the Step-2 chip UI, scoped to this new mode) plus an OS-appropriate ordered script: OS/system update → per-selected-manager update-all → per-selected-manager cleanup → (Linux only) reboot-required check. This is the "maintain my whole machine" script from problem statement #3, and it draws on `updateAllCommand`/`cleanupCommand`/`rebootCheckCommand` from the same maintenance catalog, plus the manager's own OS-level bootstrap concept is out of scope here (bootstrapping e.g. installing Homebrew itself already exists on the mac-os-setup page and is not duplicated).

**Empty/edge states:**

- If "System-wide maintenance" scope is selected with zero managers picked, show the same `installer-output-empty`-style message pattern already used for zero-apps ("Select at least one package manager above to generate a maintenance script").
- If "Everything this manager manages" is toggled while Action is `install` or `remove` (which don't make sense in that mode, since "install everything" and "remove everything" aren't well-defined machine-wide operations here), the toggle is disabled with a tooltip/hint explaining it only applies to update/upgrade — do not silently ignore the selection.
- Windows scripts continue using the existing `$LASTEXITCODE` try/catch pattern; note in a code comment (already partially true in the source) that `winget upgrade --all` is known to skip apps with `requiresExplicitUpgrade: true` (e.g. VS Code) and pinned apps — this caveat should also appear as visible text under the generated Windows system-wide script, not just as a source comment, since it changes what "success" means for the user reading the output.
- Per-app override + "Everything this manager manages" interaction: overrides are per-app and become irrelevant in "everything" mode since individual apps aren't being iterated — the UI should visually gray out the per-app override controls in the basket (not remove them) when "Everything this manager manages" is active, so the user understands why their override choice currently has no effect.

### 1.4 Script generation examples (illustrative — exact text will vary with catalog content, but the shape is normative)

**Example 1 — combined install script, macOS, apps = [Temurin 21, jenv], manager priority = [brew]:**

```bash
#!/usr/bin/env bash
# INSTALL — combined, generated by dev.tools
set -uo pipefail; SUCCESS=0; FAILED=0
run_task(){ echo "▶ $1"; shift; if "$@"; then SUCCESS=$((SUCCESS+1)); else FAILED=$((FAILED+1)); fi; }

run_task "install Eclipse Temurin (Adoptium) 21 (brew)" brew install --cask temurin@21
run_task "install JEnv (brew)" brew install jenv

echo "✔ $SUCCESS ok / ✖ $FAILED failed"
```

(No `repoSetup` section — Homebrew casks need none.)

**Example 2 — combined install script, Linux/Debian, apps = [Temurin 21], manager priority = [apt]:**

```bash
#!/usr/bin/env bash
# INSTALL — combined, generated by dev.tools
set -uo pipefail; SUCCESS=0; FAILED=0
run_task(){ echo "▶ $1"; shift; if "$@"; then SUCCESS=$((SUCCESS+1)); else FAILED=$((FAILED+1)); fi; }

### Repository setup (one-time)
run_task "add Adoptium apt repo" bash -c '
  sudo apt install -y wget apt-transport-https gpg
  wget -qO - https://packages.adoptium.net/artifactory/api/gpg/key/public | sudo gpg --dearmor -o /etc/apt/trusted.gpg.d/adoptium.gpg
  echo "deb https://packages.adoptium.net/artifactory/deb $(awk -F= "/^VERSION_CODENAME/{print\$2}" /etc/os-release) main" | sudo tee /etc/apt/sources.list.d/adoptium.list
  sudo apt update
'

### Install
run_task "install Eclipse Temurin (Adoptium) 21 (apt)" sudo apt install -y temurin-21-jdk

echo "✔ $SUCCESS ok / ✖ $FAILED failed"
```

**Example 3 — "Everything this manager manages," Action=upgrade, managers=[brew], include cleanup checked, macOS:**

```bash
#!/usr/bin/env bash
# UPGRADE (all apps managed by: Homebrew) — generated by dev.tools
set -uo pipefail
echo "▶ Homebrew: update + upgrade (greedy)"
brew update && brew upgrade --greedy
echo "▶ Homebrew: cleanup"
brew autoremove && brew cleanup -s
```

**Example 4 — "System-wide maintenance" scope, Linux/Debian, managers=[apt, flatpak, snap]:**

```bash
#!/usr/bin/env bash
# SYSTEM-WIDE MAINTENANCE (Debian/Ubuntu) — generated by dev.tools
set -uo pipefail
echo "=== 1/4: OS + apt packages ==="
sudo apt update && sudo apt full-upgrade -y

echo "=== 2/4: Flatpak ==="
flatpak update -y

echo "=== 3/4: Snap ==="
sudo snap refresh

echo "=== 4/4: Cleanup ==="
sudo apt autoremove -y && sudo apt autoclean
flatpak uninstall --unused -y
# Note: check for old disabled snap revisions manually — 'snap list --all' then 'snap remove <name> --revision=<rev>'

if [ -f /var/run/reboot-required ]; then
  echo "⚠ Reboot required"; cat /var/run/reboot-required.pkgs 2>/dev/null
fi
```

**Example 5 — "System-wide maintenance" scope, Windows, managers=[winget, choco]:**

```powershell
# SYSTEM-WIDE MAINTENANCE (Windows) — generated by dev.tools
Write-Host "=== winget ==="
winget upgrade --all --include-unknown
Write-Host "NOTE: apps marked 'requiresExplicitUpgrade' (e.g. VS Code) and pinned apps are skipped by --all and must be upgraded individually."

Write-Host "=== Chocolatey ==="
choco upgrade chocolatey -y
choco upgrade all -y

Write-Host "=== Reboot check ==="
Get-Item 'HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\WindowsUpdate\Auto Update\RebootRequired' -ErrorAction SilentlyContinue
```

### 1.5 Non-functional requirements

- Everything remains client-side generated (static export constraint — no server calls, no telemetry).
- All new UI elements use existing tokens/primitives (`.pill`, `.chip`, `.btn`, `.card.pad`, `.steplabel`) — no new hardcoded colors.
- New toggles/controls must be keyboard-accessible and carry `aria-pressed`/`aria-label` consistent with the existing `SegmentedControl`/chip patterns.
- Must pass the existing `npm run verify:ui` gate unchanged (no new overflow, no serif font, no console errors) at 375/768/1280 in both themes.
- The stale "160+ apps" copy must be fixed as part of this work (render `APPS_CATALOG.apps.length` instead of a hardcoded number).

### 1.6 Acceptance criteria

- [ ] A Linux/apt/Temurin (or Corretto/Zulu/Microsoft) install script visibly separates repo setup from package install, and the repo-add block appears exactly once even if multiple versions/apps need the same repo.
- [ ] Selecting Action=update or upgrade exposes the "Everything this manager manages" toggle; selecting it produces a script driven entirely by selected managers, ignoring the app basket.
- [ ] A "System-wide maintenance" scope exists, requires only a manager selection (no apps), and produces an OS-appropriate ordered script (system update → manager updates → cleanup → reboot check where applicable).
- [ ] All previously-working install/update/upgrade/remove combined and per-app scripts continue to work unchanged when the new toggles are left at their defaults.
- [ ] The ToolAbout copy shows the real, current app count.
- [ ] `npm run verify`, `npm run build`, `npm run validate:sw`, and `npm run verify:ui` all pass.

---

## Part 2 — Feature B: Dev Environment Setup page (new tool)

### 2.1 Purpose

A cheat-sheet-style page — same spirit as `mac-os-setup`/`windows-setup`/`linux-setup`/`git-cheat-sheet` but organized around **developer language/runtime setup** rather than OS-level configuration or git. A developer picks: **Category** (Java, Python, Go, Node.js, Bun) → **OS** (macOS, Windows, Linux — with distro sub-choice for Linux) → one or more **package managers** they want instructions for (both OS-level managers like brew/apt/winget and dev-level managers like uv/nvm/npm/jenv/SDKMAN/fnm/goenv/bun-itself). The page then renders, in order: (1) how to install the chosen package manager if it isn't already part of the OS, (2) how to install and configure the actual tool (including any required repo/key steps, environment variables, and version-switching setup — e.g. `jenv add` for already-installed JDKs, `nvm alias default`, `pyenv install`, `go env -w GOPROXY=...`), (3) how to verify the install worked, (4) how to update and how to remove it. This is explicitly meant to be extensible — new categories (Rust, Ruby, PHP, …) should slot into the same data shape later without a redesign.

### 2.2 Data model

A new catalog file, `src/common/dev-env-catalog.ts` (TypeScript module, not JSON — because some entries need small template functions for `{version}`-style substitution consistent with how `apps-catalog.json` already does string substitution, and because this catalog benefits from being colocated with typed helper functions the way the prompts catalog is, without being confused with the prompts catalog itself):

```ts
export type DevEnvCategory = 'java' | 'python' | 'go' | 'nodejs' | 'bun';
export type DevEnvOS = 'macos' | 'windows' | 'linux';
export type DevEnvLinuxDistro = 'debian' | 'fedora' | 'arch' | 'suse';

export interface DevEnvManagerBootstrap {
    managerId: string; // e.g. 'brew', 'jenv', 'sdkman', 'nvm', 'fnm', 'uv', 'pyenv', 'goenv', 'bun'
    managerLabel: string;
    builtIntoOS?: boolean; // true for apt/dnf/pacman/zypper/winget — skip the "install the manager" step
    availableOn: DevEnvOS[]; // e.g. jenv: ['macos','linux'] — Windows omitted, UI shows "not available" + alternative
    installManager?: string; // command to install the manager itself, absent if builtIntoOS
    repoSetup?: string; // one-time repo/key step, same shape/intent as CatalogMethod.repoSetup in Part 1
    installTool: string; // command(s) to install the actual tool/runtime via this manager
    configure?: string; // env vars / version-registration steps (JAVA_HOME, jenv add, nvm alias default, etc.)
    verify: string; // e.g. 'java -version', 'node --version && npm --version'
    update?: string;
    remove?: string;
    versionSwitch?: string; // how to switch active version with this manager, if it supports multiple
    notes?: string; // caveats surfaced verbatim in the UI, e.g. "nvm-windows is a different project"
}

export interface DevEnvCategoryData {
    category: DevEnvCategory;
    label: string;
    description: string;
    managersByOS: Record<DevEnvOS, DevEnvManagerBootstrap[]>;
    // Linux entries additionally vary by distro — represented as an optional distro-keyed override
    // on top of the linux array above, mirroring LinuxMethods in apps-catalog-types.ts
    linuxDistroOverrides?: Partial<Record<DevEnvLinuxDistro, DevEnvManagerBootstrap[]>>;
}
```

The exact, fact-checked content for all five categories (every command, every repo/key requirement, every env-var placement) is provided in the companion `catalog-data-reference.md` file in this same folder, ready to translate into this shape — this specification does not repeat all of it inline, only representative examples below.

### 2.3 Selection & filtering logic

1. **Category** is a top-level `SegmentedControl` (5 options: Java/Python/Go/Node.js/Bun) — changing it resets OS and manager selection, mirroring how `software-installer` resets `selectedManagers` when `platform`/`linuxDistro` changes (`useEffect` on `[category]`).
2. **OS** is a second `SegmentedControl` (macOS/Windows/Linux), with a Linux-distro sub-`SegmentedControl` appearing conditionally exactly like `software-installer`'s Step 1.
3. **Package manager(s)** render as multi-select `chip` buttons, populated from `devEnvCatalog[category].managersByOS[os]` (or the distro override when OS=linux). Managers not available on the selected OS for this category (e.g. jenv on Windows) are either omitted or rendered disabled with a one-line explanation ("jenv has no native Windows build — use SDKMAN-in-WSL, Scoop's `scoop reset`, or manual JAVA_HOME switching") — **omission is preferred for managers that are OS-inapplicable by nature; disabled-with-explanation is preferred for managers a user might reasonably expect but that have a real caveat**, matching the distinction the research draws between "doesn't exist" and "exists but has a gotcha."
4. Selecting one or more managers renders one **Step group per selected manager**, each containing four numbered `.steplabel` sections (reusing the exact card/step pattern from `BrewInstallSteps.tsx`):
    - **Step 1 — Install the package manager** (only rendered if `!builtIntoOS`; e.g. shown for jenv/SDKMAN/nvm/fnm/pyenv/uv/goenv/bun/snap/flatpack/brew/etc, skipped for apt/dnf/pacman/zypper/winget/etc since those ship with the OS).
    - **Step 2 — Install & configure** the tool: if `repoSetup` exists it renders as its own labeled sub-block before `installTool`, exactly as in Part 1's repo/install split; `configure` (env vars, version registration) renders after, as its own `CodeSnippet`.
    - **Step 3 — Verify.**
    - **Step 4 — Update & Remove** (two `CodeSnippet`s side by side or stacked).
    - If the manager supports switching between multiple installed versions (jenv, SDKMAN, nvm, fnm, pyenv, goenv, update-alternatives), an additional **"Switching versions"** `CodeSnippet` appears using `versionSwitch`.
5. **Multiple managers selected simultaneously** render as sequential step groups (not nested tabs) so a user comparing e.g. "nvm vs fnm" or "jenv vs SDKMAN" can see both side by side by scrolling, matching the cheat-sheet framing (this is a reference page, not a wizard that produces one script) — this is the key behavioral difference from Feature A: **the Dev Environment Setup page always shows instructions/snippets for everything currently selected; it has no "generate one combined script" concept**, because the whole point is comparing options, not producing a single artifact.

### 2.4 Representative content (fact-checked; full data in `catalog-data-reference.md`)

**Java, macOS, manager=jenv** (`builtIntoOS: false`, `availableOn: ['macos','linux']`):

- Install manager: `brew install jenv`
- Configure (shell init): `echo 'export PATH="$HOME/.jenv/bin:$PATH"' >> ~/.zshrc && echo 'eval "$(jenv init -)"' >> ~/.zshrc && exec $SHELL -l`
- Install & configure tool: jenv does not install JDKs — this step instead reads "Install a JDK first (see the Homebrew cask commands above), then register it: `jenv add /Library/Java/JavaVirtualMachines/temurin-21.jdk/Contents/Home`"
- Verify: `jenv doctor` (expect `[OK] Jenv is correctly loaded`) and `jenv versions`
- Version switch: `jenv global 21.0` (default) / `jenv local 17.0` (writes `.java-version`, per-project) / `jenv shell 11.0` (current shell only); optionally `jenv enable-plugin export` so JAVA_HOME tracks the active version automatically
- Notes: "If using jenv's export plugin, do not also set JAVA_HOME manually in your shell rc file — the two will conflict."

**Java, Windows, manager=jenv** — this entry is `availableOn`-excluded for Windows. The UI instead shows a disabled chip with the explanation above and a pointer to the SDKMAN-in-WSL / Scoop `reset` / manual-JAVA_HOME alternatives (each of which are their own selectable manager entries in the Windows list for the Java category).

**Node.js, Windows, manager=nvm** — deliberately labeled distinctly from the macOS/Linux `nvm` entry with a `notes` field: "**This is `coreybutler/nvm-windows`, an unrelated project from Unix nvm** (different codebase, symlinks not shims, no `.nvmrc` support, currently in feature freeze pending a successor called 'Runtime'). `fnm` is the better-recommended cross-platform choice today — see the fnm entry."

**Bun, all OSes, manager=bun (self)** (fact-checked directly against bun.com/docs/installation, fetched during this project):

- Install manager: N/A — Bun is the tool itself, not a wrapper around another manager.
- Install tool — macOS/Linux: `curl -fsSL https://bun.com/install | bash` (Linux additionally needs `unzip`: `sudo apt install unzip` or distro equivalent; kernel 5.6+ recommended); Windows: `powershell -c "irm bun.sh/install.ps1|iex"` (requires Windows 10 1809+).
- Configure (env vars): `export BUN_INSTALL="$HOME/.bun"` + `export PATH="$BUN_INSTALL/bin:$PATH"` in `~/.bashrc`/`~/.zshrc`/fish config; Windows uses `[System.Environment]::SetEnvironmentVariable("Path", ..., "User")` if the installer didn't already update PATH.
- Verify: `bun --version` and `bun --revision`.
- Update: `bun upgrade` (self-upgrading binary) — **except** Homebrew installs (`brew upgrade bun`) and Scoop installs (`scoop update bun`), which must use their own manager's upgrade command instead of `bun upgrade` to avoid conflicts.
- Remove: macOS/Linux `rm -rf ~/.bun`; Windows `powershell -c ~\.bun\uninstall.ps1`; if installed via a package manager, that manager's uninstall (`npm uninstall -g bun`, `brew uninstall bun`, `scoop uninstall bun`).
- Also present as manager options: npm (`npm install -g bun`), Homebrew (`brew install oven-sh/bun/bun` — note the tap prefix is required, plain `brew install bun` is not the documented command), Scoop (`scoop install bun`).
- Version management: no official first-party multi-version manager; a `.bun-version` file or `BUN_VERSION` env var is honored by some hosting platforms (not general local dev use); the community tool `bum` (`owenizedd/bum`, Rust) offers `bum use <version>` if genuine side-by-side version switching is needed — flagged as third-party/community, not official, in the `notes` field.

### 2.5 Non-functional requirements

- Same Custom-pattern conventions as Part 1 (PageShell, ToolAbout, SegmentedControl, `.card.pad`/`.steplabel`/`CodeSnippet`, tokens-only styling).
- New route (e.g. `/dev-environment-setup`) needs a sidebar entry, a `.scss` file imported in `_app.tsx`, and must be added to the `ROUTES` arrays in `scripts/verify-ui.mjs` and `scripts/validate-sw-precache.mjs`.
- Must remain fully static/client-side; no external calls at runtime (all data ships in the bundle via `dev-env-catalog.ts`).
- Copy-to-clipboard and download must reuse `CodeSnippet`'s existing `onDownload` pattern (standardize on `saveTextFile` from `src/common/file-utils.ts` for any new download wiring rather than reintroducing the separate Blob-based helper that `ScriptOutput.tsx` currently has — two implementations of the same idea already exist and this feature should not add a third).
- Responsive at 375/768/1280 in both themes, per the mandatory `verify:ui` gate.

### 2.6 Acceptance criteria

- [ ] All five categories (Java, Python, Go, Node.js, Bun) are selectable and each renders at least one valid manager per applicable OS.
- [ ] Selecting a manager that has real per-OS caveats (jenv/Windows, nvm/Windows, pyenv-win) surfaces the caveat text, not a silently wrong command.
- [ ] Every rendered step group includes Install-manager (if applicable) → Install & configure tool (with repo/key step split out when relevant) → Verify → Update/Remove, in that order.
- [ ] Multiple managers can be selected at once and render as independent, clearly separated step groups.
- [ ] Page passes the full mandatory verification pipeline and is reachable from the sidebar.

---

## Part 3 — Vendor-specific facts confirmed during final fact-checking

Everything below was checked directly against a primary source (vendor documentation or a live package registry) rather than left as an assumption:

- **Chocolatey's Corretto package names are consistent, not ambiguous**, once checked properly: `corretto{version}jdk` for the JDK (`corretto8jdk`, `corretto11jdk`, `corretto17jdk`, `corretto21jdk`, `corretto25jdk` all confirmed live on community.chocolatey.org), a JRE-only `corretto{version}jre` variant, and an unversioned `correttojdk` tracking latest. The suffix convention (`jdk` appended) simply differs from Temurin's Chocolatey convention (`temurin21`, no suffix) — each vendor is internally consistent. Generated commands can use these directly with no pre-flight `choco search` step.
- **Microsoft Build of OpenJDK has no documented Fedora install path.** Confirmed against Microsoft's own installation guide (learn.microsoft.com/en-us/java/openjdk/install, updated 2026-01-08): the supported Linux distributions are Ubuntu, Debian, openSUSE, SLES, CentOS, Alpine, and Azure Linux — Fedora is absent from that list entirely, not merely undocumented in detail. The catalog entry for this vendor should not include a Fedora dnf method; instead its `notes` should point Fedora users to the generic TAR.GZ archive (Microsoft's own fallback for unsupported distros) or to Temurin/Corretto/Zulu, all three of which do have genuine Fedora-compatible dnf repos. Also confirmed: Microsoft's apt-repo method for Ubuntu is only validated for versions 18.04, 20.04, 22.04, and 24.04 — any other Ubuntu version (including 26.04) should use the TAR.GZ package per Microsoft's own guidance, not the apt repo.
- **openSUSE Leap has no official Go package in its default OSS repo** (Tumbleweed does) — confirmed against software.opensuse.org's package listing. The working fix is the version-specific OBS repo: `sudo zypper addrepo https://download.opensuse.org/repositories/devel:languages:go/16.0/devel:languages:go.repo && sudo zypper refresh && sudo zypper install go`. This distinction must be preserved in the catalog as two separate methods (Tumbleweed native, Leap via OBS repo) rather than collapsed into one "openSUSE" entry.
- **goenv is macOS/Linux-only, with no Windows support at all** — this corrects an earlier, less careful characterization ("limited Windows support"). Checked directly against the project's own README and INSTALL.md: both carry Bash/Linux/macOS badges only, and neither documents a Windows install path. Treat goenv exactly like jenv in terms of platform availability: present it for macOS/Linux, omit it entirely for Windows rather than showing a disabled/caveated entry.
- **On version numbers:** exact patch/point releases (Go 1.26.x, Node 24/26, uv 0.11.x, Java LTS lines, etc.) reflect the state confirmed during this fact-checking pass and will continue to advance as each vendor ships new releases — this is the normal behavior of a live ecosystem, not an unresolved question. The structural mitigation, already reflected throughout this specification and its companion `catalog-data-reference.md`, is to use `{version}`-parameterized commands wherever the underlying tool supports it rather than hardcoding a number that will eventually go stale.
