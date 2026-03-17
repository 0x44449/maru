import { Modal, View, Text, Pressable, StyleSheet } from "react-native";
import { useTheme } from "@/constants/useTheme";
import {
  colors,
  spacing,
  radius,
  fontSize,
  fontWeight,
} from "@/constants/theme";

interface ErrorModalProps {
  visible: boolean;
  title: string;
  message: string;
  buttonText?: string;
  onClose: () => void;
}

export default function ErrorModal({
  visible,
  title,
  message,
  buttonText = "확인",
  onClose,
}: ErrorModalProps) {
  const theme = useTheme();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View
          style={[
            styles.container,
            { backgroundColor: theme.surfaceRaised },
          ]}
        >
          {/* 에러 아이콘 */}
          <View
            style={[
              styles.iconContainer,
              { backgroundColor: colors.semantic.error.light },
            ]}
          >
            <Text style={styles.iconText}>!</Text>
          </View>

          {/* 제목 */}
          <Text style={[styles.title, { color: theme.textPrimary }]}>
            {title}
          </Text>

          {/* 본문 */}
          <Text style={[styles.message, { color: theme.textSecondary }]}>
            {message}
          </Text>

          {/* 확인 버튼 */}
          <Pressable
            style={({ pressed }) => [
              styles.button,
              {
                backgroundColor: colors.primary[500],
                opacity: pressed ? 0.85 : 1,
              },
            ]}
            onPress={onClose}
          >
            <Text style={styles.buttonText}>{buttonText}</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: spacing[4],
  },
  container: {
    width: "100%",
    borderRadius: radius.lg,
    padding: spacing[6],
    alignItems: "center",
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: radius.full,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing[4],
  },
  iconText: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.semantic.error.default,
  },
  title: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    marginBottom: spacing[2],
    textAlign: "center",
  },
  message: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.regular,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: spacing[6],
  },
  button: {
    width: "100%",
    height: 48,
    borderRadius: radius.lg,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonText: {
    color: "#ffffff",
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
  },
});
