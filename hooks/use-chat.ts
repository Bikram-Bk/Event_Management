import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import { useCallback, useEffect, useState } from "react";

export interface ChatEvent {
  id: string;
  title: string;
  coverImage: string | null;
  city: string;
  startDate: string;
  isFree: boolean;
  price: number | null;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  events?: ChatEvent[];
  createdAt?: string;
}

interface ChatSession {
  id: string;
  title?: string;
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
}

export function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const apiUrl =
    Constants.expoConfig?.extra?.apiUrl || process.env.EXPO_PUBLIC_API_URL;

  // Load saved session from storage on mount
  useEffect(() => {
    loadSavedSession();
  }, []);

  const loadSavedSession = async () => {
    try {
      const savedSessionId = await AsyncStorage.getItem("chatSessionId");
      if (savedSessionId) {
        setSessionId(savedSessionId);
        // Optionally load session messages from API
        await loadSessionMessages(savedSessionId);
      }
    } catch (err) {
      console.log("No saved chat session");
    }
  };

  const loadSessionMessages = async (sid: string) => {
    try {
      const token = await AsyncStorage.getItem("accessToken");
      if (!token) return;

      const response = await fetch(`${apiUrl}/api/chat/sessions/${sid}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.session?.messages) {
          setMessages(
            data.session.messages.map((m: any) => ({
              id: m.id,
              role: m.role,
              content: m.content,
              createdAt: m.createdAt,
            })),
          );
        }
      }
    } catch (err) {
      console.error("Failed to load session:", err);
    }
  };

  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim()) return;

      // Add user message optimistically
      const userMessage: ChatMessage = {
        id: Date.now().toString(),
        role: "user",
        content: content.trim(),
      };

      setMessages((prev) => [...prev, userMessage]);
      setIsLoading(true);
      setError(null);

      try {
        const token = await AsyncStorage.getItem("accessToken");
        if (!token) {
          throw new Error("Please login to use chat");
        }

        const response = await fetch(`${apiUrl}/api/chat/message`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            message: content.trim(),
            sessionId: sessionId,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to get response");
        }

        const data = await response.json();

        // Save session ID if new
        if (data.sessionId && data.sessionId !== sessionId) {
          setSessionId(data.sessionId);
          await AsyncStorage.setItem("chatSessionId", data.sessionId);
        }

        // Add assistant message with events
        const assistantMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: data.response || "Sorry, I could not generate a response.",
          events: data.events || [], // Include events from response
        };

        setMessages((prev) => [...prev, assistantMessage]);
      } catch (err: any) {
        setError(err.message || "Something went wrong");
        // Add error message
        const errorMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content:
            err.message === "Please login to use chat"
              ? "Please login to use the chat feature."
              : "Sorry, I encountered an error. Please try again.",
        };
        setMessages((prev) => [...prev, errorMessage]);
      } finally {
        setIsLoading(false);
      }
    },
    [apiUrl, sessionId],
  );

  const clearMessages = useCallback(async () => {
    setMessages([]);
    setError(null);

    // Delete session from backend and clear local storage
    if (sessionId) {
      try {
        const token = await AsyncStorage.getItem("accessToken");
        if (token) {
          await fetch(`${apiUrl}/api/chat/sessions/${sessionId}`, {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
        }
      } catch (err) {
        console.error("Failed to delete session:", err);
      }
    }

    setSessionId(null);
    await AsyncStorage.removeItem("chatSessionId");
  }, [apiUrl, sessionId]);

  const startNewSession = useCallback(async () => {
    setMessages([]);
    setSessionId(null);
    await AsyncStorage.removeItem("chatSessionId");
  }, []);

  return {
    messages,
    isLoading,
    error,
    sessionId,
    sendMessage,
    clearMessages,
    startNewSession,
  };
}
