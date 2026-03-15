import { View, Text, ScrollView, Pressable, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "@/constants/useTheme";
import { colors, spacing, radius, fontSize, fontWeight } from "@/constants/theme";
import PersonalProfileIcon from "@/assets/icons/profile/profile_personal.svg";
import WorkspaceProfileIcon from "@/assets/icons/profile/profile_workspace.svg";
import WorkClockIcon from "@/assets/icons/workspace/work_clock.svg";
import NoticeIcon from "@/assets/icons/workspace/notice.svg";
import ApprovalIcon from "@/assets/icons/workspace/approval.svg";
import SettingsIcon from "@/assets/icons/workspace/settings.svg";

// mock 데이터
const mockProfile = {
  name: "김도현",
  email: "dohyun.kim@email.com",
  initials: "DH",
};


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
        <View style={styles.wsSection}>
          <View style={styles.wsHeader}>
            <Text style={[styles.wsTitle, { color: theme.textPrimary }]}>
              내 워크스페이스
            </Text>
            <Pressable style={styles.wsMore}>
              <SettingsIcon width={14} height={14} color={theme.textTertiary} />
              <Text style={{ fontSize: 13, color: theme.textTertiary }}>
                관리
              </Text>
            </Pressable>
          </View>

          {/* 주식회사 아테나 */}
          <Pressable
            style={({ pressed }) => [
              styles.wsItem,
              { backgroundColor: theme.surface, borderColor: theme.border },
              { opacity: pressed ? 0.85 : 1 },
            ]}
          >
            <View style={styles.wsItemHeader}>
              <View style={[styles.wsItemIcon, { backgroundColor: colors.primary[50] }]}>
                <Text style={{ fontSize: 16, color: colors.primary[600] }}>🏢</Text>
              </View>
              <View style={styles.wsItemInfo}>
                <Text style={[styles.wsItemName, { color: theme.textPrimary }]} numberOfLines={1}>
                  주식회사 아테나
                </Text>
                <Text style={[styles.wsItemMeta, { color: theme.textTertiary }]}>
                  구성원 12명 · 경영팀
                </Text>
              </View>
              <Text style={[styles.wsItemChevron, { color: theme.textTertiary }]}>›</Text>
            </View>

            <View style={styles.pluginWidgets}>
              {/* 근무 */}
              <View style={styles.attendanceWidget}>
                <View style={styles.attendanceLeft}>
                  <View style={[styles.widgetLabelBox, { backgroundColor: "#E1F5EE" }]}>
                    <WorkClockIcon width={12} height={12} color="#0F6E56" style={{ marginRight: 2 }} />
                    <Text style={[styles.widgetLabelText, { color: "#0F6E56" }]}>근무</Text>
                  </View>
                </View>
                <View style={styles.attendanceRight}>
                  <View style={styles.attendanceRightTop}>
                    <Text style={[styles.widgetContent, { color: theme.textPrimary }]}>3시간 24분</Text>
                    <View style={styles.attendanceStatusBadge}>
                      <Text style={styles.attendanceStatusText}>근무 중</Text>
                    </View>
                  </View>
                  <View style={styles.attendanceRightBottom}>
                    <Text style={styles.attendanceCheckIn}>09:02</Text>
                    <View style={styles.progressTrack}>
                      <View style={[styles.progressFill, { width: "42.5%" }]} />
                    </View>
                  </View>
                </View>
              </View>

              {/* 결재 */}
              <View style={styles.widget}>
                <View style={[styles.widgetLabelBox, { backgroundColor: "#EEEDFE" }]}>
                  <ApprovalIcon width={12} height={12} color="#534AB7" style={{ marginRight: 2 }} />
                  <Text style={[styles.widgetLabelText, { color: "#534AB7" }]}>결재</Text>
                </View>
                <Text style={[styles.widgetContent, { color: theme.textPrimary }]} numberOfLines={1}>
                  휴가 신청서 - 김민수
                </Text>
                <View style={[styles.badge, { backgroundColor: colors.semantic.error.default }]}>
                  <Text style={styles.badgeText}>3</Text>
                </View>
              </View>

              {/* 공지 */}
              <View style={styles.widget}>
                <View style={[styles.widgetLabelBox, { backgroundColor: "#E6F1FB" }]}>
                  <NoticeIcon width={12} height={12} color="#185FA5" style={{ marginRight: 2 }} />
                  <Text style={[styles.widgetLabelText, { color: "#185FA5" }]}>공지</Text>
                </View>
                <Text style={[styles.widgetContent, { color: theme.textPrimary }]} numberOfLines={1}>
                  3월 전체 회의 안내
                </Text>
                <View style={[styles.badge, { backgroundColor: colors.semantic.error.default }]}>
                  <Text style={styles.badgeText}>1</Text>
                </View>
              </View>
            </View>
          </Pressable>

          {/* 데모 워크스페이스 */}
          <Pressable
            style={({ pressed }) => [
              styles.wsItem,
              { backgroundColor: theme.surface, borderColor: theme.border },
              { opacity: pressed ? 0.85 : 1 },
            ]}
          >
            <View style={styles.wsItemHeader}>
              <View style={[styles.wsItemIcon, { backgroundColor: colors.primary[50] }]}>
                <Text style={{ fontSize: 16, color: colors.primary[600] }}>🏢</Text>
              </View>
              <View style={styles.wsItemInfo}>
                <Text style={[styles.wsItemName, { color: theme.textPrimary }]} numberOfLines={1}>
                  데모 워크스페이스
                </Text>
                <Text style={[styles.wsItemMeta, { color: theme.textTertiary }]}>
                  구성원 3명
                </Text>
              </View>
              <Text style={[styles.wsItemChevron, { color: theme.textTertiary }]}>›</Text>
            </View>

            <View style={styles.pluginWidgets}>
              {/* 근무 — 미출근 */}
              <View style={styles.attendanceWidget}>
                <View style={styles.attendanceLeft}>
                  <View style={[styles.widgetLabelBox, { backgroundColor: "#F1EFE8" }]}>
                    <WorkClockIcon width={12} height={12} color="#5F5E5A" style={{ marginRight: 2 }} />
                    <Text style={[styles.widgetLabelText, { color: "#5F5E5A" }]}>근무</Text>
                  </View>
                </View>
                <View style={styles.attendanceRight}>
                  <View style={styles.attendanceRightTop}>
                    <Text style={[styles.widgetContent, { color: "#5F5E5A" }]}>--:--</Text>
                    <View style={[styles.attendanceStatusBadge, { borderColor: "#5F5E5A" }]}>
                      <Text style={[styles.attendanceStatusText, { color: "#5F5E5A" }]}>미출근</Text>
                    </View>
                  </View>
                  <View style={styles.attendanceRightBottom}>
                    <Text style={[styles.attendanceCheckIn, { color: "#5F5E5A" }]}>09:00</Text>
                    <View style={[styles.progressTrack, { backgroundColor: "#F1EFE8" }]}>
                      <View style={[styles.progressFill, { width: "0%", backgroundColor: "#F1EFE8" }]} />
                    </View>
                  </View>
                </View>
              </View>

              {/* 결재 */}
              <View style={styles.widget}>
                <View style={[styles.widgetLabelBox, { backgroundColor: "#EEEDFE" }]}>
                  <ApprovalIcon width={12} height={12} color="#534AB7" style={{ marginRight: 2 }} />
                  <Text style={[styles.widgetLabelText, { color: "#534AB7" }]}>결재</Text>
                </View>
                <Text style={[styles.widgetContent, { color: theme.textTertiary }]} numberOfLines={1}>
                  새 항목 없음
                </Text>
              </View>
            </View>
          </Pressable>
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
  wsSection: {
    marginHorizontal: spacing[4],
    marginTop: spacing[2],
    gap: spacing[2],
  },
  wsHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing[1],
  },
  wsTitle: {
    fontSize: 15,
    fontWeight: fontWeight.semibold,
  },
  wsMore: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  wsItem: {
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    gap: spacing[2],
    borderRadius: radius.lg,
    borderWidth: 1,
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
    fontSize: 16,
    fontWeight: fontWeight.semibold,
  },
  wsItemMeta: {
    fontSize: 13,
  },
  wsItemChevron: {
    fontSize: 18,
  },
  pluginWidgets: {
    gap: spacing[2],
  },
  widget: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing[1],
    gap: spacing[2],
  },
  widgetLabelBox: {
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[1],
    borderRadius: radius.full,
    flexDirection: "row",
    alignItems: "center",
  },
  widgetLabelText: {
    fontSize: 12,
    fontWeight: fontWeight.semibold,
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
  attendanceWidget: {
    flexDirection: "row",
    paddingVertical: spacing[2],
    gap: spacing[2],
  },
  attendanceLeft: {
    justifyContent: "center",
    alignItems: "center",
  },
  attendanceRight: {
    flex: 1,
    justifyContent: "center",
    gap: 2,
  },
  attendanceRightTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  attendanceRightBottom: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing[2],
  },
  attendanceElapsed: {
    fontSize: 17,
    fontWeight: fontWeight.bold,
    color: "#0F6E56",
  },
  attendanceStatusBadge: {
    borderWidth: 1,
    borderColor: "#1D9E75",
    borderRadius: radius.full,
    paddingHorizontal: spacing[2],
    paddingVertical: 1,
  },
  attendanceStatusText: {
    fontSize: 11,
    fontWeight: fontWeight.medium,
    color: "#0F6E56",
  },
  attendanceCheckIn: {
    fontSize: 12,
    color: "#0F6E56",
    fontWeight: fontWeight.medium,
  },
  progressTrack: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#E1F5EE",
  },
  progressFill: {
    height: 8,
    borderRadius: 4,
    backgroundColor: "#1D9E75",
  },
});
