'use client';
import { type IDisposable, editor } from 'monaco-editor';
import React, { useCallback, useEffect, useRef, useState } from 'react';

import { DEFAULT_EXTENSION, DEFAULT_LANGUAGE_ID, DEFAULT_MIME_TYPE } from '@/common/constants';
import { useFileOpen } from '@/contexts/FileOpenContext';
import { useFileSaveDialog } from '@/contexts/FileSaveDialogContext';
import { useToast } from '@/contexts/ToasterContext';
import Select, { SelectItem } from '@/controls/Select';
import { ToastType } from '@/controls/toaster/types';
import ContentContainerGrid from '../../layouts/ContentContainerGrid';
import ContentContainerGridChild from '../../layouts/ContentContainerGridChild';
import ScrollableContentContainer from '../../layouts/ScrollableContentContainer';
import CodeEditor from '../editor/CodeEditor';
import {
    copyToClipboardFromEditor,
    getEditorContent,
    pasteFromClipboardToEditor,
    setEditorContent,
} from '../editor/code-editor-utils';
import { EditorProperties } from '../editor/types';
import Menubar from '../navigation/menubar/Menubar';
import { MenuBuilder } from '../navigation/menubar/utils';
import ColumnMenu, { AvailableFunction } from './ColumnMenu';

/**
 * Interface representing a view tool function.
 *
 * A ToolViewFunction defines an interactive operation that can be applied to text content within a user interface.
 *
 * @property {string} funcId - Unique identifier for the tool function.
 * @property {string} funcName - Human-readable name of the tool function.
 * @property {string=} funcDescription - Optional description providing details about the tool's purpose and behavior.
 * @property {function(string, (text: string) => void, (err: unknown) => void): void} func
 *   The main functionality is implemented by this tool. Accepts three parameters:
 *   1. text: Initial input content to be processed.
 *   2. onSuccess: Callback invoked when the operation completes successfully with a result string.
 *   3. onFailure: Callback invoked if an error occurs during processing, containing the error information.
 */
export type ToolViewFunction = {
    funcId: string;
    funcName: string;
    funcDescription?: string;
    func: (text: string, onSuccess: (text: string) => void, onFailure: (err: unknown) => void) => void;
};

/**
 * Represents a grouping of tool view functionalities within an application.
 * Each group is identified by a unique `funcGroupId` and contains a collection of related `ToolViewFunction`
 * objects that define individual actions or operations available in the grouped interface.
 *
 * @typedef {Object} ToolViewGroup
 * @property {string} funcGroupId - A unique identifier for this function group within the application's tool view
 *     hierarchy.
 * @property {string} funcGroupName - The human-readable name of the function group displayed to users in UI elements
 *     such as menus or panels.
 * @property {ToolViewFunction[]} functions - An array of `ToolViewFunction` objects that define the individual
 *     operations available in this group.
 */
export type ToolViewGroup = { funcGroupId: string; funcGroupName: string; functions: ToolViewFunction[] };

/**
 * Represents a mapping of function group names to their corresponding `ToolViewGroup` objects.
 * This data structure allows organizing and managing various tool view groups within an application.
 * Each entry in the map uses a unique string key to identify a specific function group,
 * with the associated value being the actual group object that contains the necessary functionality
 * for that particular grouping of tools or features.
 */
export type ToolViewFunctionGroups = Map<string, ToolViewGroup>;

/**
 * Represents the prop interface for a ToolView component that manages and displays function groups related to tools.
 *
 * @interface ToolViewProps
 *
 * @property {string} [toolChoseHeader] - Optional header text displayed above the tool selection area. If not
 *     provided, defaults to no header text.
 *
 * @property {(ToolViewFunctionGroups)} toolViewFunctionGroups - Required object that contains all function groups
 *     associated with the tools view. This property is essential for rendering and managing tool functions within the
 *     component.
 *
 * @property {boolean} [searchable] - When true, adds a search filter input above the function buttons.
 *
 * @property {boolean} [showCharCount] - When true, displays character and word count in the input toolbar.
 */
type ToolViewProps = {
    toolChoseHeader?: string;
    toolViewFunctionGroups: ToolViewFunctionGroups;
    toolEditorsLangId?: string;
    searchable?: boolean;
    showCharCount?: boolean;
};

type ToolViewState = { selectItems: SelectItem[]; selectedItem: SelectItem; availableFunctions: AvailableFunction[] };

/**
 * Maps tool functions from a group into an array of available functions.
 *
 * @param {ToolViewGroup} group - The tool view group containing the functions to map.
 * @param {React.RefObject<editor.IStandaloneCodeEditor | null>} leftRef - Reference to the left code editor.
 * @param {React.RefObject<editor.IStandaloneCodeEditor | null>} rightRef - Reference to the right code editor.
 * @param {ReturnType<typeof useToast>['showToast']} showToast - Function to display toast notifications.
 *
 * @returns {AvailableFunction[]} An array of available functions with their names and click handlers.
 */
