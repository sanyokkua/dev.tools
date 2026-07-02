# Implementation Plan — Software Installer Overhaul + Dev Environment Setup Page

**App:** dev.tools (Next.js 16 Pages Router, React 19, TypeScript, SCSS, static export). Eleven discrete tasks, each independently addressable to Claude Code. Each task is self-contained: it restates the schema/context it needs rather than pointing at another document, so it can be handed over on its own.

**How to use this plan:** feed one task at a time to Claude Code, in order (later tasks assume earlier ones are merged, except where noted as parallelizable). Use the bootstrap prompt template (a separate file in this folder, `bootstrap-prompt.md`) and paste the relevant task's full content — Goal through Definition of Done — into its placeholders.

**Mandatory verification, every task, no exceptions** (from the project's own `CLAUDE.md`): after implementing, run in order — `npm run verify` (format → lint → test) → `npm run build` → `npm run validate:sw` → `npm run verify:ui` (24+ routes × 3 widths × 2 themes + interaction smoke tests, zero tolerance for horizontal overflow, console errors, serif fonts, or collapsed Monaco editors) → `git add -A && git commit` → `git status` must be clean. "Pre-existing failure" or "not caused by my change" is never an acceptable reason to skip fixing a failure that verification surfaces.

For the how should look like UI/UX - you need always check the partial mockup for functionality: "docs/dev-tools-feature-spec/mockup.html"

---

## Task 1 — Extend the catalog schema with `repoSetup` and migrate existing entries

**Goal:** Add an optional `repoSetup` field to `CatalogMethod` so third-party-repository/GPG-key setup is a distinct, reusable step instead of being invisibly chained into the `install` command string, then migrate the catalog entries that currently do this chaining.

**Why:** Today, `src/common/apps-catalog-types.ts` defines `CatalogMethod` with `manager`, optional `id`/`kind`, and `install`/`update`/`upgrade`/`remove`/`verify` strings. For every JDK vendor except distro-native OpenJDK, the Linux `install` string for apt/dnf/zypper currently chains a GPG-key-import + repo-file-write + `apt/dnf/zypper update` sequence together with the actual package install command using `&&`. This works, but it means the UI can never show "this requires adding a repo" as a distinct, visible fact, and the repo-add logic can't be deduplicated when multiple apps/versions from the same vendor are selected together.

**Files to touch:**

- `src/common/apps-catalog-types.ts` — add the field.
- `src/common/apps-catalog.json` — migrate 11 methods and remove 1 incorrect method (see exact list below).
- `test/common/apps-catalog.test.ts` (or wherever existing catalog-shape tests live — search `test/common/` for a file that validates `apps-catalog.json` against the type shape; if none exists, add one).

**Exact schema change:**

```ts
export interface CatalogMethod {
    manager: CatalogManager;
    id?: string;
    kind?: 'cask' | 'formula';
    repoSetup?: string; // NEW: one-time repo/GPG-key registration; runs before `install`; never re-run for update/remove
    install: string;
    update?: string;
    upgrade?: string;
    remove?: string;
    verify?: string;
}
```

This is additive/optional — no existing entry needs to change to remain valid; only the entries listed below should actually be migrated in this task.

**Entries to migrate** (vendor × distro; move the key-import/repo-add portion of the current `install` string into a new `repoSetup` string, leaving `install` with only the actual package-manager install invocation):

1. Temurin — apt (Debian/Ubuntu): current `install` chains `apt install -y wget apt-transport-https gpg && wget -qO - https://packages.adoptium.net/... | gpg --dearmor ... && echo "deb ..." | tee ... && apt update && apt install temurin-{version}-jdk`. Split: `repoSetup` = everything through `apt update`; `install` = `sudo apt install -y temurin-{version}-jdk`.
2. Temurin — dnf (Fedora): `repoSetup` = the `tee /etc/yum.repos.d/adoptium.repo <<'EOF' ... EOF` heredoc; `install` = `sudo dnf install -y temurin-{version}-jdk`.
3. Temurin — zypper (openSUSE): `repoSetup` = the `zypper ar -f https://packages.adoptium.net/...` line; `install` = `sudo zypper install -y temurin-{version}-jdk`.
4. Corretto — apt: `repoSetup` = the `wget -O - https://apt.corretto.aws/corretto.key | gpg --dearmor ... && echo "deb [...] ... corretto.list"` block + `apt-get update`; `install` = `sudo apt-get install -y java-{version}-amazon-corretto-jdk` (note Java 8 uses `java-1.8.0-amazon-corretto-jdk`).
5. Corretto — dnf: `repoSetup` = `rpm --import https://yum.corretto.aws/corretto.key && curl -Lo /etc/yum.repos.d/corretto.repo https://yum.corretto.aws/corretto.repo`; `install` = `sudo dnf install -y java-{version}-amazon-corretto-devel`.
6. Corretto — zypper: `repoSetup` = `rpm --import ... && zypper addrepo https://yum.corretto.aws/corretto.repo && zypper refresh`; `install` = `sudo zypper install -y java-{version}-amazon-corretto-devel`.
7. Microsoft OpenJDK — apt (Debian/Ubuntu only): `repoSetup` = downloading + `dpkg -i packages-microsoft-prod.deb` + `apt update`; `install` = `sudo apt install msopenjdk-{version}`. Add a `notes` addition: Microsoft's `packages-microsoft-prod.deb` config is validated only for Ubuntu 18.04/20.04/22.04/24.04 (confirmed against Microsoft's own install guide) — for any other Ubuntu version, or for Debian releases not covered, point users at the generic TAR.GZ archive instead of this apt method.
8. **Microsoft OpenJDK — dnf (Fedora): remove this method entirely, do not migrate it.** The existing catalog entry currently has a placeholder/non-concrete Fedora `dnf` method ("register the Microsoft yum repo, then..."). This was already vague, and it turns out to be flatly incorrect: Microsoft's own installation guide (learn.microsoft.com/en-us/java/openjdk/install) lists its supported Linux distributions as Ubuntu, Debian, openSUSE, SLES, CentOS, Alpine, and Azure Linux — **Fedora is not among them, and no dedicated Fedora repo config exists.** Delete the `fedora` entry from `microsoft-openjdk`'s `methods.linux` object entirely (leave the key absent, matching how `arch`/`suse`... — see item 9 below for suse, which IS valid — are already sometimes empty arrays elsewhere in the catalog) and add a `notes` sentence: "No documented Fedora install path exists for this vendor — use the generic TAR.GZ archive, or prefer Temurin/Corretto/Zulu on Fedora, all of which have genuine dnf repos there."
9. Microsoft OpenJDK — zypper (openSUSE/SLES — genuinely documented by Microsoft): `repoSetup` = `rpm -Uvh https://packages.microsoft.com/config/opensuse/15/packages-microsoft-prod.rpm && zypper update`; `install` = `sudo zypper install msopenjdk-{version}`.
10. Zulu — apt: `repoSetup` = the `curl ... azul-repo.key | gpg --dearmor ... && echo "deb [...] zulu.list" && apt update`; `install` = `sudo apt install zulu{version}-jdk`.
11. Zulu — dnf: `repoSetup` = downloading `zulu-repo-*.rpm` + `rpm --import` + `dnf install -y zulu-repo-*.rpm`; `install` = `sudo dnf install -y zulu{version}-jdk`.
12. Zulu — zypper: same pattern as dnf but with `zypper install -y zulu-repo-*.rpm`; `install` = `sudo zypper install -y zulu{version}-jdk`.

