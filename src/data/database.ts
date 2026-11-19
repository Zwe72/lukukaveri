import type { SQLiteDatabase } from 'expo-sqlite';

export async function initializeDatabase(
    db: SQLiteDatabase
) {
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS library_books (
      id TEXT PRIMARY KEY NOT NULL,
      title TEXT NOT NULL,
      author TEXT NOT NULL,
      year TEXT,
      description TEXT,
      status TEXT NOT NULL DEFAULT 'Lukulistalla',
      added_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
     );
    `)
}