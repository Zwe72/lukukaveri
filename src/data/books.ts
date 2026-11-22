
export type Book = {
    id: string;
    title: string;
    author: string;
    year: string | null;
    description: string | null;
    coverId?: number | null;
    isbn?: string | null;
};

