import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  ImageBackground,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { useTheme } from "@/constants/useTheme";
import { colors, spacing, radius, fontSize, fontWeight } from "@/constants/theme";
import ArrowLeftIcon from "@/assets/icons/chat/arrow_left.svg";

// --- Mock 데이터 ---

type ProfileData = {
  name: string;
  userId: string;
  initials: string;
  avatarBg: string;
  avatarColor: string;
  statusMessage?: string;
  backgroundUri?: string;
  isFriend: boolean;
  bio?: string;
  feeds: FeedItem[];
};

type FeedItem = {
  id: string;
  message?: string;
  imageCount?: number;
  timestamp: string;
};

const mockProfiles: Record<string, ProfileData> = {
  "1": {
    name: "민지",
    userId: "minji.kim",
    initials: "MJ",
    avatarBg: "#fce7f3",
    avatarColor: "#be185d",
    statusMessage: "오늘도 화이팅 🔥",
    isFriend: true,
    bio: "커피와 코딩을 좋아하는 개발자입니다 ☕️",
    feeds: [
      { id: "f1", message: "주말 카페 투어 🍰", imageCount: 3, timestamp: "3월 15일" },
      { id: "f2", message: "새 프로젝트 시작!", timestamp: "3월 12일" },
      { id: "f3", imageCount: 1, timestamp: "3월 8일" },
    ],
  },
  "2": {
    name: "준호",
    userId: "junho.lee",
    initials: "JH",
    avatarBg: "#dcfce7",
    avatarColor: "#15803d",
    statusMessage: "🏃 운동 중",
    isFriend: true,
    bio: "풀스택 개발자 / 러닝 크루 멤버",
    feeds: [
      { id: "f1", message: "한강 러닝 완료 🏅", imageCount: 2, timestamp: "3월 16일" },
    ],
  },
  "3": {
    name: "서연",
    userId: "seoyeon.park",
    initials: "SY",
    avatarBg: "#dbeafe",
    avatarColor: "#1d4ed8",
    isFriend: true,
    bio: "디자이너 / 그림 그리는 것을 좋아합니다",
    feeds: [],
  },
  unknown: {
    name: "김도현",
    userId: "dohyun.kim",
    initials: "DH",
    avatarBg: "#e0e7ff",
    avatarColor: "#3730a3",
    statusMessage: "집중 모드 🎧",
    isFriend: false,
    bio: "백엔드 엔지니어 @ 아테나",
    feeds: [
      { id: "f1", message: "새로운 API 설계 완료 ✅", timestamp: "3월 14일" },
    ],
  },
};

// --- 컴포넌트 ---

function OverlayHeader({
  onBack,
}: {
  onBack: () => void;
}) {
  return (
    <View style={styles.overlayHeader}>
      <Pressable style={styles.overlayBtn} onPress={onBack} hitSlop={4}>
        <ArrowLeftIcon width={24} height={24} color="#ffffff" />
      </Pressable>
      <View style={{ flex: 1 }} />
      <Pressable style={styles.overlayBtn} hitSlop={4}>
        <Text style={styles.overlayDots}>···</Text>
      </Pressable>
    </View>
  );
}

function HeroSection({
  profile,
  insetTop,
  onBack,
}: {
  profile: ProfileData;
  insetTop: number;
  onBack: () => void;
}) {
  const heroContent = (
    <View style={[styles.heroInner, { paddingTop: insetTop }]}>
      <OverlayHeader onBack={onBack} />
      <View style={styles.heroBottom}>
        <View style={styles.profileRow}>
          <View style={[styles.heroAvatar, { backgroundColor: profile.avatarBg }]}>
            <Text style={[styles.heroAvatarText, { color: profile.avatarColor }]}>
              {profile.initials}
            </Text>
          </View>
          <View style={styles.profileTextArea}>
            <Text style={styles.heroName}>{profile.name}</Text>
            <Text style={styles.heroUserId}>@{profile.userId}</Text>
          </View>
        </View>
        {profile.statusMessage && (
          <Text style={styles.heroStatus}>{profile.statusMessage}</Text>
        )}
      </View>
    </View>
  );

  if (profile.backgroundUri) {
    return (
      <ImageBackground
        source={{ uri: profile.backgroundUri }}
        style={styles.hero}
        imageStyle={styles.heroImage}
      >
        <View style={styles.heroOverlay} />
        {heroContent}
      </ImageBackground>
    );
  }

  return (
    <View style={[styles.hero, styles.heroDefault]}>
      {heroContent}
    </View>
  );
}

