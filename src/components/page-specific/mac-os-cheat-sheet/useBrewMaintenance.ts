import { generateBrewUpdateScript, generateBrewUpgradeScript } from '@/common/macos-utils';
import { BrewType } from '@/common/types';
import { TableItem } from '@/elements/transfer/TransferTable';
import { useMemo } from 'react';

export interface BrewMaintenanceResult {
    updateScript: string | null;
    upgradeScript: string | null;
}

export default function useBrewMaintenance(selectedItems: TableItem[]): BrewMaintenanceResult {
    return useMemo(() => {
        const formulaIds = selectedItems
            .filter((item) => (item as TableItem & { brewType?: BrewType }).brewType === BrewType.COMMAND)
            .map((item) => item.id);

        const cascIds = selectedItems
            .filter((item) => (item as TableItem & { brewType?: BrewType }).brewType === BrewType.CASK)
            .map((item) => item.id);

        return {
            updateScript: formulaIds.length > 0 ? generateBrewUpdateScript(formulaIds) : null,
            upgradeScript: cascIds.length > 0 ? generateBrewUpgradeScript(cascIds) : null,
        };
    }, [selectedItems]);
}
