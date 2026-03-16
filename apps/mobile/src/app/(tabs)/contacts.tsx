import { View, Text, ScrollView, Pressable, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useTheme } from "@/constants/useTheme";
import { colors, spacing, radius, fontSize, fontWeight } from "@/constants/theme";
import PersonalProfileIcon from "@/assets/icons/profile/profile_personal.svg";
import SearchIcon from "@/assets/icons/chat/search.svg";
import UserPlusIcon from "@/assets/icons/contacts/user_plus.svg";

// --- Mock 데이터 ---

type ContactItem = {
  id: string;
  name: string;
  initials: string;
  avatarBg: string;
  avatarColor: string;
};

const mockContacts: ContactItem[] = [
  {
    id: "1",
    name: "민지",
    initials: "MJ",
    avatarBg: "#fce7f3",
    avatarColor: "#be185d",
  },
  {
    id: "2",
    name: "준호",
    initials: "JH",
    avatarBg: "#dcfce7",
    avatarColor: "#15803d",
  },
  {
    id: "3",
    name: "서연",
    initials: "SY",
    avatarBg: "#dbeafe",
    avatarColor: "#1d4ed8",
  },
];

// --- 컴포넌트 ---

function ContextBar({ theme }: { theme: ReturnType<typeof useTheme> }) {
  return (
    <Pressable style={[styles.ctxBar, { backgroundColor: theme.background }]}>
      <View style={[styles.ctxIcon, { backgroundColor: colors.semantic.success.light }]}>
        <PersonalProfileIcon width={16} height={16} />
      </View>
      <Text style={[styles.ctxName, { color: theme.textPrimary }]}>개인</Text>
      <View style={styles.ctxBadge}>
        <Text style={styles.ctxBadgeText}>4</Text>
      </View>
      <Text style={[styles.ctxChevron, { color: theme.textTertiary }]}>›</Text>
    </Pressable>
  );
}

function ContactsHeader({ theme, onAdd }: { theme: ReturnType<typeof useTheme>; onAdd: () => void }) {
  return (
    <View style={[styles.header, { backgroundColor: theme.background }]}>
      <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>연락처</Text>
      <View style={styles.headerRight}>
        <Pressable style={styles.headerBtn} hitSlop={4}>
          <SearchIcon width={18} height={18} color={theme.textSecondary} />
        </Pressable>
        <Pressable style={styles.headerBtn} hitSlop={4} onPress={onAdd}>
          <UserPlusIcon width={18} height={18} color={theme.textSecondary} />
        </Pressable>
      </View>
    </View>
  );
}

function ContactRow({
  item,
  theme,
  onPress,
}: {
  item: ContactItem;
  theme: ReturnType<typeof useTheme>;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.contactItem,
        pressed && { backgroundColor: theme.surface },
      ]}
    >
      <View style={[styles.avatar, { backgroundColor: item.avatarBg }]}>
        <Text style={[styles.avatarText, { color: item.avatarColor }]}>
          {item.initials}
        </Text>
      </View>
      <Text style={[styles.contactName, { color: theme.textPrimary }]}>{item.name}</Text>
    </Pressable>
  );
}

// --- 메인 화면 ---

export default function ContactsScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  return (
    <View style={[styles.container, { backgroundColor: theme.background, paddingTop: insets.top }]}>
      <ContextBar theme={theme} />
      <ContactsHeader theme={theme} onAdd={() => router.push("/contact-add")} />

      <ScrollView style={styles.scrollArea}>
        {mockContacts.map((contact) => (
          <ContactRow
            key={contact.id}
            item={contact}
            theme={theme}
            onPress={() => router.push({ pathname: "/profile-detail", params: { id: contact.id } })}
          />
        ))}
      </ScrollView>
    </View>
  );
}

// --- 스타일 ---

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  // Context Bar
  ctxBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing[4],
    gap: spacing[2],
  },
  ctxIcon: {
    width: 28,
    height: 28,
    borderRadius: radius.full,
    alignItems: "center",
    justifyContent: "center",
  },
  ctxName: {
    flex: 1,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
  },
  ctxBadge: {
    minWidth: 18,
    height: 18,
    borderRadius: radius.full,
    backgroundColor: colors.semantic.error.default,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 5,
  },
  ctxBadgeText: {
    fontSize: 10,
    fontWeight: fontWeight.bold,
    color: "#ffffff",
  },
  ctxChevron: {
    fontSize: 16,
  },

  // Header
  header: {
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: spacing[4],
    paddingRight: spacing[1],
  },
  headerTitle: {
    flex: 1,
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerBtn: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },

  // Scroll
  scrollArea: {
    flex: 1,
  },

  // Contact Item
  contactItem: {
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing[4],
    gap: spacing[2],
  },

  // Avatar
  avatar: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: 13,
    fontWeight: fontWeight.semibold,
  },

  // Contact Name
  contactName: {
    fontSize: 15,
  },
});
