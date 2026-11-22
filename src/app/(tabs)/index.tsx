import { Colors } from '@/constants/theme';
import { getLibraryBooks, LibraryBook } from '@/data/library';
import { Image } from 'expo-image';
import { useFocusEffect, useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useState } from 'react';

import {
  Appearance,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useColorScheme,
  View
} from 'react-native';

export default function HomeScreen() {
  const router = useRouter();

  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme === 'dark' ? 'dark' : 'light'];
  const styles = createStyles(colors);
  const isDark = colorScheme === 'dark';

  const toggleTheme = () => {
    Appearance.setColorScheme(isDark ? 'light' : 'dark');
  };

  const db = useSQLiteContext();

  const [books, setBooks] = useState<LibraryBook[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      const loadBooks = async () => {
        try {
          setIsLoading(true);
          setError(null);

          const savedBooks = await getLibraryBooks(db);

          if (isActive) {
            setBooks(savedBooks);
          }
        } catch (error) {
          console.error('Kirjojen hakeminen epäonnistui:', error);

          if (isActive) {
          setError('Kirjahyllyn lataaminen epäonnistui.');
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
    },  [db])
  );

  const currentlyReading = books.find(
    (book) => book.status === 'Kesken'
  );

  const latestAdded = books[0];

  const openBook = (book: LibraryBook) => {
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
    });
  };
  
  return (
    <ScrollView
    style={styles.screen}
    contentContainerStyle={styles.content}
    showsVerticalScrollIndicator={false}
    >
      {/* Otsikko ja teeman vaihto*/}
      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text style={styles.brand}>LUKUKAVERI</Text>
          <Text style={styles.title}>Hei, lukija!</Text>
          <Text style={styles.subtitle}>Mitä lukisit tänään?</Text>
        </View>
        
        <Pressable
          style={styles.themeButton}
          onPress={toggleTheme}
          accessibilityRole="button"
          accessibilityLabel="Vaihda väriteemaa"
        >
          <Text style={styles.themeIcon}>
            {colorScheme === 'dark' ? '☀️' : '🌙'}
          </Text>
        </Pressable>
      </View>

      {/* Kirjahaku */}
      <Pressable
        style={styles.searchButton}
        onPress={() => router.push('/search')}
      >
        <Text style={styles.searchText}>
          Etsi kirjoja...
        </Text>
        <Text style={styles.arrow}>→</Text>
      </Pressable>

      {/* Jatka lukemista */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>
          Jatka lukemista
        </Text>

        <Pressable onPress={() => router.push('/library')}>
          <Text style={styles.link}>Kirjahylly →</Text>
        </Pressable>
      </View>

      {/* Kirjojen lataaminen */}
      {isLoading ? (
        <Text style={styles.progressText}>
          Ladataan kirjahyllyä...
        </Text>
      ) : error ? (
        <Text style={styles.progressText}>
          {error}
        </Text>
      ) : currentlyReading ? (
        <Pressable
        style={styles.bookCard}
          onPress={() => openBook(currentlyReading)}
        >
          {/* Kirjan kansi */}
          <View style={styles.bookCover}>
            {currentlyReading.cover_id ? (
              <Image
                source={{
                  uri: `https://covers.openlibrary.org/b/id/${currentlyReading.cover_id}-M.jpg`,
                }}
                style={styles.bookCoverImage}
                contentFit="contain"
                cachePolicy="disk"
                transition={150}
              />
            ) : (
              <Text style={styles.coverTitle}>📖</Text>
            )}
          </View>

          <View style={styles.bookInfo}>
            <Text style={styles.bookTitle}>
              {currentlyReading.title}
            </Text>

            <Text style={styles.author}>
              {currentlyReading.author}
            </Text>

            <Text style={styles.status}>
              {currentlyReading.status}
            </Text>

            <Text style={styles.progressText}>
              Avaa kirja ja jatka lukemista →
            </Text>
          </View>
        </Pressable> 
      ) : (
      <Text style={styles.progressText}>
        Sinulla ei ole tällä hetkellä keskeneräisiä kirjoja.
        Lisää kirja kirjahyllyyn ja aloita lukeminen!
      </Text>
    )}

    {/* Viimeksi lisätty kirja */}
    {!isLoading &&
      !error &&
      latestAdded &&
      latestAdded.id !== currentlyReading?.id && (
        <>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              Viimeksi lisätty
            </Text>

            <Pressable onPress={() => router.push('/library')}>
              <Text style={styles.link}>Kirjahylly →</Text>
            </Pressable>
          </View>

          <Pressable
            style={styles.bookCard}
            onPress={() => openBook(latestAdded)}
          >
            <View style={styles.bookCover}>
              {latestAdded.cover_id ? (
                <Image
                  source={{
                    uri: `https://covers.openlibrary.org/b/id/${latestAdded.cover_id}-M.jpg`,
                  }}
                  style={styles.bookCoverImage}
                  contentFit="contain"
                  cachePolicy="disk"
                  transition={150}
                />
              ) : (
                <Text style={styles.coverTitle}>📖</Text>
              )}
            </View>

            <View style={styles.bookInfo}>
              <Text style={styles.bookTitle}>
                {latestAdded.title}
              </Text>

              <Text style={styles.author}>
                {latestAdded.author}
              </Text>

              <Text style={styles.status}>
                {latestAdded.status}
              </Text>

              <Text style={styles.progressText}>
                Avaa kirjan tiedot →
              </Text>
            </View>
          </Pressable>
        </>
     )}

      {/* Löydä uutta luettavaa */}
      <View style={styles.discoverCard}>
        <Text style={styles.sectionTitle}>
          Löydä uutta luettavaa
        </Text>

        <Text style={styles.discoverText}>
          Etsi seuraava suosikkikirjasi ja lisää se
          omaan kirjahyllyysi.
        </Text>

        <Pressable
          style={styles.primaryButton}
          onPress={() => router.push('/search')}
        >
          <Text style={styles.primaryButtonText}>
            Etsi kirjoja
          </Text>
        </Pressable>
      </View>

        {/* Lukumuistutukset */}
        <Pressable
          style={styles.reminderButton}
          onPress={() => router.push('/reminders')}
        >
          <View style={styles.reminderInfo}>
            <Text style={styles.reminderTitle}>
            🔔 Lukumuistutukset
            </Text>

            <Text style={styles.reminderSubtitle}>
              Muista ottaa aikaa lukemiselle.
            </Text>
          </View>

          <Text style={styles.reminderAction}>
            Aseta →
          </Text>
        </Pressable>
    </ScrollView>
  )
};


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
    brand: {
      fontSize: 12,
      fontWeight: 'bold',
      letterSpacing: 2,
      color: colors.primary,
      marginBottom: 10,
    },
    title: {
      fontSize: 28,
      fontWeight: 'bold',
      color: colors.text,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
    },
    headerText: {
      flex: 1,
    },
    themeIcon: {
      fontSize: 23,
    },
    subtitle: {
      fontSize: 15,
      color: colors.textSecondary,
      marginTop: 6,
    },
    searchButton: {
      backgroundColor: colors.card,
      padding: 16,
      borderRadius: 14,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.border,
    },
    searchText: {
      fontSize: 15,
      color: colors.textSecondary,
    },
    arrow: {
      fontSize: 20,
      color: colors.primary,
    },
    themeButton: {
      width: 44,
      height: 44,
      borderRadius: 12,
      backgroundColor: colors.backgroundElement,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: 'center',
      justifyContent: 'center',
      marginLeft: 12,
      marginTop: 14,
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
    link: {
      fontSize: 13,
      color: colors.primary,
      fontWeight: '600',
    },
    bookCard: {
      backgroundColor: colors.card,
      borderRadius: 16,
      padding: 14,
      flexDirection: 'row',
      gap: 16,
    },
    bookCover: {
      width: 100,
      height: 140,
      backgroundColor: colors.backgroundSelected,
      borderRadius: 8,
      overflow: 'hidden',
      alignItems: 'center',
      justifyContent: 'center',
    },
    bookCoverImage: {
      width: '100%',
      height: '100%',
    }, 
    bookInfo: {
      flex: 1,
      justifyContent: 'center',
      gap: 8,
    },
    bookTitle: {
      fontSize: 16,
      fontWeight: 'bold',
      color: colors.text,
    },
    coverTitle: {
      fontSize: 15,
      fontWeight: 'bold',
      color: colors.text,
    },
    author: {
      fontSize: 13,
      color: colors.textSecondary,
    },
    status: {
      color: colors.primary,
      fontWeight: '600',
      fontSize: 12,
    },
    progressText: {
      fontSize: 11,
      color: colors.textSecondary,
    },
    discoverCard: {
      backgroundColor: colors.backgroundElement,
      padding: 20,
      borderRadius: 16,
      gap: 12,
    },
    discoverText: {
      fontSize: 14,
      lineHeight: 21,
      color: colors.textSecondary,
    },
    primaryButton: {
      backgroundColor: colors.primary,
      padding: 13,
      borderRadius: 10,
      alignItems: 'center',
    },
    primaryButtonText: {
      color: colors.lightButtonText,
      fontWeight: 'bold',
      fontSize: 14,
    },
    reminderButton: {
      backgroundColor: colors.primary,
      padding: 18,
      borderRadius: 14,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12,
    },
    reminderInfo: {
      flex: 1,
      gap: 5,
    },
    reminderTitle: {
      color: colors.lightButtonText,
      fontSize: 16,
      fontWeight: 'bold',
    },
    reminderSubtitle: {
      color: colors.lightButtonText,
      fontSize: 13,
    },
    reminderAction: {
      color: colors.lightButtonText,
      fontWeight: 'bold',
      fontSize: 14,
    },
  });
