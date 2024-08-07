export interface FileElement {
    name: string;
    type: string;
    path: string;
    size: number;
    date_created: Date;
    date_modified: Date;
    parent: string | null;
    children?: FileElement[];
}