function ActionButtons({
  profile,
  theme,
}: {
  profile: ProfileData;
  theme: ReturnType<typeof useTheme>;
}) {
  if (profile.isFriend) {
    return (
      <View style={styles.actionRow}>
        <Pressable
          style={({ pressed }) => [
            styles.actionBtn,
            { backgroundColor: colors.primary[600], opacity: pressed ? 0.85 : 1 },
          ]}
        >
          <Text style={styles.actionIcon}>💬</Text>
          <Text style={styles.actionBtnText}>채팅하기</Text>
        </Pressable>
        <Pressable
          style={({ pressed }) => [
            styles.actionBtn,
            { backgroundColor: theme.surface, borderWidth: 1, borderColor: theme.border, opacity: pressed ? 0.85 : 1 },
          ]}
        >
          <Text style={styles.actionIcon}>📞</Text>
          <Text style={[styles.actionBtnText, { color: theme.textPrimary }]}>음성통화</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.actionRow}>
      <Pressable
        style={({ pressed }) => [
          styles.actionBtn,
          { flex: 1, backgroundColor: colors.primary[600], opacity: pressed ? 0.85 : 1 },
        ]}
      >
        <Text style={styles.actionIcon}>👤</Text>
        <Text style={styles.actionBtnText}>친구 추가</Text>
      </Pressable>
    </View>
  );
}

function TabBar({
  activeTab,
  onSelect,
  theme,
}: {
  activeTab: "feed" | "about";
  onSelect: (tab: "feed" | "about") => void;
  theme: ReturnType<typeof useTheme>;
}) {
  return (
    <View style={[styles.tabBar, { borderBottomColor: theme.border }]}>
      <Pressable
        style={[styles.tab, activeTab === "feed" && [styles.tabActive, { borderBottomColor: theme.textPrimary }]]}
        onPress={() => onSelect("feed")}
      >
        <Text
          style={[
            styles.tabText,
            { color: activeTab === "feed" ? theme.textPrimary : theme.textTertiary },
          ]}
        >
          피드
        </Text>
      </Pressable>
      <Pressable
        style={[styles.tab, activeTab === "about" && [styles.tabActive, { borderBottomColor: theme.textPrimary }]]}
        onPress={() => onSelect("about")}
      >
        <Text
          style={[
            styles.tabText,
            { color: activeTab === "about" ? theme.textPrimary : theme.textTertiary },
          ]}
        >
          소개
        </Text>
      </Pressable>
    </View>
  );
}

function FeedTab({
  feeds,
  theme,
}: {
  feeds: FeedItem[];
  theme: ReturnType<typeof useTheme>;
}) {
  if (feeds.length === 0) {
    return (
      <View style={styles.emptyTab}>
        <Text style={[styles.emptyText, { color: theme.textTertiary }]}>
          아직 피드가 없습니다
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.feedList}>
      {feeds.map((feed, idx) => (
        <View key={feed.id}>
          {idx > 0 && <View style={[styles.feedDivider, { backgroundColor: theme.border }]} />}
          <View style={styles.feedItem}>
            {feed.message && (
              <Text style={[styles.feedMessage, { color: theme.textPrimary }]}>
                {feed.message}
              </Text>
            )}
            {feed.imageCount && feed.imageCount > 0 && (
              <View style={styles.feedImageRow}>
                {Array.from({ length: Math.min(feed.imageCount, 3) }).map((_, i) => (
                  <View
                    key={i}
                    style={[styles.feedImagePlaceholder, { backgroundColor: theme.surface, borderColor: theme.border }]}
                  >
                    <Text style={{ fontSize: 20 }}>🖼️</Text>
                  </View>
                ))}
              </View>
            )}
            <Text style={[styles.feedTime, { color: theme.textTertiary }]}>{feed.timestamp}</Text>
          </View>
        </View>
      ))}
    </View>
  );
}

