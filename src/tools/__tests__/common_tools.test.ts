import copy from 'copy-to-clipboard';
import { copyToClipboard, joinTerminalCommands } from '../common_tools';

jest.mock('copy-to-clipboard');

describe('clipboardUtils', () => {
    describe('copyToClipboard', () => {
        test('should copy text to clipboard', () => {
            const text = 'test text';
            copyToClipboard(text);
            expect(copy).toHaveBeenCalledWith(text);
        });
    });
});

describe('joinTerminalCommands', () => {
    describe('should return empty string on empty or null array', () => {
        test('test joinTerminalCommands with null', () => {
            expect(joinTerminalCommands(null)).toStrictEqual('');
        });
        test('test joinTerminalCommands with undefined', () => {
            expect(joinTerminalCommands(undefined)).toStrictEqual('');
        });
        test('test joinTerminalCommands with []', () => {
            expect(joinTerminalCommands([])).toStrictEqual('');
        });
    });
    describe('should return non empty string on valid input', () => {
        test('test joinTerminalCommands with 1 element', () => {
            expect(joinTerminalCommands(['git clone'])).toStrictEqual('git clone');
        });
        test('test joinTerminalCommands, with errors applicable', () => {
            expect(joinTerminalCommands(['git clone someRepo', 'git pull origin master', 'cd ..'], true)).toStrictEqual(
                'git clone someRepo & git pull origin master & cd ..',
            );
        });
        test('test joinTerminalCommands, with errors NOT applicable', () => {
            expect(
                joinTerminalCommands(['git clone someRepo', 'git pull origin master', 'cd ..'], false),
            ).toStrictEqual('git clone someRepo && git pull origin master && cd ..');
        });
    });
});
