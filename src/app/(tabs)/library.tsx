import { Colors } from "@/constants/theme";
import { Image } from "expo-image";
import { useFocusEffect, useRouter } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import { useCallback, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, useColorScheme, View } from "react-native";

import {
  getLibraryBooks,
  ReadingStatus,
  removeBookFromLibrary,
  updateBookStatus,
  type LibraryBook
} from "@/data/library";

export default function LibraryScreen() {
  const db = useSQLiteContext();

  const router = useRouter();

  const [books, setBooks] = useState<LibraryBook[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [updatingBookId, setUpdateingBookId] = useState<string | null>(null);

  const readingStatuses: ReadingStatus[] = [
    'Lukulistalla',
    'Kesken',
    'Luettu',
  ];
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme === 'dark' ? 'dark' : 'light'];
  const styles = createStyles(colors);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      const loadBooks = async () => {
        try {
          setIsLoading(true);
          setError('');

          const savedBooks = await getLibraryBooks(db);

          if(isActive) {
            setBooks(savedBooks);
          }
        } catch (error) {
          console.error('Kirjojen hakeminen epäonnistui:', error);

          if (isActive) {
            setError('Kirjojen lataaminen epäonnistui.');
          }
        } finally {
          if (isActive) {
            setIsLoading(false);
          }
        }
      };

      loadBooks();

      return () => {
        isActive = false;
      };
    }, [db])
  );

  const handleRemoveBook = async (bookId: string) => {
    try {
      await removeBookFromLibrary(db, bookId);

      setBooks((currentBooks) =>
        currentBooks.filter((book) => book.id !== bookId)
      );
    } catch (error) {
      console.error('Kirjan poistaminen epäonnistui:', error);
    }
  };

  const handleUpdateStatus = async (
    bookId: string,
    status: ReadingStatus
  ) => {
    try {
      setUpdateingBookId(bookId);

      const updated = await updateBookStatus(db, bookId, status);

      if(updated) {
        setBooks((currentBooks) =>
          currentBooks.map((book) =>
            book.id === bookId
              ? { ...book, status }
              : book
          )
        );
      }
    } catch (error) {
      console.error('Lukutilan päivittäminen epäonnistui:', error);
    } finally {
      setUpdateingBookId(null);
    }
  };

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
              <Pressable
                style={styles.bookCover}
                onPress={() =>
                  router.push({
                    pathname: '/book/[id]',
                    params: {
                      id: book.id,
                      title: book.title,
                      author: book.author,
                      year: book.year ?? '',
                      coverId: book.cover_id != null
                        ? String(book.cover_id)
                        : '',
                      isbn: book.isbn ?? '',
                    },
                  })
                }
                accessibilityRole="button"
                accessibilityLabel={`Avaa kirjan ${book.title} tiedot`}
              >
                {book.cover_id ? (
                  <Image
                    source={{
                      uri: `https://covers.openlibrary.org/b/id/${book.cover_id}-M.jpg`,
                    }}
                    style={styles.bookCoverImage}
                    contentFit="contain"
                    cachePolicy="disk"
                    transition={150}
                  />
                ) : (
                  <Text style={styles.coverIcon}>📖</Text>
                )}
              </Pressable>

              <View style={styles.bookInfo}>
                <Pressable
                  onPress={() =>
                    router.push({
                      pathname: '/book/[id]',
                      params: {
                        id: book.id,
                        title: book.title,
                        author: book.author,
                        year: book.year ?? '',
                        coverId: book.cover_id != null
                          ? String(book.cover_id)
                          : '',
                        isbn: book.isbn ?? '',
                      },
                    })
                  }
                  accessibilityRole="button"
                  accessibilityLabel={`Avaa kirjan ${book.title} tiedot`}
                >
                  {/* Kirjan nimi */}
                  <Text style={styles.bookTitle}>
                    {book.title}
                  </Text>
                </Pressable>

                {/* Kirjailijan nimi */}
                <Text style={styles.author}>
                  {book.author}
                </Text>

                {/* Kirjan arvosana */}
                <View style={styles.ratingDisplay}>
                  <View style={styles.ratingStars}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Text
                        key={star}
                        style={[
                          styles.ratingStar,
                          book.rating !== null &&
                            star <= book.rating &&
                            styles.ratingStarActive,
                        ]}
                      >
                        {book.rating !== null && star <= book.rating
                          ? '★'
                          : '☆'}
                      </Text>
                    ))}
                  </View>

                  <Text style={styles.ratingText}>
                    {book.rating !== null
                      ? `${book.rating}/5`
                      : 'Ei arviota'}
                  </Text>
                </View>

                {/* Lukutilan valinta */}
                <Text style={styles.statusLabel}>
                  Lukutila
                </Text>

                <View style={styles.statusOptions}>
                  {readingStatuses.map((status) => {
                    const isSelected = book.status === status;

                    return (
                      <Pressable
                        key={status}
                        style={[
                          styles.statusOption,
                          isSelected && styles.statusOptionActive,
                        ]}
                        onPress={() => handleUpdateStatus(book.id, status)}
                        disabled={updatingBookId === book.id}
                        accessibilityRole="button"
                        accessibilityState={{
                          selected: isSelected,
                          disabled: updatingBookId === book.id,
                        }}
                      >
                        <Text
                          style={[
                            styles.statusOptionText,
                            isSelected && styles.statusOptionTextActive,
                          ]}
                        >
                          {status}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>

                {/* Kirjan poistaminen */}
                <Pressable 
                  style={styles.removeButton}
                  onPress={() => handleRemoveBook(book.id)}
                  accessibilityRole="button"
                  accessibilityLabel={`Poista kirja ${book.title} kirjahyllystä`}
                >
                  <Text style={styles.removeButtonText}>
                    Poista kirjahyllystä
                  </Text>
                </Pressable>
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
      width: 90,
      height: 130,
      borderRadius: 8,
      overflow: 'hidden',
      backgroundColor: colors.backgroundElement,
    },
    bookCoverImage: {
      width: '100%',
      height: '100%',
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
    statusLabel: {
      color: colors.textSecondary,
      fontSize: 13,
      fontWeight: '600',
      marginTop: 8,
    },
    statusOptions: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 7,
      marginTop: 6,
    },
    statusOption: {
      paddingHorizontal: 10,
      paddingVertical: 8,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.card,
    },
    statusOptionActive: {
      backgroundColor: colors.backgroundSelected,
      borderColor: colors.primary,
    },
    statusOptionText: {
      color: colors.textSecondary,
      fontSize: 12,
      fontWeight: '500',
    },
    statusOptionTextActive: {
      color: colors.text,
      fontWeight: '700',
    },
    ratingDisplay: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      marginTop: 4,
    },
    ratingStars: {
      flexDirection: 'row',
      gap: 2,
    },
    ratingStar: {
      fontSize: 15,
      color: colors.textSecondary,
    },
    ratingStarActive: {
      color: colors.primary,
    },
    ratingText: {
      fontSize: 12,
      color: colors.textSecondary,
    },
    removeButton: {
      alignSelf: 'flex-start',
      backgroundColor: colors.backgroundElement,
      borderWidth: 1,
      borderColor: colors.border,
      paddingHorizontal: 10,
      paddingVertical: 6,
      minHeight: 42,
      justifyContent: 'center',
      borderRadius: 8,
      marginTop: 6,
    },
    removeButtonText: {
      color: colors.text,
      fontSize: 12,
      fontWeight: '500',
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