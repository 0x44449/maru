import { View, Text, ScrollView, Pressable, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "@/constants/useTheme";
import { colors, spacing, radius, fontSize, fontWeight } from "@/constants/theme";
import PersonalProfileIcon from "@/assets/icons/profile/profile_personal.svg";
import WorkspaceProfileIcon from "@/assets/icons/profile/profile_workspace.svg";

// mock 데이터
const mockProfile = {
  name: "김도현",
  email: "dohyun.kim@email.com",
  initials: "DH",
};

type ApprovalPlugin = {
  type: "APPROVAL";
  label: string;
  newCount: number;
  latest: { title: string } | null;
};

type AnnouncementPlugin = {
  type: "ANNOUNCEMENT";
  label: string;
  newCount: number;
  latest: { title: string } | null;
};

type AttendancePlugin = {
  type: "ATTENDANCE";
  label: string;
  status: "working" | "off";
  checkInTime: string | null;
  elapsedMinutes: number;
};

type Plugin = ApprovalPlugin | AnnouncementPlugin | AttendancePlugin;

type Workspace = {
  id: string;
  name: string;
  memberCount: number;
  myDepartment: string | null;
  plugins: Plugin[];
};

const mockWorkspaces: Workspace[] = [
  {
    id: "1",
    name: "주식회사 아테나",
    memberCount: 12,
    myDepartment: "경영팀",
    plugins: [
      {
        type: "APPROVAL",
        label: "결재",
        newCount: 3,
        latest: { title: "휴가 신청서 - 김민수" },
      },
      {
        type: "ANNOUNCEMENT",
        label: "공지",
        newCount: 1,
        latest: { title: "3월 전체 회의 안내" },
      },
      {
        type: "ATTENDANCE",
        label: "근무",
        status: "working",
        checkInTime: "09:02",
        elapsedMinutes: 204,
      },
    ],
  },
  {
    id: "2",
    name: "데모 워크스페이스",
    memberCount: 3,
    myDepartment: null,
    plugins: [
      {
        type: "APPROVAL",
        label: "결재",
        newCount: 0,
        latest: null,
      },
      {
        type: "ATTENDANCE",
        label: "근무",
        status: "off",
        checkInTime: null,
        elapsedMinutes: 0,
      },
    ],
  },
];

function formatElapsed(minutes: number) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h > 0 ? `${h}시간 ${m}분 경과` : `${m}분 경과`;
}

function PluginWidget({ plugin, theme }: { plugin: Plugin; theme: ReturnType<typeof useTheme> }) {
  if (plugin.type === "ATTENDANCE") {
    const isWorking = plugin.status === "working";
    return (
      <View style={[styles.widget, { backgroundColor: theme.surface }]}>
        <View style={styles.widgetLabelBox}>
          <Text style={styles.widgetLabelText}>{plugin.label}</Text>
        </View>
        {isWorking && plugin.checkInTime ? (
          <Text style={[styles.widgetContent, { color: theme.textPrimary }]} numberOfLines={1}>
            {plugin.checkInTime} 출근 · {formatElapsed(plugin.elapsedMinutes)}
          </Text>
        ) : (
          <Text style={[styles.widgetContent, { color: theme.textTertiary }]}>미출근</Text>
        )}
        {isWorking && <View style={styles.statusDotGreen} />}
      </View>
    );
  }

  // APPROVAL, ANNOUNCEMENT
  return (
    <View style={[styles.widget, { backgroundColor: theme.surface }]}>
      <View style={styles.widgetLabelBox}>
        <Text style={styles.widgetLabelText}>{plugin.label}</Text>
      </View>
      <Text
        style={[styles.widgetContent, { color: plugin.latest ? theme.textPrimary : theme.textTertiary }]}
        numberOfLines={1}
      >
        {plugin.latest ? plugin.latest.title : "새 항목 없음"}
      </Text>
      {plugin.newCount > 0 && (
        <View style={[styles.badge, { backgroundColor: colors.primary[600] }]}>
          <Text style={styles.badgeText}>{plugin.newCount}</Text>
        </View>
      )}
    </View>
  );
}

