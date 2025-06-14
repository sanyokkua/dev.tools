export interface ITool<T> {
    text: string;
    description?: string;
    toolFunction: T;
    metadata?: { [key: string]: unknown };
}

export type IToolList<T> = { tools: ITool<T>[] };
