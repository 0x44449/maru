import { View, Text, StyleSheet } from "react-native";
import { useTheme } from "@/constants/useTheme";
import { fontSize, fontWeight } from "@/constants/theme";

export default function MoreScreen() {
  const theme = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.text, { color: theme.textTertiary }]}>더보기 화면 준비 중</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center" },
  text: { fontSize: fontSize.sm, fontWeight: fontWeight.regular },
});
