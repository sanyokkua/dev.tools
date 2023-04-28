/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    testRegex: '\\.(test|spec)\\.(t|j)sx?$',
    transform: {
        '^.+\\.tsx?$': 'ts-jest',
    },
};