const mapFunctionsInGroup = (
    group: ToolViewGroup,
    leftRef: React.RefObject<editor.IStandaloneCodeEditor | null>,
    rightRef: React.RefObject<editor.IStandaloneCodeEditor | null>,
    showToast: ReturnType<typeof useToast>['showToast'],
): AvailableFunction[] => {
    return group.functions.map((fn) => ({
        name: fn.funcName,
        onClick: (): void => {
            const input = getEditorContent(leftRef);
            fn.func(
                input,
                (output): void => {
                    setEditorContent(rightRef, output);
                    showToast({ message: `${fn.funcName} executed`, type: ToastType.INFO });
                },
                (err): void => {
                    console.error(err);
                    showToast({ message: `Failed to execute ${fn.funcName}`, type: ToastType.ERROR });
                },
            );
        },
    }));
};

/**
 * Creates the initial state for a tool view.
 *
 * @param groups - A collection of function groups to be displayed in the tool view.
 * @param leftRef - Reference object containing the editor instance on the left side of the split view.
 * @param rightRef - Reference object containing the editor instance on the right side of the split view.
 * @param showToast - Function to display toast notifications within the application.
 *
 * @returns An initialized state object for the tool view, including selected items and available functions.
 */
const createInitialState = (
    groups: ToolViewFunctionGroups,
    leftRef: React.RefObject<editor.IStandaloneCodeEditor | null>,
    rightRef: React.RefObject<editor.IStandaloneCodeEditor | null>,
    showToast: ReturnType<typeof useToast>['showToast'],
): ToolViewState => {
    const keys = Array.from(groups.keys());
    if (keys.length === 0) {
        return { selectItems: [], selectedItem: { itemId: '', displayText: '' }, availableFunctions: [] };
    }
    const firstKey = keys[0];
    const firstGroup = groups.get(firstKey)!;
    const items = keys.map((k) => {
        const group = groups.get(k)!;
        return { itemId: group.funcGroupId, displayText: group.funcGroupName };
    });
    return {
        selectItems: items,
        selectedItem: { itemId: firstGroup.funcGroupId, displayText: firstGroup.funcGroupName },
        availableFunctions: mapFunctionsInGroup(firstGroup, leftRef, rightRef, showToast),
    };
};

