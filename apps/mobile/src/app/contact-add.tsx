import { View, Text, TextInput, Pressable, StyleSheet, Keyboard } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useState } from "react";
import { useTheme } from "@/constants/useTheme";
import { colors, spacing, radius, fontSize, fontWeight } from "@/constants/theme";
import ArrowLeftIcon from "@/assets/icons/chat/arrow_left.svg";

// --- Mock 검색 결과 ---

type SearchResult =
  | { status: "found"; name: string; initials: string; userId: string; avatarBg: string; avatarColor: string; alreadyAdded: boolean }
  | { status: "not_found" }
  | null;

function mockSearch(query: string): SearchResult {
  const users: Record<string, { name: string; initials: string; avatarBg: string; avatarColor: string; alreadyAdded: boolean }> = {
    "minji.kim": { name: "민지", initials: "MJ", avatarBg: "#fce7f3", avatarColor: "#be185d", alreadyAdded: true },
    "junho.lee": { name: "준호", initials: "JH", avatarBg: "#dcfce7", avatarColor: "#15803d", alreadyAdded: true },
    "dohyun.kim": { name: "김도현", initials: "DH", avatarBg: "#e0e7ff", avatarColor: "#3730a3", alreadyAdded: false },
    "yujin.han": { name: "유진", initials: "YJ", avatarBg: "#fef3c7", avatarColor: "#92400e", alreadyAdded: false },
  };
  const user = users[query.toLowerCase()];
  if (user) return { status: "found", userId: query.toLowerCase(), ...user };
  return { status: "not_found" };
}

// --- 컴포넌트 ---

function Header({ theme, onBack }: { theme: ReturnType<typeof useTheme>; onBack: () => void }) {
  return (
    <View style={[styles.header, { backgroundColor: theme.background }]}>
      <Pressable style={styles.backBtn} onPress={onBack} hitSlop={4}>
        <ArrowLeftIcon width={24} height={24} color={theme.textPrimary} />
      </Pressable>
      <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>연락처 추가</Text>
    </View>
  );
}

function ResultCard({
  result,
  theme,
}: {
  result: SearchResult;
  theme: ReturnType<typeof useTheme>;
}) {
  if (!result) return null;

  if (result.status === "not_found") {
    return (
      <View style={styles.resultCenter}>
        <Text style={[styles.notFoundText, { color: theme.textTertiary }]}>
          사용자를 찾을 수 없습니다
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.resultCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
      <View style={[styles.resultAvatar, { backgroundColor: result.avatarBg }]}>
        <Text style={[styles.resultAvatarText, { color: result.avatarColor }]}>
          {result.initials}
        </Text>
      </View>
      <Text style={[styles.resultName, { color: theme.textPrimary }]}>{result.name}</Text>
      <Text style={[styles.resultId, { color: theme.textTertiary }]}>@{result.userId}</Text>

      {result.alreadyAdded ? (
        <View style={[styles.addedBtn, { borderColor: theme.border }]}>
          <Text style={[styles.addedBtnText, { color: theme.textTertiary }]}>이미 연락처에 있습니다</Text>
        </View>
      ) : (
        <Pressable
          style={({ pressed }) => [
            styles.addBtn,
            { opacity: pressed ? 0.85 : 1 },
          ]}
        >
          <Text style={styles.addBtnText}>연락처 추가</Text>
        </Pressable>
      )}
    </View>
  );
}

// --- 메인 화면 ---

export default function ContactAddScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<SearchResult>(null);

  const handleSearch = () => {
    Keyboard.dismiss();
    if (query.trim()) {
      setResult(mockSearch(query.trim()));
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background, paddingTop: insets.top }]}>
      <Header theme={theme} onBack={() => router.back()} />

      <View style={styles.content}>
        <Text style={[styles.desc, { color: theme.textSecondary }]}>
          추가할 사용자의 ID를 입력하세요
        </Text>

        <View style={styles.searchRow}>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: theme.surface,
                borderColor: theme.border,
                color: theme.textPrimary,
              },
            ]}
            placeholder="사용자 ID"
            placeholderTextColor={theme.textTertiary}
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={handleSearch}
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="search"
          />
          <Pressable
            style={({ pressed }) => [
              styles.searchBtn,
              { opacity: pressed ? 0.85 : 1 },
              !query.trim() && styles.searchBtnDisabled,
            ]}
            onPress={handleSearch}
            disabled={!query.trim()}
          >
            <Text style={styles.searchBtnText}>검색</Text>
          </Pressable>
        </View>

        <ResultCard result={result} theme={theme} />
      </View>
    </View>
  );
}

// --- 스타일 ---

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  // Header
  header: {
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing[1],
    gap: spacing[1],
  },
  backBtn: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: fontWeight.semibold,
  },

  // Content
  content: {
    paddingHorizontal: spacing[4],
    paddingTop: spacing[2],
  },
  desc: {
    fontSize: fontSize.sm,
    marginBottom: spacing[4],
  },

  // Search
  searchRow: {
    flexDirection: "row",
    gap: spacing[2],
    marginBottom: spacing[6],
  },
  input: {
    flex: 1,
    height: 48,
    borderRadius: radius.sm,
    borderWidth: 1,
    paddingHorizontal: spacing[4],
    fontSize: 15,
  },
  searchBtn: {
    height: 48,
    paddingHorizontal: spacing[5],
    borderRadius: radius.sm,
    backgroundColor: colors.primary[600],
    alignItems: "center",
    justifyContent: "center",
  },
  searchBtnDisabled: {
    opacity: 0.5,
  },
  searchBtnText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: "#ffffff",
  },

  // Result
  resultCenter: {
    alignItems: "center",
    paddingTop: spacing[10],
  },
  notFoundText: {
    fontSize: fontSize.sm,
  },

  // Result Card
  resultCard: {
    alignItems: "center",
    paddingVertical: spacing[8],
    paddingHorizontal: spacing[4],
    borderRadius: radius.sm,
    borderWidth: 1,
  },
  resultAvatar: {
    width: 64,
    height: 64,
    borderRadius: radius.full,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing[3],
  },
  resultAvatarText: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.semibold,
  },
  resultName: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    marginBottom: spacing[1],
  },
  resultId: {
    fontSize: fontSize.sm,
    marginBottom: spacing[5],
  },

  // Add Button
  addBtn: {
    height: 44,
    paddingHorizontal: spacing[8],
    borderRadius: radius.sm,
    backgroundColor: colors.primary[600],
    alignItems: "center",
    justifyContent: "center",
  },
  addBtnText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: "#ffffff",
  },

  // Already Added
  addedBtn: {
    height: 44,
    paddingHorizontal: spacing[8],
    borderRadius: radius.sm,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  addedBtnText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
  },
});
