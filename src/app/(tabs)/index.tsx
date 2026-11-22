import { Colors } from '@/constants/theme';
import { getLibraryBooks, LibraryBook } from '@/data/library';
import { useFocusEffect, useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, useColorScheme, View } from 'react-native';

export default function HomeScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme === 'dark' ? 'dark' : 'light'];
  const styles = createStyles(colors);

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
  }, [db])
);

const currentlyReading = books.find(
  (book) => book.status === 'Kesken'
);

  return (
    <ScrollView
    style={styles.screen}
    contentContainerStyle={styles.content}
    showsVerticalScrollIndicator={false}
    >
      {/* Otsikko */}
      <View style={styles.header}>
        <View>
          <Text style={styles.brand}>LUKUKAVERI</Text>
          <Text style={styles.title}>Hei, lukija!</Text>
          <Text style={styles.subtitle}>Mitä lukisit tänään?</Text>
        </View>
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
          Ladataan kirajhyllyä...
        </Text>
      ) : error ? (
        <Text style={styles.progressText}>
          {error}
        </Text>
      ) : currentlyReading ? (
        <Pressable
        style={styles.bookCard}
          onPress={() =>
            router.push({
              pathname: '/book/[id]',
              params: {
                id: currentlyReading.id,
                title: currentlyReading.title,
                author: currentlyReading.author,
                year: currentlyReading.year ?? '',
                coverId: '',
                isbn: '',
              },
            })
          }
        >
          <View style={styles.bookCover}>
            <Text style={styles.coverTitle}>
            📖
            </Text>
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

        {/* Lukumuistutukset */}
        <Pressable
          style={styles.discoverCard}
          onPress={() => router.push('/reminders')}
        >
          <Text style={styles.sectionTitle}>
            🔔 Lukumuistutukset
          </Text>

          <Text style={styles.discoverText}>
            Aseta päivittäinen muistutus ja muista
            ottaa aikaa lukemiselle.
          </Text>

          <Text style={styles.primaryButtonText}>
            Aseta muistutus →
          </Text>
        </Pressable>
      </View>
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
    header: {
      marginBottom: 4,
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
      padding: 10,
      justifyContent: 'space-between',
    },
    coverTitle: {
      fontSize: 15,
      fontWeight: 'bold',
      color: colors.text,
    },
    coverAuthor: {
      fontSize: 8,
      color: colors.textSecondary,
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
    progressBar: {
      height: 7,
      backgroundColor: colors.border,
      borderRadius: 10,
      overflow: 'hidden',
    },
    progressFill: {
      width: '55%',
      height: '100%',
      backgroundColor: colors.primary,
      borderRadius: 10,
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
  });
