import { Colors } from "@/constants/theme";
import { searchOpenLibraryByIsbn } from "@/services/openLibrary";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useRouter } from "expo-router";
import { useRef, useState } from "react";
import {
    ActivityIndicator,
    Pressable,
    StyleSheet,
    Text,
    useColorScheme,
    View
} from "react-native";

// Takistetaan ISBN 13-tunnuksen oikeellisuus
function isValidIsbn13(isbn: string): boolean {
    const normalizedIsbn = isbn.replace(/[-\s]/g, '');

    if (!/^97[89]\d{10}$/.test(normalizedIsbn)) {
        return false;
    }

    const digits = normalizedIsbn.split('').map(Number);

    const sum = digits.slice(0, 12).reduce(
        (total, digit, index) =>
            total + digit * (index % 2 === 0 ? 1 : 3),
        0
  );

  const checkDigit = (10 - (sum % 10)) % 10;

  return checkDigit === digits[12];
}

export default function ScanScreen() {
    const router = useRouter();

    const colorScheme = useColorScheme();
    const colors = Colors[colorScheme === 'dark' ? 'dark' : 'light'];
    const styles = createStyles(colors);

    const [permission, requestPermission] = useCameraPermissions();

    const [isSearching, setIsSearching] = useState(false);
    const [message, setMessage] = useState('');
    const [showRetry, setShowRetry] = useState(false);
    const [torchEnabled, setTorchEnabled] = useState(false);

    // Estetään saman viivakoodin lukeminen monta kertaa.
    const hasScanned = useRef(false);

    //Viivakoodin käsittely
    const handleBarcodeScanned = async (data: string) => {
        if (hasScanned.current) return;

        hasScanned.current = true;

        const isbn = data.replace(/[-\s]/g, '');

        // Tarkistetaan ISBN-13
        if (!isValidIsbn13(isbn)) {
            setMessage('Viivakoodi ei ole kelvollinen ISBN-13. Yritä uudelleen.');
            setShowRetry(true);
            return;
        }

        try {
            setIsSearching(true);
            setMessage('Haetaan kirjaa Open Librarysta...');
            setShowRetry(false);

            const book = await searchOpenLibraryByIsbn(isbn);

            if(!book) {
                setMessage('Kirjaa ei löytynyt. Kokeile toista kirjaa.');
                setShowRetry(true);
                return;
            }

            // Siirrytään löydetyn kirjan tietosivulle.
            router.replace({
                pathname: '/book/[id]',
                params: {
                    id: book.id,
                    title: book.title,
                    author: book.author,
                    year: book.year ?? '',
                    coverId: book.coverId != null
                        ? String(book.coverId)
                        : '',
                    isbn: book.isbn ?? isbn,
                },
            });
        } catch (error) {
            console.error('ISBN-haku epäonnistui:', error);

            setMessage(
                'Kirjan hakeminen epäonnistui. Tarkista verkkoyhteys.'
            );

            setShowRetry(true);
        } finally {
            setIsSearching(false);
        }
    };

    // Kameran käyttöoikeiuden lataaminen
    if (!permission) {
        return (
            <View style={styles.container}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={styles.text}>
                    Tarkistetaan kameran käyttöoikeutta...
                </Text>
            </View>
        );
    }

    // Kameran käyttöoikeutta ei ole veilä annettu.
    if (!permission.granted) {
        return (
            <View style={styles.container}>
                <Pressable onPress={() => router.back}>
                    <Text style={styles.backButton}>← Takaisin</Text>
                </Pressable>

                <Text style={styles.title}>
                    Kameran käyttöoikeus
                </Text>

                <Text style={styles.text}>
                    LukuKaveri tarvitsee kameran käyttöoikeuden, jotta voit
                    skannata kirjojen ISBN-viivakoodeja.
                </Text>

                <Pressable
                    style={styles.button}
                    onPress={requestPermission}
                >
                    <Text style={styles.buttonText}>
                        Salli kameran käyttö
                    </Text>
                </Pressable>
            </View>
        );
    }

    return(
        <View style={styles.container}>
            {/* Otsikko */}
            <Pressable onPress={() => router.back()}>
                <Text style={styles.backButton}>← Takaisin</Text>
            </Pressable>

            <Text style={styles.title}>
                Skannaa kirja
            </Text>

            <Text style={styles.text}>
                Aseta kirjan takakannen ISBN-viivakoodi kameran keskelle.
            </Text>

            {/* Kameranäkymä */}
            <View style={styles.cameraContainer}>
                <CameraView
                    style={styles.camera}
                    facing="back"
                    enableTorch={torchEnabled}
                    barcodeScannerSettings={{
                        barcodeTypes: ['ean13'],
                    }}
                    onBarcodeScanned={
                        isSearching || showRetry
                            ? undefined
                            : ({ data }) => handleBarcodeScanned(data)
                    }
                />

                {/* Skannauskehys */}
                <View style={styles.cameraOverlay} pointerEvents="none">
                    <View style={styles.scanFrame} />
                    
                    <Text style={styles.overlayText}>
                        Aseta viivakoodi kehyksen sisälle
                    </Text>
                    </View>
                </View>

                {/* Taskulamppu */}
                <Pressable
                    style={styles.secondaryButton}
                    onPress={() => setTorchEnabled((current) => !current)}
                >
                    <Text style={styles.buttonText}>
                        {torchEnabled ? 'Sammuta valo' : 'Sytytä valo'}
                    </Text>
                </Pressable>

                {/* Haun tila */}
                {isSearching && (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator color={colors.primary} />
                        <Text style={styles.text}>
                            {message}
                        </Text>
                    </View>
                )}

                {!isSearching && message !== '' && (
                    <Text style={styles.message}>
                        {message}
                    </Text>
                )}

                {/* Uusi skannaus */}
                {showRetry && (
                    <Pressable
                        style={styles.button}
                        onPress={() => {
                            hasScanned.current = false;
                            setShowRetry(false);
                            setMessage('');
                        }}
                    >
                        <Text style={styles.buttonText}>
                            Yritä uudelleen
                        </Text>
                    </Pressable>
                )}
            </View>
    );
}

