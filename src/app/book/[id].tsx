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

import {
  addBookToLibrary,
  getLibraryBookById,
  removeBookFromLibrary
} from "@/data/library";

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
      if (!book) return;

      let isActive = true;

      const checkSavedBook = async () => {
        try {
          const savedBook = await getLibraryBookById(db, book.id);
          
          if (isActive) {
            setIsSaved(savedBook !== null);
          }
        } catch (error) {
          console.error('Kirjan tarkistaminen epäonnistui:', error);
        }
      };
        
      checkSavedBook();

      return () => {
        isActive = false;
      };
    }, [db, book]);

    const handleAddToLibrary = async () => {
      if (!book) return;

      try {
        await addBookToLibrary(db, book);
        setIsSaved(true);
      } catch (error) {
        console.error('Kirjan lisääminen epäonnistui:', error);
      }
    };

    const handleRemoveFromLibrary = async () => {
      if (!book) return;

      try {
        await removeBookFromLibrary(db, book.id);
        setIsSaved(false);
      } catch (error) {
        console.error('Kirjan poistaminen epäonnistui:', error)
      }
    };

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

            {isSaved ? (
              <Pressable
                style={[
                  styles.addButton,
                  styles.addButtonSaved,
                ]}
                onPress={handleRemoveFromLibrary}
              >
                <Text
                  style={[
                    styles.addButtonText,
                    styles.addButtonSavedText,
                  ]}
                >
                  Poista kirjahyllystä
                </Text>
              </Pressable>
            ): (
              <Pressable
                style={styles.addButton}
                onPress={handleAddToLibrary}
                disabled={isSaving}
              >
                <Text style={styles.addButtonText}>
                  {isSaving ? 'Tallennetaan...' : 'Lisää kirjahyllyyn'}
                </Text>
              </Pressable>
            )}

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