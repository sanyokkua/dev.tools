import type { AppsCatalog } from './apps-catalog-types';
import catalogJson from './apps-catalog.json';

export type {
    AppsCatalog,
    AppsCatalogManagers,
    CatalogApp,
    CatalogManager,
    CatalogMethod,
    CatalogPlatform,
    LinuxDistro,
    LinuxMethods,
} from './apps-catalog-types';

export const APPS_CATALOG: AppsCatalog = catalogJson as AppsCatalog;
