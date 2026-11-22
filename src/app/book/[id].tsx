import { useLocalSearchParams, useRouter } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import { useEffect, useState } from "react";

import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useColorScheme,
  View
} from "react-native";

import { Colors } from "@/constants/theme";
import { Book } from "@/data/books";

import {
  addBookToLibrary,
  getLibraryBookById,
  removeBookFromLibrary
} from "@/data/library";
import { getOpenLibraryWorkDetails } from "@/services/openLibrary";

export default function BookDetailsScreen() {
    const { id, title, author, year, coverId, isbn } =
      useLocalSearchParams<{
        id: string;
        title?: string;
        author?: string;
        year?: string;
        coverId?: string;
        isbn?: string;
      }>();

    const router = useRouter();
    const db = useSQLiteContext();

    const colorScheme = useColorScheme();
    const colors = Colors[colorScheme === 'dark' ? 'dark' : 'light'];
    const styles = createStyles(colors);

    const [isSaved, setIsSaved] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [saveMessage, setSaveMessage] = useState('');

    const [description, setDescription] = useState<string | null>(null);

    const [detailCoverId, setDatailCoverId] = useState<number | null>(
      coverId ? Number(coverId) : null
    );

    const [isLoadingDetails, setIsLoadingDetails] = useState(true);
    const [detailsError, setDetailsError] = useState<string | null>(null);

    const book: Book | null = id && title
      ? {
          id,
          title,
          author: author || 'Tuntematon kirjailija',
          year: year || null,
          description,
          coverId: detailCoverId,
          isbn: isbn || null,
        }
      : null;

    useEffect (() => {
      if (!id) return;

      let isActive = true;

      const checkSavedBook = async () => {
        try {
          const savedBook = await getLibraryBookById(db, id);
          
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
    }, [db, id]);

    const handleAddToLibrary = async () => {
      if (!book || isSaving) return;

      try {
        await addBookToLibrary(db, book);
        setIsSaved(true);
        setSaveMessage('Kirja lisättiin kirjahyllyyn!');
      } catch (error) {
        console.error('Kirjan lisääminen epäonnistui:', error);
        setSaveMessage('Kirjan lisääminen epäonnistui.');
      } finally {
        setIsSaving(false);
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

    useEffect(() => {
      if (!id) return;

      const controller = new AbortController();

      const loadBookDetails = async () => {
        try {
          setIsLoadingDetails(true);
          setDetailsError(null);

          const details = await getOpenLibraryWorkDetails(
            id,
            controller.signal
          );

          if (!controller.signal.aborted) {
            setDescription(details.description);

            setDatailCoverId(
              details.coverId ?? ( coverId ? Number(coverId) : null)
            );
          }
        } catch (error) {
          if (controller.signal.aborted) return;

          console.error('Kirjan tietojen hakeminen epäonnistui:', error);

          setDetailsError('Kirjan lisätietojen hakeminen epäonnistui.');
        } finally {
          if (!controller.signal.aborted) {
            setIsLoadingDetails(false);
          }
        }
      };

      loadBookDetails();

      return () => {
        controller.abort();
      };
    }, [id, coverId]);

    //Kirjan ouuttumisen takristus tulee tähän.
    if (!book) {
      return (
        <View>
          <Text>Kirjaa ei löytynyt.</Text>
        </View>
      );
    }

    return (
        <ScrollView 
          style={{  flex: 1}}
          contentContainerStyle={styles.container}
          showsVerticalScrollIndicator={false}
        >
          <Pressable onPress={() => router.back()}>
            <Text style={styles.backButton}>← Takaisin</Text>
          </Pressable>

          {detailCoverId ? (
            <Image
              source={{
                uri: `https://covers.openlibrary.org/b/id/${detailCoverId}-M.jpg`,
              }}
              style={styles.coverImage}
              resizeMode="contain"
            />
          ) : (
            <View style={styles.coverPlaceholder}>
              <Text style={styles.coverPlaceholderText}>📖</Text>
              <Text style={styles.coverPlaceholderText}>
                Kansikuvaa ei saatavilla
              </Text>
            </View>
          )}
            <Text style={styles.title}>{book.title}</Text>

            <Text style={styles.info}>
                Kirjailija: {book.author}
            </Text>

            <Text style={styles.info}>
                Julkaisuvuosi: {book.year ?? 'Ei tiedossa'}
            </Text>

            {isLoadingDetails ? (
              <Text style={styles.info}>Haetaan kirjan kuvausta...</Text>
            ) : detailsError ? (
              <Text style={styles.info}>{detailsError}</Text>
            ): (
              <Text style={styles.info}>
                {book.description ?? 'Kirjalle ei ole saatavilla kuvausta.'}
              </Text>
            )}

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
        </ScrollView>
    );
}

const createStyles = (colors: typeof Colors.light | typeof Colors.dark) =>
  StyleSheet.create({
  container: {
    flexGrow: 1,
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
coverImage: {
  width: 180,
  height: 260,
  alignSelf: 'center',
  marginVertical: 20,
},

coverPlaceholder: {
  width: 180,
  height: 260,
  alignSelf: 'center',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: colors.backgroundElement,
  borderRadius: 10,
  marginVertical: 20,
},

coverPlaceholderText: {
  color: colors.textSecondary,
  fontSize: 14,
},
})