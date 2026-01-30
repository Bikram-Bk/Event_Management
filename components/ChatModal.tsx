import { Ionicons } from "@expo/vector-icons";
import Constants from "expo-constants";
import { useRouter } from "expo-router";
import React, { useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Colors } from "../constants/Colors";
import { useTheme } from "../context/ThemeContext";
import { ChatEvent, ChatMessage, useChat } from "../hooks/use-chat";

interface ChatModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function ChatModal({ visible, onClose }: ChatModalProps) {
  const router = useRouter();
  const { actualTheme } = useTheme();
  const colors = Colors[actualTheme];
  const { messages, isLoading, sendMessage, clearMessages } = useChat();
  const [inputText, setInputText] = useState("");
  const flatListRef = useRef<FlatList>(null);

  const apiUrl =
    Constants.expoConfig?.extra?.apiUrl || process.env.EXPO_PUBLIC_API_URL;

  // Use accent color for buttons (visible in both themes)
  const accentColor = colors.accent;
  const accentTextColor = actualTheme === "dark" ? "#0F172A" : "#FFFFFF";

  const getImageUrl = (path: string | null) => {
    if (!path) return null;
    if (path.startsWith("http")) return path;
    return `${apiUrl}${path}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.ceil(
      (date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
    );

    // Show relative or friendly date
    if (diffDays === 0) {
      return `Today, ${date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })}`;
    } else if (diffDays === 1) {
      return `Tomorrow, ${date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })}`;
    } else if (diffDays > 1 && diffDays <= 7) {
      return date.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      });
    } else {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
      });
    }
  };

  const handleEventPress = (eventId: string) => {
    onClose();
    router.push(`/event/${eventId}`);
  };

  const handleSend = async () => {
    if (!inputText.trim() || isLoading) return;
    const text = inputText;
    setInputText("");
    await sendMessage(text);
    // Scroll to bottom after sending
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const renderEventCard = (event: ChatEvent) => (
    <TouchableOpacity
      key={event.id}
      style={[
        styles.eventCard,
        { backgroundColor: colors.background, borderColor: colors.border },
      ]}
      onPress={() => handleEventPress(event.id)}
      activeOpacity={0.8}
    >
      {event.coverImage ? (
        <Image
          source={{ uri: getImageUrl(event.coverImage) as string }}
          style={styles.eventImage}
        />
      ) : (
        <View
          style={[
            styles.eventImagePlaceholder,
            { backgroundColor: colors.border },
          ]}
        >
          <Ionicons name="calendar" size={24} color={colors.secondary} />
        </View>
      )}
      <View style={styles.eventInfo}>
        <Text
          style={[styles.eventTitle, { color: colors.text }]}
          numberOfLines={1}
        >
          {event.title}
        </Text>
        <View style={styles.eventMeta}>
          <Ionicons
            name="location-outline"
            size={12}
            color={colors.secondary}
          />
          <Text
            style={[styles.eventMetaText, { color: colors.secondary }]}
            numberOfLines={1}
          >
            {event.city}
          </Text>
        </View>
        <View style={styles.eventFooter}>
          <Text style={[styles.eventDate, { color: accentColor }]}>
            {formatDate(event.startDate)}
          </Text>
          <Text style={[styles.eventPrice, { color: colors.text }]}>
            {event.isFree ? "Free" : `NPR ${event.price}`}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderMessage = ({ item }: { item: ChatMessage }) => {
    const isUser = item.role === "user";
    return (
      <View>
        <View
          style={[
            styles.messageBubble,
            isUser
              ? [styles.userBubble, { backgroundColor: accentColor }]
              : [styles.assistantBubble, { backgroundColor: colors.card }],
          ]}
        >
          <Text
            style={[
              styles.messageText,
              { color: isUser ? accentTextColor : colors.text },
            ]}
          >
            {item.content}
          </Text>
        </View>

        {/* Event Cards - Only show for assistant messages */}
        {!isUser && item.events && item.events.length > 0 && (
          <View style={styles.eventsContainer}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.eventsScrollContent}
            >
              {item.events.map(renderEventCard)}
            </ScrollView>
          </View>
        )}
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={[styles.container, { backgroundColor: colors.background }]}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={0}
      >
        {/* Header */}
        <View
          style={[
            styles.header,
            { backgroundColor: colors.card, borderBottomColor: colors.border },
          ]}
        >
          <View style={styles.headerLeft}>
            <View style={[styles.aiAvatar, { backgroundColor: accentColor }]}>
              <Ionicons name="sparkles" size={18} color={accentTextColor} />
            </View>
            <View>
              <Text style={[styles.headerTitle, { color: colors.text }]}>
                AI Assistant
              </Text>
              <Text
                style={[styles.headerSubtitle, { color: colors.secondary }]}
              >
                Ask me anything about events
              </Text>
            </View>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={[styles.headerButton, { backgroundColor: colors.border }]}
              onPress={clearMessages}
            >
              <Ionicons name="trash-outline" size={18} color={colors.text} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.headerButton, { backgroundColor: colors.border }]}
              onPress={onClose}
            >
              <Ionicons name="close" size={20} color={colors.text} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Messages */}
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessage}
          contentContainerStyle={styles.messagesList}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => {
            if (messages.length > 0) {
              flatListRef.current?.scrollToEnd({ animated: false });
            }
          }}
          onLayout={() => {
            if (messages.length > 0) {
              flatListRef.current?.scrollToEnd({ animated: false });
            }
          }}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <View
                style={[styles.emptyIcon, { backgroundColor: colors.card }]}
              >
                <Ionicons
                  name="chatbubbles-outline"
                  size={48}
                  color={colors.secondary}
                />
              </View>
              <Text style={[styles.emptyTitle, { color: colors.text }]}>
                Hi! I'm your Event Assistant
              </Text>
              <Text style={[styles.emptySubtitle, { color: colors.secondary }]}>
                Ask me about events, how to create one, or anything else!
              </Text>
              <View style={styles.suggestions}>
                {[
                  "Find wedding events",
                  "How to create an event?",
                  "Events in Kathmandu",
                ].map((suggestion) => (
                  <TouchableOpacity
                    key={suggestion}
                    style={[
                      styles.suggestionChip,
                      {
                        backgroundColor: colors.card,
                        borderColor: colors.border,
                      },
                    ]}
                    onPress={() => {
                      setInputText(suggestion);
                    }}
                  >
                    <Text
                      style={[styles.suggestionText, { color: colors.accent }]}
                    >
                      {suggestion}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          }
        />

        {/* Loading indicator */}
        {isLoading && (
          <View
            style={[styles.loadingContainer, { backgroundColor: colors.card }]}
          >
            <ActivityIndicator size="small" color={accentColor} />
            <Text style={[styles.loadingText, { color: colors.secondary }]}>
              Thinking...
            </Text>
          </View>
        )}

        {/* Input */}
        <View
          style={[
            styles.inputContainer,
            { backgroundColor: colors.card, borderTopColor: colors.border },
          ]}
        >
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colors.background,
                color: colors.text,
                borderColor: colors.border,
                borderWidth: 1,
              },
            ]}
            placeholder="Type your message..."
            placeholderTextColor={colors.secondary}
            value={inputText}
            onChangeText={setInputText}
            multiline
            maxLength={500}
            onSubmitEditing={handleSend}
            returnKeyType="send"
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              {
                backgroundColor: inputText.trim() ? accentColor : colors.border,
              },
            ]}
            onPress={handleSend}
            disabled={!inputText.trim() || isLoading}
          >
            <Ionicons
              name="send"
              size={18}
              color={inputText.trim() ? accentTextColor : colors.secondary}
            />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: Platform.OS === "ios" ? 16 : 12,
    borderBottomWidth: 1,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  aiAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "700",
  },
  headerSubtitle: {
    fontSize: 12,
  },
  headerActions: {
    flexDirection: "row",
    gap: 8,
  },
  headerButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  messagesList: {
    padding: 16,
    paddingBottom: 100,
  },
  messageBubble: {
    maxWidth: "80%",
    padding: 12,
    borderRadius: 16,
    marginBottom: 8,
  },
  userBubble: {
    alignSelf: "flex-end",
    borderBottomRightRadius: 4,
  },
  assistantBubble: {
    alignSelf: "flex-start",
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 22,
  },
  eventsContainer: {
    marginTop: 8,
    marginBottom: 12,
  },
  eventsScrollContent: {
    paddingRight: 16,
    gap: 12,
  },
  eventCard: {
    width: 200,
    borderRadius: 12,
    borderWidth: 1,
    overflow: "hidden",
  },
  eventImage: {
    width: "100%",
    height: 100,
    resizeMode: "cover",
  },
  eventImagePlaceholder: {
    width: "100%",
    height: 100,
    alignItems: "center",
    justifyContent: "center",
  },
  eventInfo: {
    padding: 10,
  },
  eventTitle: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 4,
  },
  eventMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 6,
  },
  eventMetaText: {
    fontSize: 12,
    flex: 1,
  },
  eventFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  eventDate: {
    fontSize: 12,
    fontWeight: "600",
  },
  eventPrice: {
    fontSize: 12,
    fontWeight: "500",
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
    paddingTop: 80,
  },
  emptyIcon: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 8,
    textAlign: "center",
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: "center",
    marginBottom: 24,
  },
  suggestions: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 8,
  },
  suggestionChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
  },
  suggestionText: {
    fontSize: 13,
    fontWeight: "600",
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 8,
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 12,
  },
  loadingText: {
    fontSize: 13,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    padding: 16,
    paddingBottom: Platform.OS === "ios" ? 32 : 16,
    gap: 12,
    borderTopWidth: 1,
  },
  input: {
    flex: 1,
    minHeight: 44,
    maxHeight: 120,
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
});
