import { AiToolCategory } from '@/common/ai-tools-data';
import { act, renderHook } from '@testing-library/react';
import useAiToolsTransfer from '../src/components/page-specific/ai-tools-setup/useAiToolsTransfer';

describe('useAiToolsTransfer', () => {
    describe('initial state', () => {
        it('has null platform, both methodFilter, empty categoryFilter and searchTerm', () => {
            const { result } = renderHook(() => useAiToolsTransfer());
            expect(result.current.state.platform).toBeNull();
            expect(result.current.state.methodFilter).toBe('both');
            expect(result.current.state.categoryFilter).toBe('');
            expect(result.current.state.searchTerm).toBe('');
        });

        it('available is [] when no platform is selected', () => {
            const { result } = renderHook(() => useAiToolsTransfer());
            expect(result.current.state.available).toEqual([]);
        });

        it('selected is []', () => {
            const { result } = renderHook(() => useAiToolsTransfer());
            expect(result.current.state.selected).toEqual([]);
        });

        it('commands is []', () => {
            const { result } = renderHook(() => useAiToolsTransfer());
            expect(result.current.state.commands).toEqual([]);
        });

        it('combined is null', () => {
            const { result } = renderHook(() => useAiToolsTransfer());
            expect(result.current.state.combined).toBeNull();
        });

        it('canBuild is false', () => {
            const { result } = renderHook(() => useAiToolsTransfer());
            expect(result.current.state.canBuild).toBe(false);
        });
    });

    describe('setPlatform', () => {
        it('sets platform to macos', () => {
            const { result } = renderHook(() => useAiToolsTransfer());

            act(() => {
                result.current.handlers.setPlatform('macos');
            });

            expect(result.current.state.platform).toBe('macos');
        });

        it('populates available with 16 tools after setting platform to macos', () => {
            const { result } = renderHook(() => useAiToolsTransfer());

            act(() => {
                result.current.handlers.setPlatform('macos');
            });

            expect(result.current.state.available).toHaveLength(15);
        });

        it('each item in available has a valid selectedOptionId after setting macos', () => {
            const { result } = renderHook(() => useAiToolsTransfer());

            act(() => {
                result.current.handlers.setPlatform('macos');
            });

            for (const item of result.current.state.available) {
                expect(item.selectedOptionId).toBeTruthy();
                const validIds = item.tool.installOptions.map((o) => o.id);
                expect(validIds).toContain(item.selectedOptionId);
            }
        });

        it('clears selected when platform is changed', () => {
            const { result } = renderHook(() => useAiToolsTransfer());

            act(() => {
                result.current.handlers.setPlatform('macos');
            });

            const toolsToAdd = result.current.state.available.slice(0, 2);

            act(() => {
                result.current.handlers.add(toolsToAdd);
            });

            expect(result.current.state.selected).toHaveLength(2);

            act(() => {
                result.current.handlers.setPlatform('linux');
            });

            expect(result.current.state.selected).toEqual([]);
        });
    });

    describe('add and remove', () => {
        it('add moves tools from available to selected', () => {
            const { result } = renderHook(() => useAiToolsTransfer());

            act(() => {
                result.current.handlers.setPlatform('macos');
            });

            const toolsToAdd = result.current.state.available.slice(0, 3);
            const addedIds = toolsToAdd.map((t) => t.tool.id);

            act(() => {
                result.current.handlers.add(toolsToAdd);
            });

            expect(result.current.state.selected).toHaveLength(3);
            for (const id of addedIds) {
                expect(result.current.state.selected.find((s) => s.tool.id === id)).toBeDefined();
            }
        });

        it('added tools no longer appear in available', () => {
            const { result } = renderHook(() => useAiToolsTransfer());

            act(() => {
                result.current.handlers.setPlatform('macos');
            });

            const toolsToAdd = result.current.state.available.slice(0, 3);
            const addedIds = toolsToAdd.map((t) => t.tool.id);

            act(() => {
                result.current.handlers.add(toolsToAdd);
            });

            for (const id of addedIds) {
                expect(result.current.state.available.find((a) => a.tool.id === id)).toBeUndefined();
            }
        });

        it('remove moves tools from selected back to available', () => {
            const { result } = renderHook(() => useAiToolsTransfer());

            act(() => {
                result.current.handlers.setPlatform('macos');
            });

            const toolsToAdd = result.current.state.available.slice(0, 3);

            act(() => {
                result.current.handlers.add(toolsToAdd);
            });

            const toolsToRemove = result.current.state.selected.slice(0, 2);
            const removedIds = toolsToRemove.map((t) => t.tool.id);

            act(() => {
                result.current.handlers.remove(toolsToRemove);
            });

            expect(result.current.state.selected).toHaveLength(1);
            expect(result.current.state.selected.find((s) => removedIds.includes(s.tool.id))).toBeUndefined();

            for (const id of removedIds) {
                expect(result.current.state.available.find((a) => a.tool.id === id)).toBeDefined();
            }
        });
    });

    describe('overrideOption', () => {
        it('updates selectedOptionId for the specified tool in selected', () => {
            const { result } = renderHook(() => useAiToolsTransfer());

            act(() => {
                result.current.handlers.setPlatform('macos');
            });

            const claudeCode = result.current.state.available.find((a) => a.tool.id === 'claude-code')!;

            act(() => {
                result.current.handlers.add([claudeCode]);
            });

            act(() => {
                result.current.handlers.overrideOption('claude-code', 'npm');
            });

            const updated = result.current.state.selected.find((s) => s.tool.id === 'claude-code');
            expect(updated?.selectedOptionId).toBe('npm');
        });
    });

    describe('build', () => {
        it('after add + build, commands has one entry per selected tool', () => {
            const { result } = renderHook(() => useAiToolsTransfer());

            act(() => {
                result.current.handlers.setPlatform('macos');
            });

            const toolsToAdd = result.current.state.available.slice(0, 2);

            act(() => {
                result.current.handlers.add(toolsToAdd);
            });

            act(() => {
                result.current.handlers.build();
            });

            expect(result.current.state.commands).toHaveLength(2);
        });

        it('each command entry has the correct command string matching the selected option', () => {
            const { result } = renderHook(() => useAiToolsTransfer());

            act(() => {
                result.current.handlers.setPlatform('macos');
            });

            const claudeCode = result.current.state.available.find((a) => a.tool.id === 'claude-code')!;

            act(() => {
                result.current.handlers.add([claudeCode]);
            });

            act(() => {
                result.current.handlers.build();
            });

            const selectedOption = claudeCode.tool.installOptions.find((o) => o.id === claudeCode.selectedOptionId);
            expect(result.current.state.commands).toHaveLength(1);
            expect(result.current.state.commands[0].command).toBe(selectedOption?.command);
        });

        it('combined has all commands joined with " && "', () => {
            const { result } = renderHook(() => useAiToolsTransfer());

            act(() => {
                result.current.handlers.setPlatform('macos');
            });

            const toolsToAdd = result.current.state.available.slice(0, 3);

            act(() => {
                result.current.handlers.add(toolsToAdd);
            });

            act(() => {
                result.current.handlers.build();
            });

            const commandStrings = result.current.state.commands.map((c) => c.command);
            expect(result.current.state.combined?.command).toBe(commandStrings.join(' && '));
        });
    });

    describe('reset', () => {
        it('after build, reset() clears commands and combined', () => {
            const { result } = renderHook(() => useAiToolsTransfer());

            act(() => {
                result.current.handlers.setPlatform('macos');
            });

            const toolsToAdd = result.current.state.available.slice(0, 2);

            act(() => {
                result.current.handlers.add(toolsToAdd);
            });

            act(() => {
                result.current.handlers.build();
            });

            expect(result.current.state.commands).toHaveLength(2);
            expect(result.current.state.combined).not.toBeNull();

            act(() => {
                result.current.handlers.reset();
            });

            expect(result.current.state.commands).toEqual([]);
            expect(result.current.state.combined).toBeNull();
        });

        it('after reset, platform and selected are preserved', () => {
            const { result } = renderHook(() => useAiToolsTransfer());

            act(() => {
                result.current.handlers.setPlatform('macos');
            });

            const toolsToAdd = result.current.state.available.slice(0, 2);
            const addedIds = toolsToAdd.map((t) => t.tool.id);

            act(() => {
                result.current.handlers.add(toolsToAdd);
            });

            act(() => {
                result.current.handlers.build();
            });

            act(() => {
                result.current.handlers.reset();
            });

            expect(result.current.state.platform).toBe('macos');
            expect(result.current.state.selected).toHaveLength(2);
            for (const id of addedIds) {
                expect(result.current.state.selected.find((s) => s.tool.id === id)).toBeDefined();
            }
        });
    });

    describe('canBuild', () => {
        it('is false when platform is null', () => {
            const { result } = renderHook(() => useAiToolsTransfer());
            expect(result.current.state.canBuild).toBe(false);
        });

        it('is false when platform is set but no tools are selected', () => {
            const { result } = renderHook(() => useAiToolsTransfer());

            act(() => {
                result.current.handlers.setPlatform('macos');
            });

            expect(result.current.state.selected).toHaveLength(0);
            expect(result.current.state.canBuild).toBe(false);
        });

        it('is true when platform is set and at least one tool is selected', () => {
            const { result } = renderHook(() => useAiToolsTransfer());

            act(() => {
                result.current.handlers.setPlatform('macos');
            });

            const toolToAdd = result.current.state.available[0];

            act(() => {
                result.current.handlers.add([toolToAdd]);
            });

            expect(result.current.state.canBuild).toBe(true);
        });
    });

    describe('filters', () => {
        it('setMethodFilter platform-specific on windows excludes Gemini CLI, Goose, Aider, Cursor', () => {
            const { result } = renderHook(() => useAiToolsTransfer());

            act(() => {
                result.current.handlers.setPlatform('windows');
            });

            act(() => {
                result.current.handlers.setMethodFilter('platform-specific');
            });

            const ids = result.current.state.available.map((a) => a.tool.id);
            expect(ids).not.toContain('gemini-cli');
            expect(ids).not.toContain('goose');
            expect(ids).not.toContain('aider');
            expect(ids).not.toContain('cursor');
        });

        it('setSearchTerm cursor with macos platform: only Cursor appears in available', () => {
            const { result } = renderHook(() => useAiToolsTransfer());

            act(() => {
                result.current.handlers.setPlatform('macos');
            });

            act(() => {
                result.current.handlers.setSearchTerm('cursor');
            });

            expect(result.current.state.available).toHaveLength(1);
            expect(result.current.state.available[0].tool.id).toBe('cursor');
        });

        it('setCategoryFilter LOCAL_LLM with macos platform: no tools appear in available', () => {
            const { result } = renderHook(() => useAiToolsTransfer());

            act(() => {
                result.current.handlers.setPlatform('macos');
            });

            act(() => {
                result.current.handlers.setCategoryFilter(AiToolCategory.LOCAL_LLM);
            });

            expect(result.current.state.available).toHaveLength(0);
        });
    });
});