function AboutTab({
  profile,
  theme,
}: {
  profile: ProfileData;
  theme: ReturnType<typeof useTheme>;
}) {
  return (
    <View style={styles.aboutContent}>
      {profile.bio ? (
        <Text style={[styles.aboutText, { color: theme.textPrimary }]}>{profile.bio}</Text>
      ) : (
        <View style={styles.emptyTab}>
          <Text style={[styles.emptyText, { color: theme.textTertiary }]}>
            소개가 없습니다
          </Text>
        </View>
      )}
    </View>
  );
}

// --- 메인 화면 ---

export default function ProfileDetailScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState<"feed" | "about">("feed");

  const profile = mockProfiles[id ?? "unknown"] ?? mockProfiles["unknown"]!;

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView style={{ flex: 1 }} bounces={false}>
        <HeroSection profile={{ ...profile, backgroundUri: undefined }} insetTop={insets.top} onBack={() => router.back()} />

        <View style={styles.body}>
          <ActionButtons profile={profile} theme={theme} />
          <TabBar activeTab={activeTab} onSelect={setActiveTab} theme={theme} />

          <View style={{ flex: 1, backgroundColor: theme.surface }}>
            {activeTab === "feed" ? (
              <FeedTab feeds={profile.feeds} theme={theme} />
            ) : (
              <AboutTab profile={profile} theme={theme} />
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

// --- 스타일 ---

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  // Hero
  hero: {
    minHeight: 300,
  },
  heroDefault: {
    backgroundColor: "#2e1065",
  },
  heroImage: {
    resizeMode: "cover",
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.35)",
  },
  heroInner: {
    flex: 1,
    justifyContent: "space-between",
  },

  // Overlay Header
  overlayHeader: {
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing[1],
  },
  overlayBtn: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  overlayDots: {
    fontSize: 20,
    color: "#ffffff",
    fontWeight: fontWeight.bold,
  },

  // Hero Bottom
  heroBottom: {
    paddingHorizontal: spacing[4],
    paddingBottom: spacing[5],
    gap: spacing[2],
  },
  profileRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing[3],
  },
  heroAvatar: {
    width: 72,
    height: 72,
    borderRadius: radius.full,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: "rgba(255,255,255,0.3)",
  },
  heroAvatarText: {
    fontSize: 22,
    fontWeight: fontWeight.bold,
  },
  profileTextArea: {
    flex: 1,
    gap: 2,
  },
  heroName: {
    fontSize: fontSize[6],
    fontWeight: fontWeight.bold,
    color: "#ffffff",
  },
  heroUserId: {
    fontSize: fontSize[3],
    color: "rgba(255,255,255,0.7)",
  },
  heroStatus: {
    fontSize: fontSize[3],
    color: "rgba(255,255,255,0.85)",
    marginLeft: 0,
  },

  // Body
  body: {
    flex: 1,
  },

  // Action Buttons
  actionRow: {
    flexDirection: "row",
    gap: spacing[2],
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[4],
  },
  actionBtn: {
    flex: 1,
    height: 44,
    borderRadius: radius[1],
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing[2],
  },
  actionIcon: {
    fontSize: 16,
  },
  actionBtnText: {
    fontSize: fontSize[3],
    fontWeight: fontWeight.semibold,
    color: "#ffffff",
  },

  // Tab Bar
  tabBar: {
    flexDirection: "row",
    borderBottomWidth: 1,
  },
  tab: {
    flex: 1,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  tabActive: {
    borderBottomWidth: 2,
    borderBottomColor: undefined,
  },
  tabText: {
    fontSize: fontSize[3],
    fontWeight: fontWeight.semibold,
  },

  // Feed
  feedList: {
    paddingVertical: spacing[2],
  },
  feedItem: {
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    gap: spacing[2],
  },
  feedDivider: {
    height: 1,
    marginHorizontal: spacing[4],
  },
  feedMessage: {
    fontSize: fontSize[3],
    lineHeight: 20,
  },
  feedImageRow: {
    flexDirection: "row",
    gap: spacing[2],
  },
  feedImagePlaceholder: {
    width: 80,
    height: 80,
    borderRadius: radius[1],
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  feedTime: {
    fontSize: fontSize[2],
  },

  // About
  aboutContent: {
    padding: spacing[4],
  },
  aboutText: {
    fontSize: fontSize[3],
    lineHeight: 22,
  },

  // Empty
  emptyTab: {
    alignItems: "center",
    paddingTop: spacing[10],
  },
  emptyText: {
    fontSize: fontSize[3],
  },
});