So: 11 methods get a `repoSetup`/`install` split (items 1–7, 9–12), and 1 method (item 8, Microsoft OpenJDK on Fedora) gets deleted outright rather than migrated, because it was never a real, documented install path. Do not change any `update`/`remove`/`verify` strings for the 11 migrated entries — only `install` gets shortened, and `repoSetup` gets added.

**Tests:**

- Add/extend a schema-shape test asserting every method with `repoSetup` set also has a non-empty `install` (i.e. `repoSetup` never replaces `install`, only precedes it).
- Add a snapshot-free assertion test that each of the 11 migrated entries above produces a `repoSetup` value containing the expected key phrase (e.g. Temurin apt's `repoSetup` contains `packages.adoptium.net`) so a future accidental revert is caught.
- Add a test asserting `apps-catalog.json`'s `microsoft-openjdk` entry has no `fedora` key under `methods.linux` (guards against the incorrect method being silently reintroduced).

**Docs to consult:** `docs/howto/add-software-to-catalog.md` (the `add-software` skill) for the catalog-editing convention (direct JSON edit, no codegen involved — this is a different system from the prompts catalog's `npm run build:prompts`, do not confuse the two).

**Edge cases:**

- Some entries have multi-line heredoc-style `repoSetup` content (the Temurin dnf `.repo` file write) — preserve exact formatting/line breaks in the JSON string (use `\n` escapes as the existing JSON already does for multi-line strings elsewhere in the file).
- Don't touch Arch (`pacman`) or the generic/distro-native OpenJDK entries — none of those need a `repoSetup` (Arch vendor builds are AUR-only and out of scope for this migration; distro-native OpenJDK needs no repo).
- After removing the Fedora method from `microsoft-openjdk`, confirm the Software Installer's existing app-catalog UI correctly stops offering that vendor when platform=Linux/distro=Fedora is selected (it should simply have zero available methods for that combination and fall out of the filtered list, the same way `jenv` already correctly disappears on Windows today).

**Definition of done:** schema compiles, all 11 applicable entries migrated exactly as specified, the 1 incorrect Microsoft-OpenJDK/Fedora method is removed with a corrective `notes` addition, existing `buildCombinedScript`/`buildPerAppScripts` behavior is unaffected until Task 2 teaches the builder to actually use `repoSetup` (this task only adds the data field and migrates/corrects data — wiring `repoSetup` into script generation is Task 2), full verification pipeline passes.

---

## Task 2 — Wire `repoSetup` into script generation with deduplication

**Goal:** Make `script-builder.ts` emit a distinct, deduplicated repo-setup section ahead of install commands, and make the Software Installer UI show a "requires repo" indicator.

**Why:** Task 1 only added the data field; the generator (`src/common/script-builder.ts`) still needs to know to (a) pull `repoSetup` out separately, (b) only emit each unique `repoSetup` string once per generated script even if multiple selected apps/versions share the same vendor repo, and (c) only do this for the `install` action (repo setup is meaningless for update/upgrade/remove — repos are assumed already present after a prior install).

**Files to touch:**

- `src/common/script-builder.ts` — `buildCombinedScript()` and `buildPerAppScripts()`.
- `src/components/page-specific/software-installer/AppCatalog.tsx` and/or `AppBasket.tsx` — add the "requires repo" `pill` badge.
- `test/common/script-builder.test.ts` — new test cases.
- `test/components/page-specific/software-installer/*.test.tsx` — update/add as needed.

**Implementation approach:**
In `buildCombinedScript`, when `action === 'install'`: before the main per-app loop, do a first pass collecting `method.repoSetup` for every app whose `resolveManager()` result has one, dedupe by exact string equality (a `Set<string>`), and if non-empty, emit a `### Repository setup (one-time)` header followed by each unique `repoSetup` block (each wrapped in the existing `run_task`/try-catch pattern the file already uses for consistency — reuse the exact same success/fail counting mechanism, don't invent a second one), then emit `### Install` before the existing per-app loop. For `buildPerAppScripts`, prepend any `repoSetup` the app's resolved method has directly into that app's own script string (no cross-app dedup needed there since each app's script is independent by design). For `update`/`upgrade`/`remove` actions, `repoSetup` is never emitted regardless of whether the method has one.

Keep `getCommand()` and `resolveManager()` unchanged — this task only changes the two script-assembly functions.

**UI change:** In whichever component renders the app catalog/basket chips, compute (using the already-available `getAvailableManagers()` from `src/common/catalog-utils.ts` plus a lookup at the currently resolved method) whether the currently-selected-or-would-be-selected manager for an app has a `repoSetup`, and render a small badge using the existing `.pill.warn` class with text "requires repo" next to that app's entry. This is a read-only indicator, not a new interactive control.

**Tests to add:**

- Two apps sharing the same vendor+distro (e.g. Temurin 17 and Temurin 21 both selected, Linux/Debian, apt preferred) → assert the combined script's repo-setup block appears exactly once, not twice.
- One app with `repoSetup` and one without, same script → assert only the one with it triggers the `### Repository setup` header, and the header itself is entirely absent when zero selected apps have a `repoSetup`.
- `update`/`remove` actions with the same app selection → assert no `### Repository setup` section appears regardless.
- Per-app scope with a mix of repo/no-repo apps → assert each app's own script correctly includes or omits its own repo block independent of the others.

**Docs to consult:** none beyond the spec/schema already described above — this is internal logic, no external API involved.

**Edge cases:**

- An app selected via fallback mode (not a preferred manager) whose fallback-resolved method happens to have a `repoSetup` — dedup logic must key off the actually-resolved method for that specific run, not off some static per-app assumption.
- Per-app override changing which manager (and therefore which `repoSetup`, if any) applies — must be re-evaluated live, matching how the rest of the config is already `useMemo`'d in `ScriptOutput.tsx`.

**Definition of done:** repo-setup blocks appear once per unique string, only on install actions, badge appears in the UI for affected apps, full verification pipeline passes, all existing tests plus the new ones above are green.

---

## Task 3 — Build the manager-wide maintenance catalog and "Everything this manager manages" mode

**Goal:** Add a new, separate catalog (not part of `apps-catalog.json`) describing per-manager "update everything" / "list outdated" / "cleanup" / "reboot check" commands, and add a `BuilderConfig` mode that, when active, ignores the selected-apps basket and generates a script purely from selected managers.

**Why:** Today `buildCombinedScript`/`buildPerAppScripts` only ever iterate the specific `apps` array handed to them — there's no way to say "update everything Homebrew/npm/uv/apt currently has installed" independent of which specific apps happen to be ticked in the basket.

**Files to touch (new):** `src/common/manager-maintenance-catalog.ts`.
**Files to touch (modified):** `src/common/script-builder.ts` (new exported function + `BuilderConfig` extension), `test/common/manager-maintenance-catalog.test.ts` (new), `test/common/script-builder.test.ts` (extended).

**New data shape** (place in the new file, export both the interface and a populated const):

```ts
import type { CatalogManager } from './apps-catalog-types';

export interface ManagerMaintenanceEntry {
    manager: CatalogManager;
    label: string;
    updateAllCommand?: string;
    listOutdatedCommand?: string;
    cleanupCommand?: string;
    rebootCheckCommand?: string;
    notes?: string;
}

// Keyed by platform, then by Linux distro where relevant (mirrors LinuxMethods in apps-catalog-types.ts)
export const MANAGER_MAINTENANCE: {
    macos: ManagerMaintenanceEntry[];
    windows: ManagerMaintenanceEntry[];
    linux: Partial<Record<'debian' | 'fedora' | 'arch' | 'suse', ManagerMaintenanceEntry[]>>;
} = {
    /* populated per catalog-data-reference.md in this same folder — see that file for the fully fact-checked command set for brew/mas, winget/choco/scoop, apt/dnf/pacman/zypper, flatpak/snap */
};
```

The exact commands (brew `update && upgrade --greedy` / `autoremove && cleanup -s`; mas `outdated`/`upgrade`; winget `upgrade --all --include-unknown`; choco `upgrade chocolatey -y` then `upgrade all -y`; scoop `update` then `update *` then `cleanup *`; apt `update && full-upgrade -y` / `autoremove -y && autoclean` / reboot check `[ -f /var/run/reboot-required ]`; dnf `upgrade --refresh` / `autoremove && clean all` / reboot check `dnf needs-restarting -r`; pacman `-Syu` / orphans `pacman -Rns $(pacman -Qdtq)` + cache `pacman -Sc`; zypper `dup` (Tumbleweed) or `update` (Leap) / `clean --all` + `purge-kernels` / reboot check `zypper needs-rebooting`; flatpak `update -y` / `uninstall --unused`; snap `refresh` / manual disabled-revision cleanup) are provided in full, ready to paste, in `catalog-data-reference.md` in this same folder — use those verbatim rather than re-deriving them; each was checked directly against its manager's own official documentation (Homebrew's own docs, Microsoft's `winget`/`choco`/`scoop` docs, Debian/Fedora/Arch/openSUSE package-manager manuals) as part of preparing that reference file.

**`script-builder.ts` changes:**

- Extend `BuilderConfig` with an optional `maintenanceScope?: 'apps' | 'all-installed'` (default/absent = today's behavior, `'all-installed'` = new mode) and an optional `includeCleanup?: boolean`.
- Add a new exported function, e.g. `buildManagerWideScript(managers: CatalogManager[], action: 'update' | 'upgrade', config: Pick<BuilderConfig,'platform'|'linuxDistro'>, includeCleanup: boolean): string`, which looks up each manager in `MANAGER_MAINTENANCE` for the given platform/distro, emits `updateAllCommand` (skip with a comment if absent for that manager on that platform — e.g. a manager that's install-only), and appends `cleanupCommand` per manager if `includeCleanup` is true. Follow the exact same bash `run_task`/PowerShell try-catch conventions already used in `buildCombinedScript` for consistency (same success/fail counters, same `set -uo pipefail` header, same `.ps1` `$ok`/`$fail` pattern) rather than inventing a new script skeleton.
- This function does not take an `apps` array at all — this is the core behavioral difference from the existing builders, and it should be a clearly separate function, not an overloaded parameter on the existing ones, to keep `buildCombinedScript`/`buildPerAppScripts` untouched for their existing callers.

**Tests:**

- One test per platform (macOS/Windows/Debian/Fedora/Arch/openSUSE) asserting the right manager commands appear in the right order.
- A manager with no `updateAllCommand` for the given platform → assert it's skipped with a comment, not a thrown error.
- `includeCleanup: false` → assert no cleanup commands appear.
- Empty `managers` array → assert the function returns a script with just the header/no-op, not a crash (mirrors the "select at least one" empty-state the UI will show).

**Docs to consult:** none beyond the fact-checked command reference described above.

**Edge cases:**

- Windows `winget upgrade --all` known limitation (skips `requiresExplicitUpgrade` apps and pinned apps) — include this as a `notes`-derived comment line directly in the generated script output, not only as a code comment in the source, since it materially changes what "done" means for the person running the script.
- Rolling-release distros (Arch/openSUSE Tumbleweed) must never emit a "sync-only" partial-upgrade command — always the full `-Syu` / `dup`, never split into separate refresh+upgrade steps. Both the Arch Wiki ("System maintenance" / partial upgrades) and openSUSE's own Tumbleweed documentation document partial upgrades as a known way to leave the package database and installed packages out of sync, causing broken dependencies.

**Definition of done:** new catalog file compiles and is fully populated per the reference data, `buildManagerWideScript` produces correct output for every platform/distro combination with test coverage, existing builders/tests unaffected, full verification pipeline passes.

---

## Task 4 — Software Installer UI: "Update scope" toggle and "System-wide maintenance" output mode

**Goal:** Surface Task 3's new capability in the Software Installer page.

**Why:** The data/logic layer from Task 3 needs a UI path. Two distinct UI additions are needed per the spec: (a) an "Update scope" toggle in the existing Step 4 output area, enabled only when Action is update/upgrade, switching between today's per-selected-app behavior and the new manager-wide behavior; (b) a third Scope option, "System-wide maintenance," which bypasses the app basket entirely.

**Files to touch:** `src/pages/software-installer/index.tsx`, `src/components/page-specific/software-installer/ScriptOutput.tsx`, `src/styles/installer.scss`, `test/pages/software-installer.test.tsx`, `test/components/page-specific/software-installer/ScriptOutput.test.tsx`.

**Implementation approach:**

- In `ScriptOutput.tsx`, add local state `updateScope: 'selected-apps' | 'all-installed'` (default `'selected-apps'`) and `includeCleanup: boolean` (default `true`), plus extend the existing `Scope` type (currently `'combined' | 'per-app'`) with a third value, e.g. `'system-wide'`.
- Render the "Update scope" `SegmentedControl` only when `action === 'update' || action === 'upgrade'`; when `action` is `install` or `remove`, hide it entirely (not just disable) since it has no meaning there, per the spec's edge-case guidance.
- When `scope === 'system-wide'`: render a manager multi-select (reuse the exact chip-button markup/pattern already used in `src/pages/software-installer/index.tsx`'s Step 2, factored into a small shared component or duplicated locally if extraction isn't warranted — prefer extraction if the chip-row JSX is identical, to avoid drift) independent of `selectedApps`, plus an "include cleanup" checkbox, and call the new `buildManagerWideScript()` from Task 3 instead of `buildCombinedScript`/`buildPerAppScripts`.
- When `updateScope === 'all-installed'` (and scope is `combined` or `per-app`, action is update/upgrade): same underlying call as system-wide but scoped to whatever's in `selectedManagers` from Step 2 (not a separate picker) — this reuses the existing manager selection rather than introducing a second one, per the spec.
- Empty states: system-wide scope with zero managers picked → reuse the existing `installer-output-empty` paragraph pattern with updated copy ("Select at least one package manager above to generate a maintenance script.").
- Per-app override controls in the basket should visually gray out (not disappear — use `.button-disabled`-equivalent opacity, not `display:none`) when `updateScope === 'all-installed'`, since they have no effect in that mode; add a tooltip or adjacent small-text explanation, don't just silently dim them.
- Fix the stale ToolAbout copy while in this file: replace the hardcoded "160+ apps" text in `src/pages/software-installer/index.tsx` with a template literal reading `APPS_CATALOG.apps.length` (already imported as `APPS_CATALOG` in that file).

**Tests:**

- "Update scope" control is absent when Action=install or Action=remove, present when Action=update or Action=upgrade.
- Selecting "Everything this manager manages" with a non-empty `selectedManagers` produces output matching `buildManagerWideScript`'s expected shape (assert on distinctive substrings, not full-string equality, to avoid brittle tests).
- System-wide scope with zero managers selected shows the empty-state message and no code block.
- ToolAbout text renders the live count, not a hardcoded string (assert it matches `APPS_CATALOG.apps.length` dynamically so the test doesn't need updating every time the catalog grows).

**Docs to consult:** `.claude/skills/project-conventions/SKILL.md` for the Context-API-only / SCSS-only / no-inline-styles rules that apply to any new markup added here.

**Edge cases:** all four already enumerated in Task 3 (winget limitation messaging, rolling-release full-sync-only) must be visible in the rendered output, not just present in the underlying script string — verify this with a test asserting the relevant warning text appears in the DOM when the corresponding manager/platform combination is selected.

**Definition of done:** both new UI paths work, existing install/update/upgrade/remove + combined/per-app flows are pixel-for-pixel unchanged when the new toggles are left at default, full verification pipeline (including `verify:ui` at all three widths/both themes) passes.

---

## Task 5 — Fix the two known bugs found while auditing the existing codebase against this specification

**Goal:** Fix a hardcoded path bug and confirm/clean up the stale app-count copy (the copy fix may already be resolved by Task 4 if done in sequence — this task exists so it isn't lost if Task 4 is skipped/reordered).

**Files to touch:** `src/common/macos-utils.ts`.

**Bug 1:** `MAC_OS_BREW_ADD_TO_PROFILE` currently reads:

```ts
export const MAC_OS_BREW_ADD_TO_PROFILE = `echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> /Users/ok/.zprofile`;
```

This hardcodes a specific user's home directory path. Fix to use a portable reference:

```ts
export const MAC_OS_BREW_ADD_TO_PROFILE = `echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> ~/.zprofile`;
```

Verify the consuming component (`src/components/page-specific/mac-os-setup/BrewInstallSteps.tsx`) doesn't do any additional string manipulation on this constant that assumes an absolute path (a quick grep/read is sufficient to confirm).

**Bug 2:** Confirm after Task 4 lands that no other hardcoded app-count strings remain (search the codebase for `"160"` and `"148"` as literal substrings in `.tsx`/`.ts` files to be sure).

**Tests:** if a render test exists for `mac-os-setup`, add/extend an assertion that the rendered "Add brew to PATH" snippet contains `~/.zprofile`, not a literal `/Users/` path.

**Docs to consult:** none.

**Edge cases:** none beyond ensuring the tilde form is valid inside the generated `echo '...' >> ~/.zprofile` shell command (it is — this is standard shell tilde expansion, unquoted in the redirect target).

**Definition of done:** no hardcoded personal paths remain in generated command strings anywhere in the two features touched by this project; full verification pipeline passes.

---

## Task 6 — Add missing package-manager catalog entries (SDKMAN, fnm, goenv, Corepack, Bun) to `apps-catalog.json`

**Goal:** Add five new `CatalogApp` entries confirmed missing from the existing 148-app catalog (cross-checked against `catalog-data-reference.md` in this same folder, which lists the full, fact-checked command set for each), so the Software Installer (not just the new Dev Environment Setup page) can generate scripts for them too.

**Why:** SDKMAN and fnm are the best-in-class cross-platform recommendations for Java/Maven/Gradle and Node version management respectively, per their own official documentation (fnm is nodejs.org's own listed install option on nodejs.org/en/download); goenv is the most actively maintained third-party Go version manager (confirmed via its GitHub repository's commit history and release cadence); Corepack needs its own entry because Node.js 25+ no longer bundles it, so `npm install -g corepack` becomes a real, separate install step; Bun needs a catalog entry so it's installable as a regular app through the existing Software Installer flow (independent of the new Dev Environment Setup page's Bun category, which is about instructional content, not script generation).

**Files to touch:** `src/common/apps-catalog.json` only (per the `add-software` skill: direct JSON edit, no codegen step, category field should be `'Developer Utilities'` or `'Runtimes & Build Tooling'` matching the existing convention for similar tools already in the catalog — check `jenv`/`nvm`/`pyenv`/`uv`'s existing `category` values and match them for consistency).

**Data to add (fact-checked; add each as a full `CatalogApp` object following the existing shape exactly — see `jenv`'s existing entry in the file as the closest structural template for a manager-type tool with limited-platform availability):**

- **SDKMAN**: `platforms: {macos:true, windows:false, linux:true}` (native; Windows only works via WSL, which isn't a distinct platform in this schema — omit a Windows method entirely rather than listing a misleading one, and use `notes` to explain the WSL option). macOS/Linux `script` manager: `install`: `curl -s "https://get.sdkman.io" | bash`; `verify`: `sdk version`; `remove`: `rm -rf ~/.sdkman` (plus removing its shell-init line — mention in `notes`). No `update` string needed at the tool level (SDKMAN updates itself via `sdk selfupdate`, add that as `update` if the schema's single-string-per-action shape accommodates it cleanly).
- **fnm**: `platforms: {macos:true, windows:true, linux:true}`. macOS: brew `install: brew install fnm`. Windows: winget `Schniz.fnm`, choco `fnm`, scoop `fnm`. Linux (all four distros): `script` manager, `install: curl -fsSL https://fnm.vercel.app/install | bash`. `verify: fnm --version` everywhere.
- **goenv**: `platforms: {macos:true, windows:false, linux:true}`. Confirmed directly against goenv's own `README.md` and `INSTALL.md` on GitHub (go-nv/goenv): both documents describe Bash/macOS/Linux installation only, with no Windows install path documented anywhere in the project — omit a Windows method entirely (do not list an unverified or "experimental" one) and state plainly in `notes`: "No Windows support — macOS and Linux only." macOS: brew `install: brew install goenv`. Linux: `script`, `install: git clone https://github.com/go-nv/goenv.git ~/.goenv`, then `configure`: add `export GOENV_ROOT="$HOME/.goenv"`, `export PATH="$GOENV_ROOT/bin:$PATH"`, and `eval "$(goenv init -)"` to the shell profile (`~/.bashrc`/`~/.zshrc`). `verify: goenv --version`. `update`: `cd "$(goenv root)" && git pull` (or `cd ~/.goenv && git pull` if installed via the default path). `remove: rm -rf ~/.goenv` plus removing the three profile lines above (mention in `notes`). `versionSwitch`: `goenv install {version}` to add a version, then `goenv global {version}` (system-wide) or `goenv local {version}` (per-directory, writes a `.go-version` file) to switch.
- **Corepack**: `platforms: {macos:true, windows:true, linux:true}`, single `npm` manager method across all three platforms: `install: npm install -g corepack`, then `verify: corepack --version`, `remove: npm uninstall -g corepack`. `notes`: "Bundled experimentally with Node 16–24; removed from Node.js 25+ — install explicitly going forward. Enable with `corepack enable`; pin a package manager with `corepack use pnpm@9` (writes the `packageManager` field in package.json)."
- **Bun**: `platforms: {macos:true, windows:true, linux:true}`. macOS: brew `install: brew install oven-sh/bun/bun` (note the tap prefix — plain `brew install bun` is not the correct/documented command), `update: brew upgrade bun`, `remove: brew uninstall bun`. Windows: scoop `install: scoop install bun`, `update: scoop update bun`, `remove: scoop uninstall bun` (no official winget entry exists per bun.com/docs/installation as fetched during this project — do not invent one). Also add an `npm` method on all three platforms: `install: npm install -g bun`, `update: bun upgrade` (self-upgrading — note in `notes` that once installed, `bun upgrade` handles updates directly except for brew/scoop installs), `remove: npm uninstall -g bun`. Linux additionally: `script` manager, `install: curl -fsSL https://bun.com/install | bash` (note Linux needs `unzip` first: mention in `notes`), `remove: rm -rf ~/.bun`. `verify: bun --version` everywhere.

**Tests:** extend whatever existing catalog-shape/count tests exist to account for 5 new entries (catalog count assertions, if any exist as hardcoded numbers in tests, must be updated — search for `148` in `test/`).

**Docs to consult:** `docs/howto/add-software-to-catalog.md`.

**Edge cases:** SDKMAN and goenv both need `platforms.windows: false` — confirm the existing `AppCatalog.tsx` UI already correctly hides/excludes apps with `platforms.windows === false` when platform=windows is selected (this should already work today since `jenv` already exercises this exact path — verify by testing that jenv is currently correctly hidden on the Windows tab before assuming the same will work for the new entries).

**Definition of done:** all 5 entries added, valid against the `CatalogApp`/`CatalogMethod` types, visible in the Software Installer catalog UI filtered correctly per platform, full verification pipeline passes.

---

## Task 7 — Correct Arch and openSUSE Go/Java catalog gaps

**Goal:** Fix catalog entries confirmed wrong or overly conservative for Arch Linux and openSUSE.

**Why:** The existing `go` entry's Linux methods currently list only `snap` for Arch and openSUSE. Direct confirmation against the Arch Linux package database (archlinux.org/packages, `go` in the **[extra]** official repository, not AUR) and openSUSE's own package search (software.opensuse.org, `go` present in Tumbleweed's official OSS repo) shows both are meaningfully better first-class options than snap and should be the preferred/first-listed method. Additionally, existing JDK vendor entries' Arch methods should be clearly distinguished as AUR-sourced (community-maintained, occasional breakage) versus the generic/distro-native OpenJDK entry, which is Arch's own officially-supported path via `archlinux-java`.

**Files to touch:** `src/common/apps-catalog.json` (the `go` entry's `methods.linux.arch` and `methods.linux.suse` arrays; review the four JDK vendor entries' `methods.linux.arch` arrays for accurate `notes`).

**Exact fixes:**

- `go` entry, `methods.linux.arch`: add/prefer a `pacman` method: `install: sudo pacman -S go`, `update: sudo pacman -Syu`, `remove: sudo pacman -Rs go`, `verify: go version`. Keep the existing snap method as a secondary/alternative entry in the same array (order matters for `resolveManager`'s priority resolution — put `pacman` first).
- `go` entry, `methods.linux.suse`: add a `zypper` method for Tumbleweed: `install: sudo zypper install go`, `update: sudo zypper dup`, `remove: sudo zypper remove go`, `verify: go version`, with a `notes` addition clarifying this applies to Tumbleweed — openSUSE Leap has no official `go` metapackage in its default OSS repo and needs the community `devel:languages:go` OBS repo instead. Add a second, clearly Leap-labeled method entry using this exact, version-pinned repo URL (confirmed via openSUSE's package search and the OBS project page for `devel:languages:go`, current as of Leap 16.0): `repoSetup: sudo zypper addrepo https://download.opensuse.org/repositories/devel:languages:go/16.0/devel:languages:go.repo && sudo zypper refresh`; `install: sudo zypper install go`; `update: sudo zypper update go`; `remove: sudo zypper remove go`; `verify: go version`. Add a `notes` sentence flagging that this OBS repo path is version-pinned to the Leap release (`16.0` here) and must be updated when the catalog is next revisited for a newer Leap release — this is exactly the kind of "repoSetup" case Task 1 introduced the field for.
- JDK vendor entries (Temurin/Corretto/Microsoft-OpenJDK/Zulu), `methods.linux.arch`: these already correctly point to AUR via `yay -S ...` — no functional change needed, but confirm/add a `notes` sentence on each stating these are community AUR builds with occasional breakage, and that Arch's own officially-supported route for Java is the generic `jdk{version}-openjdk` package (already a separate catalog entry) switched with `archlinux-java`, not `update-alternatives` (which Arch does not use for Java).

**Tests:** extend `test/common/apps-catalog.test.ts` (or wherever catalog-shape tests live) with an assertion that `go`'s Arch/openSUSE methods include a native package-manager entry, not snap-only.

**Docs to consult:** `docs/howto/add-software-to-catalog.md`.

**Edge cases:** none beyond correctly ordering the methods array so `resolveManager`'s priority-list resolution picks the native manager over snap when both are present and both are in the user's selected-managers priority list.

**Definition of done:** Arch and openSUSE Go installs prefer native package managers; JDK vendor Arch entries carry accurate AUR-vs-official notes; full verification pipeline passes.

---

## Task 8 — Build the Dev Environment Setup data catalog

**Goal:** Create `src/common/dev-env-catalog.ts`, a new, standalone TypeScript data module (distinct from both `apps-catalog.json` and the unrelated prompts catalog under `src/common/prompts/catalog/`) modeling install/configure/verify/update/remove/version-switch instructions for Java, Python, Go, Node.js, and Bun across macOS/Windows/Linux(+4 distros) and every relevant package/version manager.

**Why:** This is the data backbone for the new page built in Task 9. Building it as its own task keeps the (large) data-entry work separate from the (smaller) page/component work, and lets it be reviewed/fact-checked on its own.

**Files to touch (new):** `src/common/dev-env-catalog.ts`.
**Files to touch (new, tests):** `test/common/dev-env-catalog.test.ts`.

**Exact type shape to implement:**

```ts
export type DevEnvCategory = 'java' | 'python' | 'go' | 'nodejs' | 'bun';
export type DevEnvOS = 'macos' | 'windows' | 'linux';
export type DevEnvLinuxDistro = 'debian' | 'fedora' | 'arch' | 'suse';

export interface DevEnvManagerBootstrap {
    managerId: string;
    managerLabel: string;
    builtIntoOS?: boolean;
    availableOn: DevEnvOS[];
    installManager?: string;
    repoSetup?: string;
    installTool: string;
    configure?: string;
    verify: string;
    update?: string;
    remove?: string;
    versionSwitch?: string;
    notes?: string;
}

export interface DevEnvCategoryData {
    category: DevEnvCategory;
    label: string;
    description: string;
    managersByOS: Record<DevEnvOS, DevEnvManagerBootstrap[]>;
    linuxDistroOverrides?: Partial<Record<DevEnvLinuxDistro, DevEnvManagerBootstrap[]>>;
}

export const DEV_ENV_CATALOG: Record<DevEnvCategory, DevEnvCategoryData> = {
    /* ... */
};
```

**Content to populate:** the full fact-checked command set for all five categories (every install/repo/configure/verify/update/remove/version-switch string needed) is provided ready-to-adapt in `catalog-data-reference.md`, a companion file in this same folder — that file is the primary input for this task's data-entry work; treat every command in it as pre-verified (each was checked directly against the relevant tool's own official documentation or repository — SDKMAN's own install docs, jenv's GitHub README, the Python Packaging Authority's PEP 668, Go's own `go.dev` install docs, nodejs.org's install/version-manager listings, and Bun's own bun.com/docs/installation) rather than re-deriving commands from scratch. At minimum, populate:

- **Java**: managers `brew`(macOS, builtIntoOS-equivalent since it's the OS's de facto package manager — treat brew/apt/dnf/pacman/zypper/winget as `builtIntoOS: true` for the purposes of this catalog since the OS-Tools pages already cover installing the manager itself; only jenv/SDKMAN/nvm/fnm/pyenv/uv/goenv/bun count as `builtIntoOS: false` here), `jenv` (macOS+Linux only), `SDKMAN` (macOS+Linux native, Windows via WSL noted in `notes`), `update-alternatives`/`archlinux-java` (Linux, distro-specific — Arch uses `archlinux-java`, Debian/Fedora use `update-alternatives`), manual JAVA_HOME switching (Windows).
- **Python**: `uv`, `pip` (stdlib, PEP 668 caveat in `notes`), `pyenv`/`pyenv-win`, `pipx`.
- **Go**: official installer/tarball, package managers, `goenv`/`gvm` version managers, `GOTOOLCHAIN=auto` explainer in `notes`.
- **Node.js**: package managers, `nvm` (macOS/Linux) vs `nvm-windows` (Windows, explicitly noted as a different project) vs `fnm` (all three, recommended), `corepack`.
- **Bun**: as detailed in the specification — curl/PowerShell installer, npm, brew (tap-qualified), scoop; no official winget; `bum` third-party version manager noted.

**Tests:**

- Every category has at least one manager entry per `DevEnvOS` it claims to support (i.e. no category accidentally leaves an OS with zero managers).
- Every manager entry with `availableOn` excluding an OS is confirmed absent from that OS's array (schema/data consistency check).
- Entries with real per-OS caveats (jenv, nvm-windows) have a non-empty `notes` field (a content-presence check, not a content-correctness check — correctness is reviewed by the human maintainer, this test just guards against an empty caveat slipping through).

**Docs to consult:** none beyond the companion `catalog-data-reference.md` file's fact-checked content.

**Edge cases:** Windows Java version-switching (no jenv) must still have at least one `DevEnvManagerBootstrap` entry (the manual-JAVA_HOME-via-PowerShell path) so the Java category is never empty on Windows even though jenv itself is absent there.

**Definition of done:** file compiles, exports match the shape above, all five categories fully populated, tests pass, full verification pipeline passes (this task adds no UI, so `verify:ui` is unaffected, but `npm run verify`/`build` must still pass since the new file is part of the TypeScript build).

---

## Task 9 — Build the Dev Environment Setup page

**Goal:** Build the actual page, route, sidebar entry, and components consuming Task 8's data catalog.

**Why:** This is the user-facing deliverable for Feature B.

**Files to touch (new):**

- `src/pages/dev-environment-setup/index.tsx`
- `src/components/page-specific/dev-environment-setup/CategoryManagerSteps.tsx` (or similar — the component rendering the 4-step-group-per-manager output; name at the implementer's discretion following existing naming conventions like `BrewInstallSteps.tsx`)
- `src/styles/dev-environment-setup.scss`
- `test/pages/dev-environment-setup.test.tsx`
- `test/components/page-specific/dev-environment-setup/*.test.tsx` (component-level tests, following the pattern already used for `software-installer`'s page-specific components)

**Files to touch (modified):**

- `src/components/app-layout/ApplicationSidebar.tsx` — add a nav entry (kebab-case route `/dev-environment-setup`, single-emoji icon, placed in the same "Install & Setup" group as Software Installer/macOS-Windows-Linux-Setup/Git-Cheat-sheet).
- `src/pages/_app.tsx` — import the new `.scss` file once, alongside the other page styles.
- `scripts/verify-ui.mjs` — add `/dev-environment-setup` to the `ROUTES` array (currently 24 entries).
- `scripts/validate-sw-precache.mjs` — add the same route to its own `ROUTES` array.
- `docs/TOOLS.md` — add a one-paragraph description of the new page, matching the existing format for other tools.

**Implementation approach:**
Follow the Custom-pattern page structure already used by `mac-os-setup`/`windows-setup`/`linux-setup`: `PageShell` wrapping a `ToolAbout routeKey="dev-environment-setup"` (real, specific description — do not reuse boilerplate), then:

1. A `SegmentedControl` for Category (5 options, `DEV_ENV_CATALOG`'s keys from Task 8) — changing it resets OS and manager selections via a `useEffect` keyed on `[category]`, mirroring the exact reset pattern `software-installer/index.tsx` already uses for platform/distro changes.
2. A `SegmentedControl` for OS (macOS/Windows/Linux), with a conditionally-rendered Linux-distro sub-`SegmentedControl`, structurally identical to `software-installer`'s Step 1.
3. A multi-select `chip` row for package managers, populated from `DEV_ENV_CATALOG[category].managersByOS[os]` (or `linuxDistroOverrides[distro]` when set) filtered by `availableOn`. Managers this category doesn't support on this OS are simply absent from the array (already filtered at the data level in Task 8) — no extra UI-side filtering logic needed for the "doesn't exist" case; managers that exist-with-a-caveat (per the data's `notes` field) still render normally with their `notes` shown as body text under the relevant step, not suppressed.
4. For each currently-selected manager, render a step-group component reusing the exact `.card.pad` + `.steplabel` + `CodeSnippet` composition pattern from `BrewInstallSteps.tsx`: Step 1 "Install the package manager" (only rendered if `!builtIntoOS` and `installManager` is present), Step 2 "Install & configure" (splitting `repoSetup` into its own labeled `CodeSnippet` before `installTool`, exactly mirroring the Software Installer's repo/install split from Task 2 — reuse the same visual convention so the two features feel consistent), Step 3 "Verify," Step 4 "Update & remove," plus a conditional "Switching versions" step when `versionSwitch` is present.
5. Multiple selected managers render as sequential, clearly-separated step groups (each with a manager-name heading) rather than nested tabs — there is no "combine into one script" concept on this page, unlike the Software Installer; this page is a reference/comparison surface, not a script generator.
6. Copy/download: reuse `CodeSnippet`'s existing `onDownload` prop wired through `saveTextFile()` from `src/common/file-utils.ts` (the same helper already used by `VramManager.tsx`) rather than reintroducing `ScriptOutput.tsx`'s separate Blob-based `downloadScript()` helper — standardize on one implementation across the codebase as part of this task.

**Tests:**

- Render test: default category/OS render at least one manager step group.
- Switching Category resets OS/manager selection (mirrors an existing test pattern already used for `software-installer`'s platform-reset behavior — find and adapt it).
- A manager with a `notes` caveat (e.g. selecting Node.js → Windows → nvm) renders the caveat text visibly in the DOM.
- A manager absent for the selected OS (e.g. Java → Windows) does not show a jenv chip at all, but does show at least one Java/Windows-appropriate alternative (manual JAVA_HOME, per Task 8's edge-case requirement).
- Copy/download buttons are present and wired for every rendered `CodeSnippet`.

**Docs to consult:** `.claude/skills/new-tool/SKILL.md` and `.claude/skills/add-tool-page/SKILL.md` for the exact sidebar-entry/style-import/service-worker-validation steps (both skills describe the same underlying process; follow whichever is more current per the skill's own "last updated" signal if they've diverged) — do not skip the `scripts/verify-ui.mjs`/`scripts/validate-sw-precache.mjs` route-array updates, since the page will otherwise fail the mandatory `verify:ui`/`validate:sw` gates even though it renders correctly in a browser.

**Edge cases:** all four already listed in the specification's Feature B section (omission vs disabled-with-explanation for unavailable managers; multiple-manager side-by-side rendering; version-switch step only when applicable; repo/install split consistency with Feature A) must be visually verifiable in a rendered page, not just present in the data.

**Definition of done:** page reachable from the sidebar, all five categories functional, route added to both hardcoded route arrays, `docs/TOOLS.md` updated, full verification pipeline passes including `verify:ui` at 375/768/1280 in both themes.

---

## Task 10 — Repo-wide hardcoded-personal-path audit and regression guard

**Goal:** Confirm there is no hardcoded absolute developer-machine path (e.g. `/Users/<name>/...`, `/home/<name>/...`) anywhere in the app's source, fix every occurrence found, and add an automated check so this class of bug can't silently reappear in either the existing codebase or the new code this project adds.

**Why:** A repo-wide search (`grep -rn "/Users/ok" src/`, then a broader pass across the whole repository excluding `node_modules`/`.git`) was run directly against the current `dev.tools` source tree while preparing this specification and found **exactly one occurrence**, already identified independently as Task 5's bug fix: `src/common/macos-utils.ts`, the `MAC_OS_BREW_ADD_TO_PROFILE` constant:

```ts
export const MAC_OS_BREW_ADD_TO_PROFILE = `echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> /Users/ok/.zprofile`;
```

This hardcodes one specific developer's home directory into a command string that ships to every user of the app — anyone else running the generated command would append Homebrew's `eval` line to a path that isn't their own home directory (or, on most systems, to a path that doesn't exist / isn't writable by them at all). No other file in the repository contains this pattern today, but this task exists as a dedicated, standalone unit of work — both to make the fix explicit and reviewable on its own, and to add a permanent guard, since the new code this project adds across Tasks 1–9 (new catalog entries, new `dev-env-catalog.ts` content, new generated-script logic) is exactly the kind of hand-typed command-string content where this mistake is easy to reintroduce by copy-pasting a working local command instead of a portable one.

**Files to touch:**

- `src/common/macos-utils.ts` — the actual fix.
- A new or existing lint/test script that greps for the anti-pattern — see "Regression guard" below for where this belongs.

**The fix:**

```ts
export const MAC_OS_BREW_ADD_TO_PROFILE = `echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> ~/.zprofile`;
```

Unquoted `~` inside a shell redirect target (`>> ~/.zprofile`) expands correctly to the invoking user's home directory in bash/zsh — this is standard shell behavior, not a workaround. Before committing, read `src/components/page-specific/mac-os-setup/BrewInstallSteps.tsx` (the sole consumer of this constant) to confirm it does no further string manipulation that assumes an absolute path — it doesn't as of this writing (it passes the constant straight into a `CodeSnippet`'s `content` prop), but confirm this hasn't changed by the time this task runs, since Tasks 1–9 don't touch this file and shouldn't have altered that assumption.

**Repo-wide sweep (do this even though the fix above is already known — the point is to verify no new instance has crept in since this plan was written, and to check paths the original grep pass above didn't cover):**

1. `grep -rn "/Users/" --include="*.ts" --include="*.tsx" --include="*.json" --include="*.md" --include="*.mjs" src/ scripts/ docs/ test/ public/` (excludes `node_modules`/`.git`/build output automatically since those directories aren't listed) — review every hit; a match inside a _comment_ explaining what a path looks like is fine, a match inside an actual command/config _string value_ is not.
2. Also check for the equivalent Linux/Windows-flavored mistakes even though none were found in this pass: `/home/[a-z]+` (Linux personal paths) and `C:\\Users\\[A-Za-z]+` (Windows personal paths) — same grep approach, same review standard.
3. Specifically re-check every file this project's own Tasks 1–9 touch or create (`apps-catalog.json`'s new/migrated entries, `manager-maintenance-catalog.ts`, `dev-env-catalog.ts`, and the new Dev Environment Setup page/components) once they exist, since they're the highest-risk net-new content for this exact mistake — the `catalog-data-reference.md` companion file already avoids this by using portable forms (`~/.zshrc`, `$HOME/...`, `%USERPROFILE%\...`) throughout; if implementation deviates from that reference data, that's exactly the kind of drift this sweep should catch.

**Regression guard (the "everywhere, permanently" part of this task):**
Add a small standalone script, e.g. `scripts/check-hardcoded-paths.mjs`, that greps the same file set as step 1 above for the personal-path patterns and exits 1 if it finds any match outside an allowlisted comment pattern. Wire it into `package.json` as a new script (e.g. `"check:paths": "node scripts/check-hardcoded-paths.mjs"`) and add it to the `verify` chain (`"verify": "npm run clean && npm run format && git add . && npm run check:format && npm run check:lint && npm run check:paths && npm run test && npm run clean"`) so it runs on every future change automatically, not just this one. Keep the script dependency-free (plain Node `fs`/regex, matching the style of the existing `scripts/validate-sw-precache.mjs`) rather than pulling in a new lint plugin for a single-purpose check.

**Tests:**

- A unit test (or the guard script itself, run once as part of the test suite) asserting `MAC_OS_BREW_ADD_TO_PROFILE` contains `~/.zprofile` and does not contain the literal substring `/Users/`.
- A test for the new `check-hardcoded-paths.mjs` script itself: feed it a fixture string containing `/Users/someone/foo` and assert it reports a failure; feed it a fixture using `~/foo` or `$HOME/foo` and assert it passes.

**Docs to consult:** none beyond the project's own `CLAUDE.md` for where new npm scripts and verify-chain steps get documented (the "Commands" section at the top of `CLAUDE.md` lists every `npm run` script — add the new one there too).

**Edge cases:**

- Don't flag path-like strings that are legitimately absolute and portable by design, e.g. `/usr/local/go`, `/opt/homebrew/opt/go/libexec`, `/Library/Java/JavaVirtualMachines/...`, `/etc/environment` — these are standard system paths, not personal-user paths, and appear throughout the catalog data (including this project's own `catalog-data-reference.md`) legitimately. The guard script should key specifically on `/Users/<name>`, `/home/<name>`, and `C:\Users\<name>` shapes (a real username segment following the personal-path root), not on "any absolute path."
- If the sweep in step 1 turns up something in `test/` fixtures that's intentionally a fake example path used for testing (not a real developer's home directory), leave it alone but confirm it isn't accidentally a real path that leaked in from a contributor's local environment during development.

**Definition of done:** `MAC_OS_BREW_ADD_TO_PROFILE` uses `~/.zprofile`; a repo-wide sweep confirms zero remaining `/Users/<name>`, `/home/<name>`, or `C:\Users\<name>` occurrences outside legitimate system paths; the new `check:paths` script exists, is wired into `npm run verify`, and has its own passing test; the full verification pipeline in Task 11 (which runs after this task and now includes `check:paths` as part of `npm run verify`) still passes with the new check included.

---

## Task 11 — Full-branch verification and documentation pass

**Goal:** Final integration pass across everything built in Tasks 1–10.

**Why:** Per this project's own verification rule: "Verification scope is the whole branch, not just my diff... a nonzero count fails the task regardless of whether this task introduced it." This task exists specifically to catch any interaction issues between the two features and the path-audit guard (e.g. a route-array omission from Task 9 that a later task didn't re-check, a catalog test count that Task 6/7 changed but a different test file still hardcodes the old number, or a hardcoded path Task 10's sweep missed that only surfaces once every file is built). Running this task last, after Task 10, means `npm run verify` already includes the new `check:paths` step by the time this final pass runs — the two are intentionally sequenced so the last verification pass is the most complete one.

**Files to touch:** none specific — this is a verification and cleanup pass; fix whatever it finds.

**Steps:**

1. `npm run verify` (format → lint → test → the `check:paths` script added in Task 10) — fix any failure, including ones not obviously caused by this project's changes, per the project's stated verification policy.
2. `npm run build` — static export must succeed.
3. `npm run validate:sw` — service worker precache must cover all routes, including the new `/dev-environment-setup` route from Task 9.
4. `npm run verify:ui` — zero overflow/console-error/serif-font/collapsed-Monaco failures across all routes (25 after this project, was 24) at 375/768/1280, light + dark.
5. `npm run verify:smoke` — confirm no regressions in the 28+ existing interaction flows, and consider whether the new Software Installer toggles (Task 4) and the new Dev Environment Setup page (Task 9) warrant new smoke-test flows added to `scripts/smoke-tests.mjs` (recommended, not strictly required by the existing gate, but consistent with how thoroughly other complex interactive pages like Prompts Collection are covered there).
6. Grep the full `src/` and `test/` trees for the literal strings `148` and `160` to catch any remaining stale app-count references beyond the one already fixed in Task 4/5.
7. Explicitly re-run `npm run check:paths` on its own (even though step 1 already includes it via `verify`) as a final, isolated confirmation that Task 10's guard is wired in correctly and reports zero findings on the complete, final branch state.
8. `git add -A && git commit -m "..."` then `git status` must show a clean working tree.

**Docs to consult:** `docs/howto/add-a-tool-page.md`, the `run-verification` skill (`.claude/skills/run-verification/SKILL.md`) for the guided walkthrough this project's own CLAUDE.md references.

**Edge cases:** if any earlier task's tests were written against a catalog app-count or route-count that a later task changed, this pass is where that drift gets caught and fixed — do not treat it as "someone else's task's bug."

**Definition of done:** all eight verification steps above pass cleanly on the final branch state, `git status` is clean, and both features (Software Installer overhaul + Dev Environment Setup page) are demonstrably working end to end in a manual click-through (take screenshots of both pages in light and dark mode at desktop width as a final sanity check, per this project's "ALWAYS USE CHROME LIVE APP TESTING AFTER EACH ACCOMPLISHED TASK" rule).
