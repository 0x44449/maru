import { Text } from "react-native";
import { Tabs } from "expo-router";
import { useTheme } from "@/constants/useTheme";
import { colors } from "@/constants/theme";
import WorkspaceIcon from "@/assets/icons/bottom/workspace_filled.svg";
import ChatIcon from "@/assets/icons/bottom/chat_filled.svg";
import ContactsIcon from "@/assets/icons/bottom/contacts_filled.svg";
import MoreIcon from "@/assets/icons/bottom/more_filled.svg";

export default function TabLayout() {
  const theme = useTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary[600],
        tabBarInactiveTintColor: theme.textPrimary,
        tabBarStyle: {
          backgroundColor: theme.background,
          borderTopColor: theme.border,
          borderTopWidth: 1,
        },
        tabBarLabelStyle: {
          fontSize: 11,
        },
        tabBarShowLabel: false,
      }}
    >
      <Tabs.Screen
        name="workspace"
        options={{
          title: "워크스페이스",
          tabBarIcon: ({ color }) => <WorkspaceIcon width={24} height={24} fill={color} />,
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: "채팅",
          tabBarIcon: ({ color }) => <ChatIcon width={24} height={24} fill={color} />,
        }}
      />
      <Tabs.Screen
        name="contacts"
        options={{
          title: "연락처",
          tabBarIcon: ({ color }) => <ContactsIcon width={24} height={24} fill={color} />,
        }}
      />
      <Tabs.Screen
        name="more"
        options={{
          title: "더보기",
          tabBarIcon: ({ color }) => <MoreIcon width={24} height={24} fill={color} />,
        }}
      />
    </Tabs>
  );
}

function TabIcon({ label }: { label: string; color: string }) {
  return <Text style={{ fontSize: 24 }}>{label}</Text>;
}
