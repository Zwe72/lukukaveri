import { Colors } from "@/constants/theme";
import { ScrollView, StyleSheet, Text, useColorScheme, View } from "react-native";


export default function LibraryScreen() {
    const colorScheme = useColorScheme();
    const colors = Colors[colorScheme === 'dark' ? 'dark' : 'light'];
    const styles = createStyles(colors);

    const books = [
        {
            id: '1',
            title: 'Metsän hiljaisuus',
            author: 'Esimerkkikirjailija',
            status: 'Kesken',
        },
        {
            id: '2',
            title: 'Matka tuntetmattomaan',
            author: 'Esimerkkikirjailija',
            status: 'Lukulistalla',
        },
        {
            id: '3',
            title: 'Viimeinen tarina',
            author: 'Esimerkkikirjailija',
            status: 'Luettu',
        },
    ]
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

            {/* Kirjalista */}
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
  });