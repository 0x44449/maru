import { View, Text, ScrollView, Pressable, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useTheme } from "@/constants/useTheme";
import { colors, spacing, radius, fontSize, fontWeight } from "@/constants/theme";
import PersonalProfileIcon from "@/assets/icons/profile/profile_personal.svg";
import SearchIcon from "@/assets/icons/chat/search.svg";
import PlusIcon from "@/assets/icons/chat/plus.svg";

// --- Mock 데이터 ---

type ChatItem = {
  id: string;
  name: string;
  initials: string;
  avatarBg: string;
  avatarColor: string;
  lastMessage: string;
  time: string;
  unread?: number;
  type: "normal" | "channel" | "external";
};

const mockChats: ChatItem[] = [
  {
    id: "1",
    name: "민지",
    initials: "MJ",
    avatarBg: "#fce7f3",
    avatarColor: "#be185d",
    lastMessage: "주말에 시간 돼?",
    time: "오후 3:00",
    unread: 1,
    type: "normal",
  },
  {
    id: "2",
    name: "준호",
    initials: "JH",
    avatarBg: "#dcfce7",
    avatarColor: "#15803d",
    lastMessage: "ㅋㅋㅋ 알겠어",
    time: "오전 10:20",
    type: "normal",
  },
  {
    id: "3",
    name: "아테나 고객지원",
    initials: "📡",
    avatarBg: "#eff6ff",
    avatarColor: "#2563eb",
    lastMessage: "네, 예약 변경 도와드리겠습니다",
    time: "오후 1:00",
    type: "channel",
  },
  {
    id: "4",
    name: "스타일살롱 예약",
    initials: "📡",
    avatarBg: "#dcfce7",
    avatarColor: "#15803d",
    lastMessage: "감사합니다. 좋은 하루 보내세요!",
    time: "어제",
    type: "channel",
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

function ChatListHeader({ theme }: { theme: ReturnType<typeof useTheme> }) {
  return (
    <View style={[styles.header, { backgroundColor: theme.background }]}>
      <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>채팅</Text>
      <View style={styles.headerRight}>
        <Pressable style={styles.headerBtn} hitSlop={4}>
          <SearchIcon width={18} height={18} color={theme.textSecondary} />
        </Pressable>
        <Pressable style={styles.headerBtn} hitSlop={4}>
          <PlusIcon width={18} height={18} color={theme.textSecondary} />
        </Pressable>
      </View>
    </View>
  );
}

function ChannelBadge() {
  return (
    <View style={styles.channelBadge}>
      <Text style={styles.channelBadgeText}>채널</Text>
    </View>
  );
}

function ChannelAvatarIcon() {
  return (
    <View style={styles.channelAvatarIcon}>
      <Text style={{ fontSize: 8, color: "#ffffff" }}>🏢</Text>
    </View>
  );
}

function ChatItemRow({
  item,
  theme,
  onPress,
}: {
  item: ChatItem;
  theme: ReturnType<typeof useTheme>;
  onPress: () => void;
}) {
  const isChannel = item.type === "channel";

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.chatItem,
        pressed && { backgroundColor: theme.surface },
      ]}
    >
      {/* 아바타 */}
      <View style={[styles.avatar, { backgroundColor: item.avatarBg, borderRadius: isChannel ? radius.xl : radius.full }]}>
        <Text style={[styles.avatarText, { color: item.avatarColor }]}>
          {item.initials}
        </Text>
        {isChannel && <ChannelAvatarIcon />}
      </View>

      {/* 채팅 정보 */}
      <View style={styles.chatInfo}>
        <View style={styles.chatTop}>
          <View style={styles.chatNameArea}>
            <Text style={[styles.chatName, { color: theme.textPrimary }]} numberOfLines={1}>
              {item.name}
            </Text>
            {isChannel && <ChannelBadge />}
          </View>
          <Text style={[styles.chatTime, { color: theme.textTertiary }]}>{item.time}</Text>
        </View>
        <View style={styles.chatBottom}>
          <Text style={[styles.chatPreview, { color: theme.textTertiary }]} numberOfLines={1}>
            {item.lastMessage}
          </Text>
          {item.unread != null && item.unread > 0 && (
            <View style={styles.chatBadge}>
              <Text style={styles.chatBadgeText}>{item.unread}</Text>
            </View>
          )}
        </View>
      </View>
    </Pressable>
  );
}

// --- 메인 화면 ---

export default function ChatScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  return (
    <View style={[styles.container, { backgroundColor: theme.background, paddingTop: insets.top }]}>
      <ContextBar theme={theme} />
      <ChatListHeader theme={theme} />

      <ScrollView style={styles.scrollArea}>
        {mockChats.map((chat) => (
          <ChatItemRow
            key={chat.id}
            item={chat}
            theme={theme}
            onPress={() => router.push({ pathname: "/chat-room", params: { id: chat.id } })}
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
    // height: 44,
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
  headerIcon: {
    fontSize: 22,
  },

  // Scroll
  scrollArea: {
    flex: 1,
  },

  // Chat Item
  chatItem: {
    height: 72,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing[4],
    gap: spacing[3],
  },

  // Avatar
  avatar: {
    width: 48,
    height: 48,
    borderRadius: radius.xl,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  avatarText: {
    fontSize: 14,
    fontWeight: fontWeight.semibold,
  },

  // Channel Avatar Icon (bottom-right badge)
  channelAvatarIcon: {
    position: "absolute",
    bottom: -2,
    right: -2,
    width: 18,
    height: 18,
    borderRadius: 6,
    backgroundColor: "#2563eb",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#ffffff",
  },

  // Chat Info
  chatInfo: {
    flex: 1,
    justifyContent: "center",
    minWidth: 0,
  },
  chatTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
  },
  chatNameArea: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    minWidth: 0,
  },
  chatName: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.medium,
    flexShrink: 1,
  },
  chatTime: {
    fontSize: 12,
    flexShrink: 0,
    marginLeft: spacing[2],
  },
  chatBottom: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 4,
  },
  chatPreview: {
    flex: 1,
    fontSize: fontSize.sm,
  },

  // Badge
  chatBadge: {
    minWidth: 20,
    height: 20,
    borderRadius: radius.full,
    backgroundColor: colors.semantic.error.default,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 6,
    flexShrink: 0,
    marginLeft: spacing[2],
  },
  chatBadgeText: {
    fontSize: 11,
    fontWeight: fontWeight.bold,
    color: "#ffffff",
  },

  // Channel Badge
  channelBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    backgroundColor: "#eff6ff",
    marginLeft: 6,
    flexShrink: 0,
  },
  channelBadgeText: {
    fontSize: 11,
    fontWeight: fontWeight.semibold,
    color: "#2563eb",
  },

});
