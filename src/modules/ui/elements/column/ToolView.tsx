'use client';
import { editor } from 'monaco-editor';
import React, { useCallback, useEffect, useRef, useState } from 'react';

import { DEFAULT_EXTENSION, DEFAULT_LANGUAGE_ID, DEFAULT_MIME_TYPE } from '@/common/constants';
import { useFileOpen } from '@/contexts/FileOpenContext';
import { useFileSaveDialog } from '@/contexts/FileSaveDialogContext';
import { useToast } from '@/contexts/ToasterContext';
import Select, { SelectItem } from '@/controls/Select';
import { ToastType } from '@/controls/toaster/types';
import ContentContainerGrid from '@/layout/ContentContainerGrid';
import ContentContainerGridChild from '@/layout/ContentContainerGridChild';
import ScrollableContentContainer from '@/layout/ScrollableContentContainer';
import CodeEditor from '@/modules/ui/elements/editor/CodeEditor';
import {
    copyToClipboardFromEditor,
    getEditorContent,
    pasteFromClipboardToEditor,
    setEditorContent,
} from '@/modules/ui/elements/editor/code-editor-utils';
import { EditorProperties } from '@/modules/ui/elements/editor/types';
import Menubar from '@/modules/ui/elements/navigation/menubar/Menubar';
import { MenuBuilder } from '@/modules/ui/elements/navigation/menubar/utils';
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
 * @property {string} funcGroupId - A unique identifier for this function group within the application's tool view hierarchy.
 * @property {string} funcGroupName - The human-readable name of the function group displayed to users in UI elements such as menus or panels.
 * @property {ToolViewFunction[]} functions - An array of `ToolViewFunction` objects that define the individual operations available in this group.
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
 * @property {string} [toolChoseHeader] - Optional header text displayed above the tool selection area. If not provided, defaults to no header text.
 *
 * @property {(ToolViewFunctionGroups)} toolViewFunctionGroups - Required object that contains all function groups associated with the tools view.
 * This property is essential for rendering and managing tool functions within the component.
 */
type ToolViewProps = {
    toolChoseHeader?: string;
    toolViewFunctionGroups: ToolViewFunctionGroups;
    toolEditorsLangId?: string;
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
        onClick: () => {
            const input = getEditorContent(leftRef);
            fn.func(
                input,
                (output) => {
                    setEditorContent(rightRef, output);
                    showToast({ message: `${fn.funcName} executed`, type: ToastType.INFO });
                },
                (err) => {
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
}) => {
    const { showFileOpenDialog } = useFileOpen();
    const { showFileSaveDialog } = useFileSaveDialog();
    const { showToast } = useToast();

    const leftEditorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
    const rightEditorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
    const [supportedExtensions, setSupportedExtensions] = useState<string[]>([]);

    /** Reset state if groups ever change */
    const [toolState, setToolState] = useState<ToolViewState>(() =>
        createInitialState(toolViewFunctionGroups, leftEditorRef, rightEditorRef, showToast),
    );
    useEffect(() => {
        setToolState(createInitialState(toolViewFunctionGroups, leftEditorRef, rightEditorRef, showToast));
    }, [toolViewFunctionGroups]);

    /** Menubar callbacks for left editor */
    const handleLeftMount = useCallback((props: EditorProperties) => {
        leftEditorRef.current = props.editor;
        setSupportedExtensions(props.supportedExtensions);
    }, []);
    const handleLeftOpen = () => {
        showFileOpenDialog({
            supportedFiles: supportedExtensions,
            onSuccess: (fileInfo) => {
                if (!fileInfo) {
                    showToast({ message: 'No file chosen', type: ToastType.WARNING });
                    return;
                }
                setEditorContent(leftEditorRef, fileInfo.content);
                showToast({ message: 'File opened', type: ToastType.INFO });
            },
            onFailure: (err) => {
                console.error(err);
                showToast({ message: 'Could not open file', type: ToastType.ERROR });
            },
        });
    };
    const handleLeftPaste = () => {
        pasteFromClipboardToEditor(leftEditorRef);
    };
    const handleLeftCopy = () => {
        copyToClipboardFromEditor(leftEditorRef);
    };
    const handleLeftClear = () => {
        setEditorContent(leftEditorRef, '');
    };

    /** Menubar callbacks for right editor */
    const handleRightMount = useCallback((props: EditorProperties) => {
        rightEditorRef.current = props.editor;
    }, []);
    const handleRightSave = () => {
        const txt = getEditorContent(rightEditorRef);
        showFileSaveDialog({
            fileContent: txt,
            fileName: 'Untitled',
            fileExtension: DEFAULT_EXTENSION,
            mimeType: DEFAULT_MIME_TYPE,
            availableExtensions: supportedExtensions,
        });
    };
    const handleRightCopy = () => {
        copyToClipboardFromEditor(rightEditorRef);
    };
    const handleRightClear = () => {
        setEditorContent(rightEditorRef, '');
    };
    const handleUseAsInput = () => {
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

    /** When the user picks a new function‐group */
    const onSelect = (item: SelectItem) => {
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

    return (
        <ContentContainerGrid>
            <ContentContainerGridChild>
                <Menubar menuItems={leftMenu} />
                <CodeEditor minimap={false} onEditorMounted={handleLeftMount} languageId={toolEditorsLangId} />
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
                <ScrollableContentContainer>
                    <ColumnMenu availableFunctions={toolState.availableFunctions} />
                </ScrollableContentContainer>
            </ContentContainerGridChild>

            <ContentContainerGridChild>
                <Menubar menuItems={rightMenu} />
                <CodeEditor
                    minimap={false}
                    isReadOnly
                    onEditorMounted={handleRightMount}
                    languageId={toolEditorsLangId}
                />
            </ContentContainerGridChild>
        </ContentContainerGrid>
    );
};

export default ToolView;
