import type { Book } from '@/data/books';

const OPEN_LIBRARY_URL =  'https://openlibrary.org/search.json';

// Open Libraryn yksittäisen hakutuloksen tietotyyppi
type OpenLibrarySearchDocument = {
    key?: string;
    title?: string;
    author_name?: string[];
    first_publish_year?: number;
    cover_i?: number;
    isbn?: string[];
};

// Hakuvastauksen tietotyyppi
type OpenLibrarySearchResponse = {
    docs?: OpenLibrarySearchDocument[];
};

// Kirjojen hakeminen Open Librarysta
export async function searchOpenLibraryBooks(
    query: string,
    signal?: AbortSignal
): Promise<Book[]> {
    const searchTerm = query.trim();

    if (!searchTerm) {
        return [];
    }

    const fields =
    'key,title,author_name,first_publish_year,cover_i,isbn';

    const url =
    `${OPEN_LIBRARY_URL}?q=${encodeURIComponent(searchTerm)}` +
    `&fields=${encodeURIComponent(fields)}` +
    `&limit=20`;

    const response = await fetch(url, { signal });

    if (!response.ok) {
        throw new Error(
            `Open Library API -virhe: ${response.status}`
        );
    }

    const data =
        (await response.json()) as OpenLibrarySearchResponse;
    
    const results: Book[] = [];

    for (const item of data.docs ?? []) {
        if (!item.key || !item.title) {
            continue;
        }

        results.push({
            id: item.key.split('/').pop() ?? item.key,
            title: item.title,

            author:
                item.author_name?.join(', ') ??
                'Tuntematon kirjailija',
            
             year: item.first_publish_year
                ? String(item.first_publish_year)
                : null,

            description: null,

            coverId: item.cover_i ?? null,

            isbn: item.isbn?.[0] ?? null,
        });
    }

    return results;
}

// Open Libraryn yksittäisen kirjan tietojen tyyppi
type OpenLibraryWorkResponse = {
    title?: string;
    description?: string | {
        value?: string;
    };
    covers?: number[];
};

// Kirjan lisätietojen hakeminen
export async function getOpenLibraryWorkDetails(
    workId: string,
    signal?: AbortSignal
) {
    const normalizedId = workId
        .replace('/works/', '')
        .replace('.json', '');
    
    const response = await fetch(
        `https://openlibrary.org/works/${normalizedId}.json`,
        { signal }
    );

    if (!response.ok) {
        throw new Error(
            `Kirjan tietojen hakeminen epäonnistui: ${response.status}`
        );
    }

    const data =
        (await response.json()) as OpenLibraryWorkResponse;
    
    const description =
        typeof data.description === 'string'
            ? data.description
            : data.description?.value ?? null;

    return {
        description,
        coverId: data.covers?.[0] ?? null,
    };  
}

// ISBN-haun hakutuloksen tietotyyppi
type OpenLibraryIsbnDocument = {
    key?: string;
    title?: string;
    author_name?: string[];
    first_publish_year?: number;
    cover_i?: number;
};

// ISBN-haun vastaustyyppi
type OpenLibraryIsbnResponse = {
    docs?: OpenLibraryIsbnDocument[];
};

//Kirjan hakeminen ISBN-tunnuksella
export async function searchOpenLibraryByIsbn(
    isbn: string,
    signal?: AbortSignal
): Promise<Book | null> {
    const normalizedIsbn = isbn.replace(/[-\s]/g, '');

    const query = `isbn:${normalizedIsbn}`;

    const fields =
        'key,title,author_name,first_publish_year,cover_i';
    
    const url =
        `${OPEN_LIBRARY_URL}?q=${encodeURIComponent(query)}` +
        `&fields=${encodeURIComponent(fields)}` +
        '&limit=1';

    const response = await fetch(url, { signal });

    if (!response.ok) {
        throw new Error(
            `ISBN-haku epäonnistui: ${response.status}`
        );
    }

    const data = (await response.json()) as OpenLibraryIsbnResponse;

    const item = data.docs?.[0];

    if (!item?.key || !item.title) {
        return null;
    }

    return {
        id: item.key.split('/').pop() ?? item.key,
        title: item.title,
        author: item.author_name?.join(', ') ?? 'Tuntematon kirjailija',
        year: item.first_publish_year
        ? String(item.first_publish_year)
        : null,
        description: null,
        coverId: item.cover_i ?? null,
        isbn: normalizedIsbn,
    };
}