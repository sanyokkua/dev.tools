import type { CatalogApp } from '@/common/apps-catalog-types';
import { filterCatalog, getAvailableManagers, getCategories, MANAGER_LABEL } from '@/common/catalog-utils';

const FIREFOX: CatalogApp = {
    id: 'firefox',
    name: 'Firefox',
    category: 'browsers',
    description: 'Web browser',
    platforms: { macos: true, windows: true, linux: true },
    methods: {
        macos: [{ manager: 'brew', install: 'brew install --cask firefox' }],
        windows: [{ manager: 'winget', install: 'winget install Firefox' }],
        linux: { debian: [{ manager: 'apt', install: 'apt install firefox' }] },
    },
};

const VSCODE: CatalogApp = {
    id: 'vscode',
    name: 'VS Code',
    category: 'code-editors',
    description: 'Code editor by Microsoft',
    platforms: { macos: true, windows: true, linux: false },
    methods: {
        macos: [{ manager: 'brew', install: 'brew install --cask visual-studio-code' }],
        windows: [{ manager: 'winget', install: 'winget install vscode' }],
    },
};

describe('filterCatalog', () => {
    it('returns all apps when search and category are empty/null', () => {
        expect(filterCatalog([FIREFOX, VSCODE], '', null)).toHaveLength(2);
    });

    it('filters by name case-insensitively', () => {
        const result = filterCatalog([FIREFOX, VSCODE], 'fire', null);
        expect(result).toHaveLength(1);
        expect(result[0].id).toBe('firefox');
    });

    it('filters by description', () => {
        const result = filterCatalog([FIREFOX, VSCODE], 'microsoft', null);
        expect(result).toHaveLength(1);
        expect(result[0].id).toBe('vscode');
    });

    it('filters by category', () => {
        const result = filterCatalog([FIREFOX, VSCODE], '', 'browsers');
        expect(result).toHaveLength(1);
        expect(result[0].id).toBe('firefox');
    });

    it('applies search and category together (AND logic)', () => {
        expect(filterCatalog([FIREFOX, VSCODE], 'firefox', 'code-editors')).toHaveLength(0);
        expect(filterCatalog([FIREFOX, VSCODE], 'firefox', 'browsers')).toHaveLength(1);
    });

    it('returns empty array when nothing matches', () => {
        expect(filterCatalog([FIREFOX], 'zzzzz', null)).toHaveLength(0);
    });
});

describe('getCategories', () => {
    it('returns unique sorted categories', () => {
        const cats = getCategories([FIREFOX, VSCODE, FIREFOX]);
        expect(cats).toEqual(['browsers', 'code-editors']);
    });

    it('returns empty array for empty input', () => {
        expect(getCategories([])).toEqual([]);
    });
});

describe('getAvailableManagers', () => {
    it('returns managers for macOS', () => {
        expect(getAvailableManagers(FIREFOX, 'macos', 'debian')).toEqual(['brew']);
    });

    it('returns managers for windows', () => {
        expect(getAvailableManagers(FIREFOX, 'windows', 'debian')).toEqual(['winget']);
    });

    it('returns managers for linux-debian', () => {
        expect(getAvailableManagers(FIREFOX, 'linux', 'debian')).toEqual(['apt']);
    });

    it('returns empty array when platform not supported', () => {
        expect(getAvailableManagers(VSCODE, 'linux', 'debian')).toEqual([]);
    });

    it('returns empty array when linux distro has no methods', () => {
        expect(getAvailableManagers(FIREFOX, 'linux', 'fedora')).toEqual([]);
    });
});

describe('MANAGER_LABEL', () => {
    it('has a label for brew', () => {
        expect(MANAGER_LABEL['brew']).toBe('Homebrew');
    });

    it('has a label for winget', () => {
        expect(MANAGER_LABEL['winget']).toBe('winget');
    });
});