export default function HomeScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { backgroundColor: theme.background, paddingTop: insets.top }]}>
      {/* 스크롤 콘텐츠 */}
      <ScrollView
        style={[styles.scrollArea, { backgroundColor: theme.background }]}
        contentContainerStyle={{ paddingBottom: spacing[6] }}
      >
        {/* 프로필 배너 */}
        <Pressable
          style={({ pressed }) => [
            styles.profileBanner,
            { opacity: pressed ? 0.85 : 1 },
          ]}
        >
          <View style={styles.avatarBox}>
            <Text style={styles.avatarText}>{mockProfile.initials}</Text>
          </View>
          <View style={styles.profileInfo}>
            <View style={styles.profileNameRow}>
              <Text style={[styles.profileName, { color: theme.textPrimary }]}>
                {mockProfile.name}
              </Text>
              <View style={[styles.personalTag, { backgroundColor: colors.primary[50] }]}>
                <PersonalProfileIcon width={12} height={12} style={{ marginRight: 2 }} />
                <Text style={{ fontSize: 11, color: colors.primary[600] }}>개인</Text>
              </View>
            </View>
            <Text style={[styles.profileEmail, { color: theme.textTertiary }]}>
              {mockProfile.email}
            </Text>
          </View>
        </Pressable>

        {/* 워크스페이스 목록 */}
        <View
          style={[
            styles.wsCard,
            { backgroundColor: theme.background, borderColor: theme.border },
          ]}
        >
          <View style={[styles.wsHeader, { borderBottomColor: theme.border }]}>
            <Text style={[styles.wsTitle, { color: theme.textPrimary }]}>
              내 워크스페이스
            </Text>
            <Pressable style={styles.wsMore}>
              <Text style={{ fontSize: 13, color: theme.textTertiary }}>
                관리 ›
              </Text>
            </Pressable>
          </View>

          {mockWorkspaces.map((ws, index) => {
            const hasNoti = ws.plugins.some(
              (p) => (p.type === "APPROVAL" || p.type === "ANNOUNCEMENT") && p.newCount > 0,
            );
            return (
              <Pressable
                key={ws.id}
                style={({ pressed }) => [
                  styles.wsItem,
                  index < mockWorkspaces.length - 1 && {
                    borderBottomWidth: 1,
                    borderBottomColor: theme.border,
                  },
                  { opacity: pressed ? 0.85 : 1 },
                ]}
              >
                {/* 상단: 로고 + 이름/메타 + 알림 dot */}
                <View style={styles.wsItemHeader}>
                  <View
                    style={[
                      styles.wsItemIcon,
                      { backgroundColor: colors.primary[50] },
                    ]}
                  >
                    <Text style={{ fontSize: 16, color: colors.primary[600] }}>🏢</Text>
                  </View>
                  <View style={styles.wsItemInfo}>
                    <Text
                      style={[styles.wsItemName, { color: theme.textPrimary }]}
                      numberOfLines={1}
                    >
                      {ws.name}
                    </Text>
                    <Text style={[styles.wsItemMeta, { color: theme.textTertiary }]}>
                      {[`구성원 ${ws.memberCount}명`, ws.myDepartment].filter(Boolean).join(" · ")}
                    </Text>
                  </View>
                  {hasNoti && <View style={styles.notiDot} />}
                </View>

                {/* 하단: 플러그인 위젯 */}
                <View style={styles.pluginWidgets}>
                  {ws.plugins.map((plugin) => (
                    <PluginWidget key={plugin.type} plugin={plugin} theme={theme} />
                  ))}
                </View>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  ctxBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing[4],
    paddingBottom: spacing[2],
    gap: spacing[2],
  },
  ctxIcon: {
    width: 28,
    height: 28,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  ctxName: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
  },
  header: {
    paddingHorizontal: spacing[4],
    paddingBottom: spacing[2],
  },
  headerTitle: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
  },
  scrollArea: {
    flex: 1,
  },
  profileBanner: {
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[4],
    flexDirection: "row",
    alignItems: "center",
    gap: spacing[3],
  },
  avatarBox: {
    width: 56,
    height: 56,
    borderRadius: radius.full,
    backgroundColor: "#e0e7ff",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: 16,
    fontWeight: fontWeight.semibold,
    color: "#3730a3",
  },
  profileInfo: {
    flex: 1,
  },
  profileNameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing[2],
  },
  profileName: {
    fontSize: fontSize["2xl"],
    fontWeight: fontWeight.bold,
  },
  personalTag: {
    flexDirection: "row",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radius.sm,
  },
  profileEmail: {
    fontSize: 13,
    marginTop: 2,
  },
  wsCard: {
    marginHorizontal: spacing[4],
    marginTop: spacing[2],
    borderRadius: radius.xl,
    borderWidth: 1,
    overflow: "hidden",
  },
  wsHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing[4],
    height: 44,
    borderBottomWidth: 1,
  },
  wsTitle: {
    fontSize: 15,
    fontWeight: fontWeight.semibold,
  },
  wsMore: {
    flexDirection: "row",
    alignItems: "center",
  },
  wsItem: {
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    gap: spacing[2],
  },
  wsItemHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing[2],
  },
  wsItemIcon: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  wsItemInfo: {
    flex: 1,
    gap: 2,
  },
  wsItemName: {
    fontSize: 15,
    fontWeight: fontWeight.semibold,
  },
  wsItemMeta: {
    fontSize: 13,
  },
  pluginWidgets: {
    gap: spacing[2],
  },
  widget: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    borderRadius: radius.md,
    gap: spacing[2],
  },
  widgetLabelBox: {
    backgroundColor: colors.primary[50],
    paddingHorizontal: spacing[2],
    paddingVertical: 2,
    borderRadius: radius.sm,
  },
  widgetLabelText: {
    fontSize: 11,
    fontWeight: fontWeight.semibold,
    color: colors.primary[600],
  },
  widgetContent: {
    flex: 1,
    fontSize: 13,
  },
  badge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 6,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: fontWeight.bold,
    color: "#ffffff",
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  statusDotGreen: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.semantic.success.default,
  },
  statusText: {
    fontSize: 12,
    fontWeight: fontWeight.medium,
  },
  notiDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.semantic.error.default,
  },
});
