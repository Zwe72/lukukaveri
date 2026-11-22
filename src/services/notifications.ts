import * as Notifications from 'expo-notifications';

// Omien lukumuistutusten tunniste
const REMINDER_TYPE = 'lukukaveri-reading-reminder';

// Määritellään, miten ilmoitus näytetään sovelluksen ollessa auki.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

// Pyydetään käyttäjältä ilmoituslupa
export async function requestReadingReminderPermission(): Promise<boolean> {

  const {status: existingStatus} =
    await Notifications.getPermissionsAsync();

  if (existingStatus === 'granted') {
    return true;
  }

  const { status } =
    await Notifications.requestPermissionsAsync();

  return status === 'granted';
}

// Perutaan aikaisemmin asetettu lukumuistutus.
export async function cancelReadingReminder(): Promise<void> {
  const scheduledNotifications =
    await Notifications.getAllScheduledNotificationsAsync();

  const readingReminders = scheduledNotifications.filter(
    (notification) =>
      notification.content.data?.type === REMINDER_TYPE
  );

  await Promise.all(
    readingReminders.map((notification) =>
      Notifications.cancelScheduledNotificationAsync(
        notification.identifier
      )
    )
  );
}

// Ajastetaan päivittäinen lukumuistutus.
export async function scheduleReadingReminder(
  hour: number,
  minute: number
): Promise<string> {

  // Tarkistetaan kellonaika.
  if (
    !Number.isInteger(hour) ||
    !Number.isInteger(minute) ||
    hour < 0 ||
    hour > 23 ||
    minute < 0 ||
    minute > 59
  ) {
    throw new Error('Virheellinen muistutusaika.');
  }

  // Tarkistetaan käyttöoikeus.
  const hasPermission =
    await requestReadingReminderPermission();

  if (!hasPermission) {
    throw new Error('Ilmoituslupaa ei myönnetty.');
  }

  // Poistetaan vanha lukumuistutus ennen uuden ajastamista.
  await cancelReadingReminder();

  // Luodaan uusi päivittäinen ilmoitus.
  const identifier =
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'LukuKaveri 📚',
        body: 'Muista lukea tänään! Ota pieni hetki ja jatka lukumatkaasi.',
        sound: true,
        data: {
          type: REMINDER_TYPE,
          hour,
          minute,
        },
      },

      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour,
        minute,
      },
    });

  return identifier;
}

// Tallennetun lukumuistutuksen tietotyyppi
export type ReadingReminderSettings = {
    hour: number;
    minute: number;
}

// Haetaan aikaisemmin ajastettu lukumuistutus
export async function getReadingReminderSettings():
    Promise<ReadingReminderSettings | null> {

    const notifications =
        await Notifications.getAllScheduledNotificationsAsync();
    
    const reminder = notifications.find(
        (notification) =>
            notification.content.data?.type === REMINDER_TYPE
    );

    if (!reminder) {
        return null;
    }

    const hour = Number(reminder.content.data?.hour);
    const minute = Number(reminder.content.data?.minute);

  if (
    !Number.isInteger(hour) ||
    !Number.isInteger(minute) ||
    hour < 0 ||
    hour > 23 ||
    minute < 0 ||
    minute > 59
  ) {
    return null;
  }
  
  return {hour, minute};
}