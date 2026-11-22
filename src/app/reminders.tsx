import { useEffect, useState } from 'react';

import {
    ActivityIndicator,
    Pressable,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    useColorScheme,
    View,
} from 'react-native';

import DateTimePicker from '@react-native-community/datetimepicker';

import { useRouter } from 'expo-router';

import { Colors } from '@/constants/theme';

import {
    cancelReadingReminder,
    getReadingReminderSettings,
    scheduleReadingReminder,
} from '@/services/notifications';

export default function RemindersScreen() {
  const router = useRouter();

  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme === 'dark' ? 'dark' : 'light'];
  const styles = createStyles(colors);

  // Muistutuksen asetukset
  const [time, setTime] = useState(() => {
    const initialTime = new Date();
    initialTime.setHours(20, 0, 0, 0);
    return initialTime;
  });

  const [isEnabled, setIsEnabled] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  // Lataus- ja virhetilat
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');

  // Haetaan aikaisemmin asetettu muistutus.
  useEffect(() => {
    let isActive = true;

    const loadReminder = async () => {
      try {
        const reminder = await getReadingReminderSettings();

        if (isActive && reminder) {
          const savedTime = new Date();

          savedTime.setHours(
            reminder.hour,
            reminder.minute,
            0,
            0
          );

          setTime(savedTime);
          setIsEnabled(true);
        }
      } catch (error) {
        console.error('Muistutuksen hakeminen epäonnistui:', error);

        if (isActive) {
          setMessage('Muistutuksen asetusten hakeminen epäonnistui.');
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    loadReminder();

    return () => {
      isActive = false;
    };
  }, []);

  // Muistutuksen kytkeminen päälle ja pois.
  const handleToggleReminder = async (value: boolean) => {
    try {
      setIsSaving(true);
      setMessage('');

      if (value) {
        await scheduleReadingReminder(
          time.getHours(),
          time.getMinutes()
        );

        setIsEnabled(true);
        setMessage('Päivittäinen lukumuistutus on asetettu!');
      } else {
        await cancelReadingReminder();

        setIsEnabled(false);
        setMessage('Lukumuistutus on poistettu käytöstä.');
      }
    } catch (error) {
      console.error('Muistutuksen päivittäminen epäonnistui:', error);

      setIsEnabled(false);

      setMessage(
        error instanceof Error
          ? error.message
          : 'Muistutuksen asettaminen epäonnistui.'
      );
    } finally {
      setIsSaving(false);
    }
  };

  // Kellonajan muuttaminen.
  const handleTimeChange = async (selectedDate: Date) => {
    setShowTimePicker(false);

    setTime(selectedDate);
    setMessage('');

    if (isEnabled) {
      try {
        setIsSaving(true);

        await scheduleReadingReminder(
          selectedDate.getHours(),
          selectedDate.getMinutes()
        );

        setMessage('Muistutusaika päivitettiin!');
      } catch (error) {
        console.error('Muistutusajan muuttaminen epäonnistui:', error);

        setIsEnabled(false);
        setMessage('Muistutusajan muuttaminen epäonnistui.');
      } finally {
        setIsSaving(false);
      }
    }
  };

  const formattedTime = [
    String(time.getHours()).padStart(2, '0'),
    String(time.getMinutes()).padStart(2, '0'),
  ].join(':');

  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      {/* Takaisin */}
      <Pressable onPress={() => router.back()}>
        <Text style={styles.backButton}>← Takaisin</Text>
      </Pressable>

      {/* Otsikko */}
      <View style={styles.header}>
        <Text style={styles.brand}>LUKUKAVERI</Text>

        <Text style={styles.title}>
          Lukumuistutukset
        </Text>

        <Text style={styles.subtitle}>
          Aseta itsellesi päivittäinen muistutus lukemiseen.
        </Text>
      </View>

      {/* Muistutuksen tila */}
      <View style={styles.reminderCard}>
        <View style={styles.switchContainer}>
          <View style={styles.reminderInfo}>
            <Text style={styles.sectionTitle}>
              Päivittäinen muistutus
            </Text>

            <Text style={styles.description}>
              Muistuta minua lukemisesta joka päivä.
            </Text>
          </View>

          <Switch
            value={isEnabled}
            onValueChange={handleToggleReminder}
            disabled={isLoading || isSaving}
            trackColor={{
              false: colors.border,
              true: colors.primary,
            }}
          />
        </View>

        <View style={styles.divider} />

        {/* Kellonajan valinta */}
        <Text style={styles.sectionTitle}>
          Muistutusaika
        </Text>

        <Pressable
          style={styles.timeButton}
          onPress={() => setShowTimePicker(true)}
          disabled={isLoading || isSaving}
        >
          <Text style={styles.timeText}>
            {formattedTime}
          </Text>

          <Text style={styles.timeHint}>
            Muuta aikaa
          </Text>
        </Pressable>

        {showTimePicker && (
          <DateTimePicker
            value={time}
            mode="time"
            display="default"
            onValueChange={(_, selectedDate) => {
                void handleTimeChange(selectedDate);
            }}
            onDismiss={() => setShowTimePicker(false)}
          />
        )}
      </View>

      {/* Lataustila */}
      {isLoading && (
        <ActivityIndicator
          color={colors.primary}
          size="large"
        />
      )}

      {/* Tallennuksen tila */}
      {isSaving && (
        <Text style={styles.message}>
          Päivitetään muistutusta...
        </Text>
      )}

      {/* Ilmoitukset ja virheet */}
      {message !== '' && (
        <Text style={styles.message}>
          {message}
        </Text>
      )}

      {/* Lisätieto */}
      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>
          📚 Muista pitää taukoja ja nauttia lukemisesta!
        </Text>

        <Text style={styles.description}>
          Voit muuttaa muistutusaikaa milloin tahansa
          tai ottaa muistutuksen pois käytöstä.
        </Text>
      </View>
    </ScrollView>
  );
}

// Tyylit
const createStyles = (
  colors: typeof Colors.light | typeof Colors.dark
) =>
  StyleSheet.create({
    container: {
      flexGrow: 1,
      padding: 24,
      paddingTop: 50,
      gap: 24,
      backgroundColor: colors.background,
    },

    header: {
      gap: 8,
    },

    brand: {
      color: colors.primary,
      fontSize: 14,
      fontWeight: 'bold',
      letterSpacing: 2,
    },

    title: {
      color: colors.text,
      fontSize: 26,
      fontWeight: 'bold',
    },

    subtitle: {
      color: colors.textSecondary,
      fontSize: 15,
      lineHeight: 22,
    },

    backButton: {
      color: colors.primary,
      fontSize: 16,
      fontWeight: '600',
    },

    reminderCard: {
      backgroundColor: colors.card,
      borderRadius: 16,
      padding: 20,
      gap: 18,
    },

    switchContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12,
    },

    reminderInfo: {
      flex: 1,
      gap: 6,
    },

    sectionTitle: {
      color: colors.text,
      fontSize: 17,
      fontWeight: '600',
    },

    description: {
      color: colors.textSecondary,
      fontSize: 14,
      lineHeight: 21,
    },

    divider: {
      height: 1,
      backgroundColor: colors.border,
    },

    timeButton: {
      backgroundColor: colors.backgroundElement,
      padding: 18,
      borderRadius: 12,
      alignItems: 'center',
      gap: 5,
    },

    timeText: {
      color: colors.text,
      fontSize: 36,
      fontWeight: 'bold',
    },

    timeHint: {
      color: colors.textSecondary,
      fontSize: 13,
    },

    message: {
      color: colors.primary,
      fontSize: 14,
      textAlign: 'center',
    },

    infoCard: {
      backgroundColor: colors.backgroundElement,
      borderRadius: 14,
      padding: 18,
      gap: 10,
    },

    infoTitle: {
      color: colors.text,
      fontSize: 15,
      fontWeight: '600',
    },
  });