import { useLocalSearchParams, useRouter } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import { useEffect, useState } from "react";

import {
  Pressable,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from "react-native";

import { Colors } from "@/constants/theme";
import { books } from "@/data/books";
export default function BookDetailsScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const db = useSQLiteContext();

    const colorScheme = useColorScheme();
    const colors = Colors[colorScheme === 'dark' ? 'dark' : 'light'];
    const styles = createStyles(colors);

    const [isSaved, setIsSaved] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [saveMessage, setSaveMessage] = useState('');

    const book = books.find((item) => item.id === id);

    useEffect (() => {
      let isActive = true;

      async function checkSavedBook() {
        if (!book) return;

        try {
          const savedBook = await db.getFirstAsync<{ id: string }>(
            'SELECT id FROM library_books WHERE id = ?',
            book.id
          );

          if (isActive) {
            setIsSaved(savedBook !== null);
          }
        } catch (error) {
            console.error(
              'Kirjan tarkistaminen epäonnistui:', 
              error
            );
          }
        }
        
        checkSavedBook();

        return () => {
          isActive = false;
        };
      }, [db, book?.id]);

    async function handleAddToLibrary() {
      if (!book || isSaved || isSaving) return;

      setIsSaving(true);
      setSaveMessage('');

      try {
        const result = await db.runAsync(
          `INSERT OR IGNORE INTO library_books
          (id, title, author, year, description, status)
          VALUES (?, ?, ?, ?, ?, ?)`,
          book.id,
          book.title,
          book.author,
          book.year,
          book.description,
          'Lukulistalla'
        );

        setIsSaved(true);

        if (result.changes > 0) {
          setSaveMessage('Kirja lisättiin kirjahyllyyn!');
        } else {
          setSaveMessage('Kirja on kirjahyllyssä.');
        }
      } catch (error) {
        console.error(
          'Kirjan tallentaminen epäonnistui:',
          error
        );
        setSaveMessage('Kirjan tallentaminen epäonnistui.');
      } finally {
        setIsSaving(false);
      }
    }

    //Kirjan ouuttumisen takristus tulee tähän.
    if (!book) {
      return (
        <View>
          <Text>Kirjaa ei löytynyt.</Text>
        </View>
      );
    }

    return (
        <View style={styles.container}>
            <Pressable onPress={() => router.back()}>
                <Text style={styles.backButton}>← Takaisin</Text>
            </Pressable>

            <Text style={styles.title}>Kirjan tiedot</Text>

            <Text style={styles.info}>
                Kirjan tunniste: {id}
            </Text>

            <Pressable
              style={[
                styles.addButton,
                isSaved && styles.addButtonSaved,
              ]}
              onPress={handleAddToLibrary}
              disabled={isSaving || isSaved}
            >
              <Text
                style={[
                  styles.addButtonText,
                  isSaved && styles.addButtonSavedText,
                ]}
              >
                {isSaving
                  ? 'Tallennetaan...'
                  : isSaved
                    ? '✓ Kirjahyllyssä'
                  : 'Lisää kirjahyllyyn'}
              </Text>
            </Pressable>

            {saveMessage !== '' && (
              <Text style={styles.saveMessage}>
                {saveMessage}
              </Text>
            )}
        </View>
    );
}

const createStyles = (colors: typeof Colors.light | typeof Colors.dark) =>
  StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    paddingTop: 50,
    gap: 24,
    backgroundColor: colors.background,
  },
  backButton: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: '600',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: colors.text,
  },
  info: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  addButton: {
  backgroundColor: colors.primary,
  padding: 16,
  borderRadius: 12,
  alignItems: 'center',
},

addButtonSaved: {
  backgroundColor: colors.backgroundSelected,
},

addButtonText: {
  color: colors.lightButtonText,
  fontSize: 15,
  fontWeight: 'bold',
},

addButtonSavedText: {
  color: colors.text,
},

saveMessage: {
  fontSize: 14,
  color: colors.textSecondary,
  textAlign: 'center',
},
})