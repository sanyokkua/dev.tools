import * as gitUtils from '../git_utils';

describe('generateGitConfig', () => {
    test('test empty or null(undefined) data passed to generateGitConfig', () => {
        expect(() => gitUtils.generateGitConfig(null, null)).toThrow(
            `Passed user name (${null}) and email (${null}) are not correct`,
        );
        expect(() => gitUtils.generateGitConfig(undefined, undefined)).toThrow(
            `Passed user name (${undefined}) and email (${undefined}) are not correct`,
        );
        expect(() => gitUtils.generateGitConfig('     ', '     ')).toThrow(
            `Passed user name (${'     '}) and email (${'     '}) are not correct`,
        );
    });
    test('test generateGitConfig works as expected with appropriate data', () => {
        const user1Name = 'user1';
        const user1Email = 'userAwesome1@mail.com';
        const user1NameExpected = `git config --global user.name "${user1Name}"`;
        const user1EmailExpected = `git config --global user.email "${user1Email}"`;

        const user2Name = 'testUser2';
        const user2Email = 'testAwesome1@mail.com';
        const user2NameExpected = `git config user.name "${user2Name}"`;
        const user2EmailExpected = `git config user.email "${user2Email}"`;

        expect(gitUtils.generateGitConfig(user1Name, user1Email)).toStrictEqual({
            userNameCommand: user1NameExpected,
            userEmailCommand: user1EmailExpected,
            combinedCommand: `${user1NameExpected} && ${user1EmailExpected}`,
        });
        expect(gitUtils.generateGitConfig(user1Name, user1Email, true)).toStrictEqual({
            userNameCommand: user1NameExpected,
            userEmailCommand: user1EmailExpected,
            combinedCommand: `${user1NameExpected} && ${user1EmailExpected}`,
        });
        expect(gitUtils.generateGitConfig(user2Name, user2Email, false)).toStrictEqual({
            userNameCommand: user2NameExpected,
            userEmailCommand: user2EmailExpected,
            combinedCommand: `${user2NameExpected} && ${user2EmailExpected}`,
        });
    });
});
