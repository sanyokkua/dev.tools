import { APPS_CATALOG } from '@/common/apps-catalog';

describe('APPS_CATALOG integrity', () => {
    it('loads and has exactly 148 apps', () => {
        expect(APPS_CATALOG.apps).toHaveLength(148);
    });

    it('appCount field matches actual apps array length', () => {
        expect(APPS_CATALOG.appCount).toBe(APPS_CATALOG.apps.length);
    });

    it('all app ids are unique', () => {
        const ids = APPS_CATALOG.apps.map((a) => a.id);
        const uniqueIds = new Set(ids);
        expect(uniqueIds.size).toBe(ids.length);
    });

    it('every app has a non-empty id, name, category, and description', () => {
        for (const app of APPS_CATALOG.apps) {
            expect(app.id).toBeTruthy();
            expect(app.name).toBeTruthy();
            expect(app.category).toBeTruthy();
            expect(app.description).toBeTruthy();
        }
    });

    it('every method across all platforms has a non-empty install string', () => {
        for (const app of APPS_CATALOG.apps) {
            for (const method of app.methods.macos ?? []) {
                expect(method.install).toBeTruthy();
            }
            for (const method of app.methods.windows ?? []) {
                expect(method.install).toBeTruthy();
            }
            if (app.methods.linux) {
                for (const methods of Object.values(app.methods.linux)) {
                    for (const method of methods ?? []) {
                        expect(method.install).toBeTruthy();
                    }
                }
            }
        }
    });

    it('parameterized apps have a non-empty versions array', () => {
        const paramApps = APPS_CATALOG.apps.filter((a) => a.parameterized);
        for (const app of paramApps) {
            expect(app.versions).toBeDefined();
            expect(app.versions!.length).toBeGreaterThan(0);
        }
    });

    it('platform flags are consistent with methods presence', () => {
        for (const app of APPS_CATALOG.apps) {
            if (app.platforms.macos) {
                expect(app.methods.macos).toBeDefined();
            }
            if (app.platforms.windows) {
                expect(app.methods.windows).toBeDefined();
            }
            if (app.platforms.linux) {
                expect(app.methods.linux).toBeDefined();
            }
        }
    });
});