const ToolView: React.FC<ToolViewProps> = ({
    toolChoseHeader,
    toolViewFunctionGroups,
    toolEditorsLangId = DEFAULT_LANGUAGE_ID,
    searchable,
    showCharCount,
}) => {
    const { showFileOpenDialog } = useFileOpen();
    const { showFileSaveDialog } = useFileSaveDialog();
    const { showToast } = useToast();

    const leftEditorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
    const rightEditorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
    const contentListenerRef = useRef<IDisposable | null>(null);
    const [supportedExtensions, setSupportedExtensions] = useState<string[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [charCount, setCharCount] = useState<{ chars: number; words: number } | null>(null);

    /** Reset state if groups ever change */
    const [toolState, setToolState] = useState<ToolViewState>(() =>
        createInitialState(toolViewFunctionGroups, leftEditorRef, rightEditorRef, showToast),
    );
    useEffect(() => {
        setToolState(createInitialState(toolViewFunctionGroups, leftEditorRef, rightEditorRef, showToast));
    }, [toolViewFunctionGroups]);

    /** Dispose content listener on unmount */
    useEffect(() => {
        return (): void => {
            contentListenerRef.current?.dispose();
        };
    }, []);

    /** Menubar callbacks for left editor */
    const handleLeftMount = useCallback((props: EditorProperties): void => {
        leftEditorRef.current = props.editor;
        setSupportedExtensions(props.supportedExtensions);
        if (showCharCount) {
            const updateCount = (text: string): void => {
                setCharCount({ chars: text.length, words: text.trim() === '' ? 0 : text.trim().split(/\s+/).length });
            };
            contentListenerRef.current?.dispose();
            contentListenerRef.current = props.editor.onDidChangeModelContent(() => {
                updateCount(props.editor.getValue());
            });
            updateCount(props.editor.getValue());
        }
    }, []);
    const handleLeftOpen = (): void => {
        showFileOpenDialog({
            supportedFiles: supportedExtensions,
            onSuccess: (fileInfo): void => {
                if (!fileInfo) {
                    showToast({ message: 'No file chosen', type: ToastType.WARNING });
                    return;
                }
                setEditorContent(leftEditorRef, fileInfo.content);
                showToast({ message: 'File opened', type: ToastType.INFO });
            },
            onFailure: (err): void => {
                console.error(err);
                showToast({ message: 'Could not open file', type: ToastType.ERROR });
            },
        });
    };
    const handleLeftPaste = (): void => {
        pasteFromClipboardToEditor(leftEditorRef, () => {}, showToast);
    };
    const handleLeftCopy = (): void => {
        copyToClipboardFromEditor(leftEditorRef, showToast);
    };
    const handleLeftClear = (): void => {
        setEditorContent(leftEditorRef, '');
    };

    /** Menubar callbacks for right editor */
    const handleRightMount = useCallback((props: EditorProperties) => {
        rightEditorRef.current = props.editor;
    }, []);
    const handleRightSave = (): void => {
        const txt = getEditorContent(rightEditorRef);
        showFileSaveDialog({
            fileContent: txt,
            fileName: 'Untitled',
            fileExtension: DEFAULT_EXTENSION,
            mimeType: DEFAULT_MIME_TYPE,
            availableExtensions: supportedExtensions,
        });
    };
    const handleRightCopy = (): void => {
        copyToClipboardFromEditor(rightEditorRef, showToast);
    };
    const handleRightClear = (): void => {
        setEditorContent(rightEditorRef, '');
    };
    const handleUseAsInput = (): void => {
        const out = getEditorContent(rightEditorRef);
        setEditorContent(leftEditorRef, out);
        setEditorContent(rightEditorRef, '');
    };

    /** Build Menubars */
    const leftMenu = MenuBuilder.newBuilder()
        .addButton('open-file', 'Open', handleLeftOpen)
        .addButton('paste', 'Paste', handleLeftPaste)
        .addButton('copy', 'Copy', handleLeftCopy)
        .addButton('clear', 'Clear', handleLeftClear)
        .build();
    const rightMenu = MenuBuilder.newBuilder()
        .addButton('save', 'Save', handleRightSave)
        .addButton('copy', 'Copy', handleRightCopy)
        .addButton('clear', 'Clear', handleRightClear)
        .addButton('use-input', 'Use as Input', handleUseAsInput)
        .build();

    /** When the user picks a new function-group */
    const onSelect = (item: SelectItem): void => {
        setSearchQuery('');
        setToolState((prev) => {
            const grp = toolViewFunctionGroups.get(item.itemId);
            return {
                ...prev,
                selectedItem: item,
                availableFunctions: grp ? mapFunctionsInGroup(grp, leftEditorRef, rightEditorRef, showToast) : [],
            };
        });
    };

    const isMoreThanOneGroup = toolViewFunctionGroups.size > 1;

    const lowerQuery = searchQuery.toLowerCase();
    const filteredFunctions =
        searchable && searchQuery.trim()
            ? toolState.availableFunctions.filter((fn) => fn.name.toLowerCase().includes(lowerQuery))
            : toolState.availableFunctions;

    return (
        <ContentContainerGrid>
            <ContentContainerGridChild>
                {showCharCount ? (
                    <div className="menubar-with-count">
                        <Menubar menuItems={leftMenu} />
                        {charCount !== null && (
                            <span className="char-count-badge">
                                {charCount.chars} chars · {charCount.words} words
                            </span>
                        )}
                    </div>
                ) : (
                    <Menubar menuItems={leftMenu} />
                )}
                <div className="editor-fill">
                    <CodeEditor
                        minimap={false}
                        onEditorMounted={handleLeftMount}
                        languageId={toolEditorsLangId}
                        height="100%"
                    />
                </div>
            </ContentContainerGridChild>

            <ContentContainerGridChild>
                {toolChoseHeader && <h3>{toolChoseHeader}</h3>}
                {isMoreThanOneGroup && (
                    <>
                        <Select
                            items={toolState.selectItems}
                            selectedItem={toolState.selectedItem}
                            onSelect={onSelect}
                            colorStyle="tertiary-color"
                        />
                        <br />
                    </>
                )}
                {searchable && (
                    <input
                        type="text"
                        placeholder="Filter actions…"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="func-search-input"
                        aria-label="Filter functions"
                    />
                )}
                <ScrollableContentContainer>
                    <ColumnMenu availableFunctions={filteredFunctions} />
                </ScrollableContentContainer>
            </ContentContainerGridChild>

            <ContentContainerGridChild>
                <Menubar menuItems={rightMenu} />
                <div className="editor-fill">
                    <CodeEditor
                        minimap={false}
                        wordWrap={true}
                        isReadOnly
                        onEditorMounted={handleRightMount}
                        languageId={toolEditorsLangId}
                        height="100%"
                    />
                </div>
            </ContentContainerGridChild>
        </ContentContainerGrid>
    );
};

export default ToolView;
