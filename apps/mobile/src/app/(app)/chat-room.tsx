import {
  View,
  Text,
  ScrollView,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useState, useRef } from "react";
import { useTheme } from "@/constants/useTheme";
import { colors, spacing, radius, fontSize, fontWeight } from "@/constants/theme";
import ArrowLeftIcon from "@/assets/icons/chat/arrow_left.svg";
import MoreVerticalIcon from "@/assets/icons/chat/more_vertical.svg";
import PlusCircleIcon from "@/assets/icons/chat/plus_circle.svg";
import SendIcon from "@/assets/icons/chat/send.svg";

// --- Mock 데이터 ---

type Message = {
  id: string;
  text: string;
  time: string;
  isMine: boolean;
};

type ChatRoomData = {
  name: string;
  initials: string;
  avatarBg: string;
  avatarColor: string;
  messages: Message[];
};

const mockRooms: Record<string, ChatRoomData> = {
  "1": {
    name: "민지",
    initials: "MJ",
    avatarBg: "#fce7f3",
    avatarColor: "#be185d",
    messages: [
      { id: "m1", text: "안녕! 잘 지내?", time: "오후 2:28", isMine: false },
      { id: "m2", text: "응 잘 지내~ 너는?", time: "오후 2:29", isMine: true },
      { id: "m3", text: "나도! 주말에 시간 돼?", time: "오후 3:00", isMine: false },
    ],
  },
  "2": {
    name: "준호",
    initials: "JH",
    avatarBg: "#dcfce7",
    avatarColor: "#15803d",
    messages: [
      { id: "m1", text: "어제 보내준 자료 확인했어", time: "오전 10:15", isMine: false },
      { id: "m2", text: "오 고마워! 어떤 것 같아?", time: "오전 10:18", isMine: true },
      { id: "m3", text: "ㅋㅋㅋ 알겠어", time: "오전 10:20", isMine: false },
    ],
  },
};

const defaultRoom: ChatRoomData = {
  name: "알 수 없음",
  initials: "?",
  avatarBg: "#e5e5e5",
  avatarColor: "#737373",
  messages: [],
};

// --- 컴포넌트 ---

function ChatRoomHeader({
  room,
  theme,
  onBack,
}: {
  room: ChatRoomData;
  theme: ReturnType<typeof useTheme>;
  onBack: () => void;
}) {
  return (
    <View style={[styles.header, { backgroundColor: theme.background, borderBottomColor: theme.border }]}>
      <Pressable style={styles.headerBackBtn} onPress={onBack} hitSlop={4}>
        <ArrowLeftIcon width={24} height={24} color={theme.textPrimary} />
      </Pressable>
      <View style={[styles.headerAvatar, { backgroundColor: room.avatarBg }]}>
        <Text style={[styles.headerAvatarText, { color: room.avatarColor }]}>
          {room.initials}
        </Text>
      </View>
      <Text style={[styles.headerName, { color: theme.textPrimary }]} numberOfLines={1}>
        {room.name}
      </Text>
      <Pressable style={styles.headerMoreBtn} hitSlop={4}>
        <MoreVerticalIcon width={20} height={20} color={theme.textSecondary} />
      </Pressable>
    </View>
  );
}

function DateSeparator({ date, theme }: { date: string; theme: ReturnType<typeof useTheme> }) {
  return (
    <View style={styles.dateSeparator}>
      <Text style={[styles.dateSeparatorText, { color: theme.textTertiary, backgroundColor: theme.surface }]}>
        {date}
      </Text>
    </View>
  );
}

function BubbleMine({ message, theme }: { message: Message; theme: ReturnType<typeof useTheme> }) {
  return (
    <View style={styles.bubbleRowMine}>
      <Text style={[styles.bubbleTime, { color: theme.textTertiary }]}>{message.time}</Text>
      <View style={[styles.bubble, styles.bubbleMine]}>
        <Text style={styles.bubbleMineText}>{message.text}</Text>
      </View>
    </View>
  );
}

function BubbleOther({
  message,
  theme,
  room,
}: {
  message: Message;
  theme: ReturnType<typeof useTheme>;
  room: ChatRoomData;
}) {
  return (
    <View style={styles.bubbleRowOther}>
      <View style={[styles.otherAvatar, { backgroundColor: room.avatarBg }]}>
        <Text style={[styles.otherAvatarText, { color: room.avatarColor }]}>{room.initials}</Text>
      </View>
      <View style={styles.otherContent}>
        <Text style={[styles.otherName, { color: theme.textSecondary }]}>{room.name}</Text>
        <View style={styles.otherBubbleRow}>
          <View style={[styles.bubble, styles.bubbleOther, { backgroundColor: theme.background, borderColor: theme.border }]}>
            <Text style={[styles.bubbleOtherText, { color: theme.textPrimary }]}>{message.text}</Text>
          </View>
          <Text style={[styles.bubbleTime, { color: theme.textTertiary }]}>{message.time}</Text>
        </View>
      </View>
    </View>
  );
}

