import type { SQLiteDatabase } from 'expo-sqlite';

export async function initializeDatabase(db: SQLiteDatabase) {
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS library_books (
        id TEXT PRIMARY KEY NOT NULL,
        title TEXT NOT NULL,
        author TEXT NOT NULL,
        year TEXT,
        description TEXT,
        cover_id INTEGER,
        isbn TEXT,
        status TEXT NOT NULL DEFAULT 'Lukulistalla',
        notes TEXT,
        rating INTEGER,
        added_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
        );
    `);

    // Tarkistetaan nykyiset sarakkeet
    const columns = await db.getAllAsync<{ name: string }>(
        'PRAGMA table_info(library_books)'
    );

    // Lisätään puuttuvat sarakkeet
    if (!columns.some((column) => column.name === 'cover_id')) {
        await db.execAsync(
            'ALTER TABLE library_books ADD COLUMN cover_id INTEGER'
        );
    }

    if (!columns.some((column) => column.name === 'isbn')) {
        await db.execAsync(
            'ALTER TABLE library_books ADD COLUMN isbn TEXT'
        );
    }

    if (!columns.some((column) => column.name === 'notes')) {
        await db.execAsync(
            'ALTER TABLE library_books ADD COLUMN notes TEXT'
        );
    }

    if (!columns.some((column) => column.name === 'rating')) {
        await db.execAsync(
            'ALTER TABLE library_books ADD COLUMN rating INTEGER'
    );
    }
}