// Tyylit
const createStyles = (
  colors: typeof Colors.light | typeof Colors.dark
) =>
  StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
        padding: 24,
        paddingTop: 50,
        gap: 18,
    },

    title: {
        fontSize: 26,
        fontWeight: 'bold',
        color: colors.text,
    },

    text: {
        fontSize: 15,
        color: colors.textSecondary,
        lineHeight: 22,
    },

    backButton: {
        fontSize: 16,
        color: colors.primary,
        fontWeight: '600',
    },

    camera: {
        position: 'absolute',
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
    },

    cameraContainer: {
        flex: 1,
        minHeight: 300,
        backgroundColor: '#000000',
        borderRadius: 16,
        overflow: 'hidden',
        position: 'relative',
    },

    cameraOverlay: {
        position: 'absolute',
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 20,
        backgroundColor: 'rgba(0, 0, 0, 0.12)',
    },

    scanFrame: {
        width: '85%',
        height: 130,
        borderWidth: 3,
        borderColor: '#FFFFFF',
        borderRadius: 12,
    },

    overlayText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '600',
        textAlign: 'center',
    },

    button: {
         backgroundColor: colors.primary,
         padding: 15,
         borderRadius: 12,
        alignItems: 'center',
    },

    secondaryButton: {
        backgroundColor: colors.backgroundElement,
        padding: 13,
        borderRadius: 12,
        alignItems: 'center',
    },

    buttonText: {
        color: colors.lightButtonText,
        fontSize: 15,
        fontWeight: '600',
    },

    message: {
        color: colors.textSecondary,
        textAlign: 'center',
        fontSize: 14,
    },

    loadingContainer: {
        alignItems: 'center',
        gap: 10,
    },
  });