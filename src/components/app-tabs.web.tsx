import {
  TabList,
  Tabs,
  TabSlot,
  TabTrigger,
} from 'expo-router/ui';
import { Text } from 'react-native';

export default function AppTabs() {
  return (
    <Tabs>
      <TabSlot style={{ flex: 1 }} />

      <TabList>
        <TabTrigger name="index" href="/">
          <Text>Etusivu</Text>
        </TabTrigger>

        <TabTrigger name="search" href="/search">
          <Text>Haku</Text>
        </TabTrigger>

        <TabTrigger name="library" href="/library">
          <Text>Kirjahylly</Text>
        </TabTrigger>
      </TabList>
    </Tabs>
  );
}
