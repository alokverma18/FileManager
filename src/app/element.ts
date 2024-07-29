export interface FileElement {
    name: string;
    type: string;
    path: string;
    parent: string | null;
    size: number;
    children?: FileElement[];
}