function InputBar({
  theme,
  value,
  onChangeText,
  onSend,
}: {
  theme: ReturnType<typeof useTheme>;
  value: string;
  onChangeText: (text: string) => void;
  onSend: () => void;
}) {
  const hasText = value.trim().length > 0;

  return (
    <View style={[styles.inputBar, { backgroundColor: theme.background, borderTopColor: theme.border }]}>
      <Pressable style={styles.inputAttachBtn} hitSlop={4}>
        <PlusCircleIcon width={24} height={24} color={theme.textTertiary} />
      </Pressable>
      <TextInput
        style={[
          styles.inputField,
          { backgroundColor: theme.surface, borderColor: theme.border, color: theme.textPrimary },
        ]}
        placeholder="메시지 입력..."
        placeholderTextColor={theme.textTertiary}
        value={value}
        onChangeText={onChangeText}
        onSubmitEditing={onSend}
        returnKeyType="send"
        multiline={false}
      />
      <Pressable
        style={[styles.sendBtn, !hasText && { opacity: 0.4 }]}
        onPress={onSend}
        disabled={!hasText}
      >
        <SendIcon width={18} height={18} color="#ffffff" />
      </Pressable>
    </View>
  );
}

// --- 메인 화면 ---

export default function ChatRoomScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [inputText, setInputText] = useState("");
  const [messages, setMessages] = useState<Message[]>(
    () => (mockRooms[id ?? ""] ?? defaultRoom).messages,
  );
  const scrollRef = useRef<ScrollView>(null);

  const room = mockRooms[id ?? ""] ?? defaultRoom;

  const handleSend = () => {
    const text = inputText.trim();
    if (!text) return;
    const newMsg: Message = {
      id: `m${Date.now()}`,
      text,
      time: "방금",
      isMine: true,
    };
    setMessages((prev) => [...prev, newMsg]);
    setInputText("");
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.surface }]}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={{ paddingTop: insets.top, backgroundColor: theme.background }}>
        <ChatRoomHeader room={room} theme={theme} onBack={() => router.back()} />
      </View>

      <ScrollView
        ref={scrollRef}
        style={styles.messageArea}
        contentContainerStyle={styles.messageContent}
        onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: false })}
      >
        <DateSeparator date="2026년 3월 15일" theme={theme} />
        {messages.map((msg) =>
          msg.isMine ? (
            <BubbleMine key={msg.id} message={msg} theme={theme} />
          ) : (
            <BubbleOther key={msg.id} message={msg} theme={theme} room={room} />
          ),
        )}
      </ScrollView>

      <View style={{ paddingBottom: insets.bottom, backgroundColor: theme.background }}>
        <InputBar
          theme={theme}
          value={inputText}
          onChangeText={setInputText}
          onSend={handleSend}
        />
      </View>
    </KeyboardAvoidingView>
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
    paddingRight: spacing[1],
    borderBottomWidth: 1,
  },
  headerBackBtn: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  headerAvatar: {
    width: 32,
    height: 32,
    borderRadius: radius.full,
    alignItems: "center",
    justifyContent: "center",
  },
  headerAvatarText: {
    fontSize: 12,
    fontWeight: fontWeight.semibold,
  },
  headerName: {
    flex: 1,
    fontSize: 15,
    fontWeight: fontWeight.semibold,
    marginLeft: spacing[2],
  },
  headerMoreBtn: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },

  // Messages
  messageArea: {
    flex: 1,
  },
  messageContent: {
    padding: spacing[4],
    gap: spacing[3],
  },

  // Date Separator
  dateSeparator: {
    alignItems: "center",
    paddingVertical: spacing[2],
  },
  dateSeparatorText: {
    fontSize: fontSize[2],
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1],
    borderRadius: radius[1],
    overflow: "hidden",
  },

  // Bubbles
  bubbleRowMine: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "flex-end",
    gap: 6,
  },
  bubbleRowOther: {
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "flex-start",
    gap: spacing[2],
  },
  otherAvatar: {
    width: 36,
    height: 36,
    borderRadius: radius.full,
    alignItems: "center",
    justifyContent: "center",
  },
  otherAvatarText: {
    fontSize: 12,
    fontWeight: fontWeight.semibold,
  },
  otherContent: {
    flex: 1,
    gap: 4,
  },
  otherName: {
    fontSize: fontSize[2],
    fontWeight: fontWeight.semibold,
  },
  otherBubbleRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 6,
  },
  bubble: {
    maxWidth: 240,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 16,
  },
  bubbleMine: {
    backgroundColor: colors.primary[600],
  },
  bubbleMineText: {
    fontSize: fontSize[3],
    lineHeight: 21,
    color: "#ffffff",
  },
  bubbleOther: {
    borderWidth: 1,
  },
  bubbleOtherText: {
    fontSize: fontSize[3],
    lineHeight: 21,
  },
  bubbleTime: {
    fontSize: 11,
    flexShrink: 0,
  },

  // Input Bar
  inputBar: {
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing[3],
    gap: spacing[2],
    borderTopWidth: 1,
  },
  inputAttachBtn: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  inputField: {
    flex: 1,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: spacing[4],
    fontSize: fontSize[3],
  },
  sendBtn: {
    width: 36,
    height: 36,
    borderRadius: radius.full,
    backgroundColor: colors.primary[600],
    alignItems: "center",
    justifyContent: "center",
  },
});
