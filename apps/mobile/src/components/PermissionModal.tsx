import { Linking, Modal, View, Text, Pressable, StyleSheet } from "react-native";
import { useTheme } from "@/constants/useTheme";
import {
  colors,
  spacing,
  size,
  radius,
  fontSize,
  lineHeight,
  fontWeight,
} from "@/constants/theme";

interface PermissionModalProps {
  visible: boolean;
  title: string;
  message: string;
  onClose: () => void;
}

export default function PermissionModal({
  visible,
  title,
  message,
  onClose,
}: PermissionModalProps) {
  const theme = useTheme();

  const handleOpenSettings = () => {
    Linking.openSettings();
    onClose();
  };

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
          <Text style={[styles.title, { color: theme.textPrimary }]}>
            {title}
          </Text>

          <Text style={[styles.message, { color: theme.textSecondary }]}>
            {message}
          </Text>

          <View style={styles.buttonRow}>
            <Pressable
              style={({ pressed }) => [
                styles.button,
                styles.cancelButton,
                {
                  backgroundColor: theme.surface,
                  opacity: pressed ? 0.85 : 1,
                },
              ]}
              onPress={onClose}
            >
              <Text style={[styles.cancelButtonText, { color: theme.textSecondary }]}>취소</Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => [
                styles.button,
                styles.settingsButton,
                {
                  backgroundColor: colors.primary[500],
                  opacity: pressed ? 0.85 : 1,
                },
              ]}
              onPress={handleOpenSettings}
            >
              <Text style={styles.settingsButtonText}>설정으로 이동</Text>
            </Pressable>
          </View>
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
    paddingHorizontal: spacing[5],
  },
  container: {
    width: "100%",
    borderRadius: radius[4],
    padding: spacing[5],
    alignItems: "center",
  },
  title: {
    fontSize: fontSize[5],
    fontWeight: fontWeight.semibold,
    marginBottom: spacing[2],
    textAlign: "center",
  },
  message: {
    fontSize: fontSize[3],
    fontWeight: fontWeight.regular,
    textAlign: "center",
    lineHeight: lineHeight[3],
    marginBottom: spacing[5],
  },
  buttonRow: {
    flexDirection: "row",
    gap: spacing[2],
    width: "100%",
  },
  button: {
    flex: 1,
    height: size[4],
    borderRadius: radius[4],
    justifyContent: "center",
    alignItems: "center",
  },
  cancelButton: {},
  cancelButtonText: {
    fontSize: fontSize[4],
    fontWeight: fontWeight.semibold,
  },
  settingsButton: {},
  settingsButtonText: {
    color: "#ffffff",
    fontSize: fontSize[4],
    fontWeight: fontWeight.semibold,
  },
});
