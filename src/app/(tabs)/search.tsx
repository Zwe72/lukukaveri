import { Colors } from '@/constants/theme';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  useColorScheme,
  View
} from 'react-native';

import { searchOpenLibraryBooks } from '@/services/openLibrary';

import type { Book } from '@/data/books';

export default function SearchScreen() {
  const [query, setQuery] = useState('');

  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme === 'dark' ? 'dark' : 'light'];
  const styles = createStyles(colors);
  const router = useRouter();

  const [searchResults, setSearchResults] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Suodatetaan kirjoja hakusanan perusteella
  useEffect(() => {
    const searchTerm = query.trim();

    if (searchTerm.length < 2) {
      setSearchResults([]);
      setIsLoading(false);
      setError(null);
      return;
    }

    const controller = new AbortController();

    setIsLoading(true);
    setError(null);
    setSearchResults([]);

    const timeoutId = setTimeout(async () => {
      try {
        const results = await searchOpenLibraryBooks(
          searchTerm,
          controller.signal
        );

        if (!controller.signal.aborted) {
          setSearchResults(results);
        }
      }
      catch (error) {
        if (controller.signal.aborted) return;

        console.error('Kirjastojen haku epäonnistui:', error);

        setError('Kirjojen hakeminen epäonnistui. Tarkista verkkoyhteys.');
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }, 1000);

    return () => {
      clearTimeout(timeoutId);
      controller.abort();
    };
  }, [query]);

return (
  <View style={styles.screen}>
    <FlatList
      data={searchResults}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.listContent}
      ListHeaderComponent={
        <>
          {/* Otsikko */}
          <View style={styles.header}>
            <Text style={styles.brand}>LUKUKAVERI</Text>
            <Text style={styles.title}>Etsi kirjoja</Text>
            <Text style={styles.subtitle}>
              Löydä seuraava lukuelämyksesi.
            </Text>
          </View>

          {/* Hakukenttä */}
          <View style={styles.searchContainer}>
            <Text style={styles.searchIcon}>⌕</Text>

            <TextInput
              style={styles.input}
              placeholder="Kirjan nimi tai kirjailija..."
              placeholderTextColor={colors.textSecondary}
              value={query}
              onChangeText={setQuery}
            />

            {query.length > 0 && (
              <Pressable onPress={() => setQuery('')}>
                <Text style={styles.clearButton}>Tyhjennä</Text>
              </Pressable>
            )}
          </View>

          {/* ISBN-skannaus */}
          <Pressable
            style={styles.scanButton}
            onPress={() => router.push('/scan')}
          >
            <Text style={styles.scanButtonText}>
              📷 Skannaa kirjan viivakoodi
            </Text>
          </Pressable>

          {/* Hakutulokset */}
          <Text style={styles.resultCount}>
            Hakutulokset ({searchResults.length})
          </Text>
      </>
    }
    ItemSeparatorComponent={() => (
      <View style={{ height: 12}} />
    )}
    ListEmptyComponent={
      <Text style={styles.emptyText}>
        {query.trim().length < 2
          ? 'Kirjoita vähintään kaksi merkkiä.'
          : isLoading
            ? 'Haetaan kirjoja...'
            : error
              ? error
              :'Kirjoja ei löytänyt. Kokeile toista hakusanaa.'}
      </Text>
    }
    renderItem={({ item }) => (
      <Pressable 
        style={styles.bookCard}
        onPress={() =>
          router.push({
            pathname: '/book/[id]',
            params: {
              id: item.id,
              title: item.title,
              author: item.author,
              year: item.year ?? '',
              coverId: item.coverId != null
                ? String(item.coverId)
                : '',
              isbn: item.isbn ?? '',
            },
          })
        }
      >
        <View style={styles.bookCover}>
          {item.coverId ? (
            <Image
              source={{
                uri: `https://covers.openlibrary.org/b/id/${item.coverId}-M.jpg`,
              }}
              style={styles.coverImage}
              contentFit="contain"
              cachePolicy="disk"
              transition={150}
            />
          ) : (
            <Text style={styles.coverIcon}>📖</Text>
          )}
        </View>

          <View style={styles.bookInfo}>
            <Text style={styles.bookTitle}>
              {item.title}
            </Text>

            <Text style={styles.author}>
              {item.author}
            </Text>

            <Text style={styles.year}>
              {item.year ?? 'Julkaisuvuosi ei tiedossa'}
            </Text>
          </View>
        </Pressable>
      )}
    />
  </View>
);
}

const createStyles = (
  colors: typeof Colors.light | typeof Colors.dark
) =>
  StyleSheet.create({
    screen: {
      flexGrow: 1,
      backgroundColor: colors.background,
      padding: 24,
      paddingTop: 40,
    },
    header: {
      gap: 8,
      marginBottom: 24,
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
    searchContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 14,
      paddingHorizontal: 14,
      marginBottom: 24,
    },
    searchIcon: {
      fontSize: 24,
      color: colors.textSecondary,
      marginRight: 10,
    },
    scanButton: {
      backgroundColor: colors.backgroundElement,
      padding: 14,
      borderRadius: 12,
      alignItems: 'center',
    },
    scanButtonText: {
      color: colors.text,
      fontSize: 15,
      fontWeight: '600',
    },
    input: {
      flex: 1,
      paddingVertical: 16,
      fontSize: 14,
      color: colors.text,
    },
    clearButton: {
      color: colors.primary,
      fontSize: 12,
      fontWeight: '600',
      paddingLeft: 8,
    },
    resultCount: {
      fontSize: 17,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: 16,
    },
    listContent: {
      paddingBottom: 30,
    },
    bookCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.card,
      borderRadius: 14,
      padding: 14,
      gap: 16,
      borderWidth: 1,
      borderColor: colors.border,
    },
    bookCover: {
      width: 65,
      height: 85,
      backgroundColor: colors.backgroundSelected,
      borderRadius: 8,
      justifyContent: 'center',
      alignItems: 'center',
    },
    coverIcon: {
      fontSize: 28,
    },
    bookInfo: {
      flex: 1,
      gap: 7,
    },
    bookTitle: {
      fontSize: 15,
      fontWeight: 'bold',
      color: colors.text,
    },
    author: {
      fontSize: 13,
      color: colors.textSecondary,
    },
    year: {
      fontSize: 12,
      color: colors.primary,
    },
    emptyText: {
      fontSize: 14,
      color: colors.textSecondary,
      textAlign: 'center',
      marginTop: 30,
    },
    coverImage: {
      width: '100%',
      height: '100%',
    },
  });