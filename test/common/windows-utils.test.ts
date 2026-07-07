import {
    WINDOWS_CHOCO_INSTALL,
    WINDOWS_CHOCO_UPDATE_ALL,
    WINDOWS_CHOCO_VERIFY,
    WINDOWS_ENV_ADD_TO_PATH,
    WINDOWS_ENV_GUI_EDITOR,
    WINDOWS_ENV_MACHINE_LEVEL,
    WINDOWS_ENV_REG_QUERY,
    WINDOWS_ENV_SAFE_PATH_APPEND_MACHINE,
    WINDOWS_ENV_SESSION_ONLY,
    WINDOWS_ENV_SET_VARIABLE,
    WINDOWS_ENV_VIEW_VARIABLE,
    WINDOWS_SCOOP_INSTALL,
    WINDOWS_SCOOP_UPDATE_ALL,
    WINDOWS_SCOOP_VERIFY,
    WINDOWS_WINGET_UPDATE_ALL,
    WINDOWS_WINGET_UPGRADE_SELF,
    WINDOWS_WINGET_VERIFY,
} from '@/common/windows-utils';

describe('windows-utils constants', () => {
    it.each([
        ['WINDOWS_WINGET_VERIFY', WINDOWS_WINGET_VERIFY],
        ['WINDOWS_WINGET_UPGRADE_SELF', WINDOWS_WINGET_UPGRADE_SELF],
        ['WINDOWS_WINGET_UPDATE_ALL', WINDOWS_WINGET_UPDATE_ALL],
        ['WINDOWS_CHOCO_INSTALL', WINDOWS_CHOCO_INSTALL],
        ['WINDOWS_CHOCO_VERIFY', WINDOWS_CHOCO_VERIFY],
        ['WINDOWS_CHOCO_UPDATE_ALL', WINDOWS_CHOCO_UPDATE_ALL],
        ['WINDOWS_SCOOP_INSTALL', WINDOWS_SCOOP_INSTALL],
        ['WINDOWS_SCOOP_VERIFY', WINDOWS_SCOOP_VERIFY],
        ['WINDOWS_SCOOP_UPDATE_ALL', WINDOWS_SCOOP_UPDATE_ALL],
        ['WINDOWS_ENV_SESSION_ONLY', WINDOWS_ENV_SESSION_ONLY],
        ['WINDOWS_ENV_SET_VARIABLE', WINDOWS_ENV_SET_VARIABLE],
        ['WINDOWS_ENV_ADD_TO_PATH', WINDOWS_ENV_ADD_TO_PATH],
        ['WINDOWS_ENV_VIEW_VARIABLE', WINDOWS_ENV_VIEW_VARIABLE],
        ['WINDOWS_ENV_REG_QUERY', WINDOWS_ENV_REG_QUERY],
        ['WINDOWS_ENV_MACHINE_LEVEL', WINDOWS_ENV_MACHINE_LEVEL],
        ['WINDOWS_ENV_SAFE_PATH_APPEND_MACHINE', WINDOWS_ENV_SAFE_PATH_APPEND_MACHINE],
        ['WINDOWS_ENV_GUI_EDITOR', WINDOWS_ENV_GUI_EDITOR],
    ])('%s is a non-empty string', (_name, value) => {
        expect(typeof value).toBe('string');
        expect(value.length).toBeGreaterThan(0);
    });

    it('choco install references community.chocolatey.org', () => {
        expect(WINDOWS_CHOCO_INSTALL).toContain('community.chocolatey.org');
    });

    it('scoop install references get.scoop.sh', () => {
        expect(WINDOWS_SCOOP_INSTALL).toContain('get.scoop.sh');
    });

    it('env set variable uses SetEnvironmentVariable with User scope', () => {
        expect(WINDOWS_ENV_SET_VARIABLE).toContain('SetEnvironmentVariable');
        expect(WINDOWS_ENV_SET_VARIABLE).toContain('"User"');
    });

    it('env machine level uses Machine scope', () => {
        expect(WINDOWS_ENV_MACHINE_LEVEL).toContain('"Machine"');
    });

    it('env session only uses $env: not SetEnvironmentVariable', () => {
        expect(WINDOWS_ENV_SESSION_ONLY).toContain('$env:');
        expect(WINDOWS_ENV_SESSION_ONLY).not.toContain('SetEnvironmentVariable');
    });

    it('env reg query checks both HKCU and HKLM', () => {
        expect(WINDOWS_ENV_REG_QUERY).toContain('HKCU');
        expect(WINDOWS_ENV_REG_QUERY).toContain('HKLM');
    });

    it('env safe path append targets Machine scope and avoids setx', () => {
        expect(WINDOWS_ENV_SAFE_PATH_APPEND_MACHINE).toContain('"Machine"');
        expect(WINDOWS_ENV_SAFE_PATH_APPEND_MACHINE).not.toContain('setx');
    });

    it('env GUI editor uses sysdm.cpl', () => {
        expect(WINDOWS_ENV_GUI_EDITOR).toContain('sysdm.cpl');
    });
});
