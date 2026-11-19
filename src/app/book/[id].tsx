import { router, useLocalSearchParams } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

export default function BookDetailIsScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();

    return (
        <View style={styles.container}>
            <Pressable onPress={() => router.back()}>
                <Text style={styles.backButton}>← Takaisin</Text>
            </Pressable>

            <Text style={styles.title}>Kirjan tiedot</Text>

            <Text style={styles.info}>
                Kirjan tunniste: {id}
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    paddingTop: 50,
    gap: 24,
  },
  backButton: {
    fontSize: 16,
    color: '#64816D',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
  },
  info: {
    fontSize: 16,
  },
})