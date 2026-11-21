import { Colors } from "@/constants/theme";
import { useFocusEffect } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import { useCallback, useState } from "react";
import { ScrollView, StyleSheet, Text, useColorScheme, View } from "react-native";

type LibraryBook = {
  id: string;
  title: string;
  author: string;
  year: string | null;
  description: string | null;
  status: string;
  added_at: string;
}

export default function LibraryScreen() {
  const db = useSQLiteContext();

  const [books, setBooks] = useState<LibraryBook[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme === 'dark' ? 'dark' : 'light'];
  const styles = createStyles(colors);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      async function loadBooks() {
        setIsLoading(true);
        setError(null);

        try {
          const savedBooks = await db.getAllAsync<LibraryBook>(
            `SELECT id, title, author, year, description, status, added_at
            FROM library_books
            ORDER BY added_at DESC`
          );

          if (isActive) {
            setBooks(savedBooks);
          }
        } catch (error) {
          console.error('Kirjojen hakeminen epäonnistui:', error);

          if(isActive) {
            setError('Kirjojen hakeminen epäonnistui.');
          }
        } finally {
          if (isActive) {
            setIsLoading(false);
          }
        }
      }

      loadBooks();

      return () => {
        isActive = false;
      };
    }, [db])
  );

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Otsikko */}
      <View>
          <Text style={styles.header}>LUKUKAVERI</Text>
          <Text style={styles.title}>Oma kirjahylly</Text>
          <Text style={styles.subtitle}>Kirajsi löytyvät täältä.</Text>
      </View>

      {/* Kirjojen määrä */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Kirjani</Text>
        <Text style={styles.bookCount}>
          {books.length} Kirjaa
        </Text>
      </View>

      {/* Lataustila */}
      {isLoading && (
        <Text style={styles.emptyText}>
          Ladataan kirjoja...
        </Text>
      )}

      {/* Virheilmoitus */}
      {error && (
        <Text style={styles.errorText}>
          {error}
        </Text>
      )}

      {/* Tyhjä kirjahylly */}
      {!isLoading && !error && books.length === 0 && (
        <Text style={styles.emptyText}>
          Kirjahyllysi on vielä tyhjä.
          Etsi kirjoja ja lisää niitä tänne!
        </Text>
      )}

      {/* Tallennetut kirjat */}
      {!isLoading && !error && (
        <View style={styles.bookList}>
          {books.map((book) => (
            <View key={book.id} style={styles.bookCard}>
              <View style={styles.bookCover}>
                <Text style={styles.coverIcon}>📖</Text>
              </View>

              <View style={styles.bookInfo}>
                <Text style={styles.bookTitle}>
                  {book.title}
                </Text>

                <Text style={styles.author}>
                  {book.author}
                </Text>

                <View style={styles.statusBadge}>
                  <Text style={styles.statusText}>
                    {book.status}
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}
 

const createStyles = (colors: typeof Colors.light | typeof Colors.dark) =>
StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      padding: 24,
      paddingTop: 40,
      paddingBottom: 40,
      gap: 24,
    },
    header: {
      gap: 8,
    },
    brand: {
      fontSize: 12,
      fontWeight: 'bold',
      letterSpacing: 2,
      color: colors.primary,
    },
    title: {
      fontSize: 28,
      fontWeight: 'bold',
      color: colors.text,
    },
    subtitle: {
      fontSize: 15,
      color: colors.textSecondary,
    },
    sectionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    sectionTitle: {
      fontSize: 19,
      fontWeight: 'bold',
      color: colors.text,
    },
    bookCount: {
      fontSize: 13,
      color: colors.textSecondary,
    },
    bookList: {
      gap: 14,
    },
    bookCard: {
      backgroundColor: colors.card,
      borderRadius: 16,
      padding: 14,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 16,
      borderWidth: 1,
      borderColor: colors.border,
    },
    bookCover: {
      width: 75,
      height: 100,
      backgroundColor: colors.backgroundSelected,
      borderRadius: 8,
      alignItems: 'center',
      justifyContent: 'center',
    },
    coverIcon: {
      fontSize: 30,
    },
    bookInfo: {
      flex: 1,
      gap: 8,
    },
    bookTitle: {
      fontSize: 16,
      fontWeight: 'bold',
      color: colors.text,
    },
    author: {
      fontSize: 13,
      color: colors.textSecondary,
    },
    statusBadge: {
      backgroundColor: colors.backgroundElement,
      alignSelf: 'flex-start',
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 8,
    },
    statusText: {
      fontSize: 12,
      fontWeight: '600',
      color: colors.primary,
    },
     emptyText: {
      fontSize: 14,
      color: colors.textSecondary,
      textAlign: 'center',
      paddingVertical: 24,
      lineHeight: 22,
    },
    errorText: {
      fontSize: 14,
      color: '#D9534F',
      textAlign: 'center',
      paddingVertical: 16,
    },
  });