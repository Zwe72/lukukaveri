import type { SQLiteDatabase } from "expo-sqlite";
import { Book } from "./books";

// Kirjan lukutilanteet
export type ReadingStatus =
    | 'Lukulistalla'
    | 'Kesken'
    | 'Luettu';

// Tietokantaan tallennetun kirjan tyypit
export type LibraryBook = {
    id: string;
    title: string;
    author: string;
    year: string | null;
    description: string | null;
    cover_id: number | null;
    isbn: string | null;
    status: ReadingStatus;
    added_at: string;
};

// Lisää kirja kirjahyllyyn
export async function addBookToLibrary(
    db: SQLiteDatabase,
    book: Book
): Promise<boolean> {
    const result = await db.runAsync(
        `INSERT OR IGNORE INTO library_books
        (id, title, author, year, description, status)
        VALUES(?, ?, ?, ?, ?, ?)`,
        book.id,
        book.title,
        book.author,
        book.year,
        book.description,
        'Lukulistalla'
    );

    return result.changes > 0;
}

// Hae kaikki kirjahyllyn kirjat
export async function getLibraryBooks(
    db: SQLiteDatabase
): Promise<LibraryBook[]> {
    return await db.getAllAsync<LibraryBook>(
        `SELECT *
        FROM library_books
        ORDER BY added_at DESC`
    );
}

// Hae yksittäinen kirja tunnisteella
export async function getLibraryBookById(
    db: SQLiteDatabase,
    bookId: string
): Promise<LibraryBook | null> {
    return await db.getFirstAsync<LibraryBook>(
        'SELECT * FROM library_books WHERE id = ?',
        bookId   
    );
}

// Muuta kirjan lukutilannetta
export async function updateBookStatus(
    db: SQLiteDatabase,
    bookId: string,
    status: ReadingStatus
): Promise<boolean> {
    const result = await db.runAsync(
       `UPDATE library_books
        SET status = ?
        WHERE id = ?`,
        status,
        bookId 
    );

    return result.changes > 0;
}

// Poista kirja kirjahyllystä
export async function removeBookFromLibrary(
    db: SQLiteDatabase,
    bookId: string
): Promise<boolean> {
    const result = await db.runAsync(
        'DELETE FROM library_books WHERE id = ?',
        bookId
    );

    return result.changes > 0; 
}