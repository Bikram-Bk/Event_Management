import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";

const API_URL =
  Constants.expoConfig?.extra?.apiUrl || process.env.EXPO_PUBLIC_API_URL;

async function getAuthToken() {
  return await AsyncStorage.getItem("accessToken");
}

// Check if user is registered for event
export function useCheckRegistration(eventId: string) {
  return useQuery({
    queryKey: ["registration", eventId],
    queryFn: async () => {
      const token = await getAuthToken();
      if (!token) return null; // Guest user

      // Fetch user's registered events
      const response = await fetch(`${API_URL}/api/users/events`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) return null;

      const json = await response.json();
      const events = json.data;

      // Check if current event is in the list
      // Note: Backend returns 'attendees' records with 'event' relation
      // We need to check if any record matches this eventId
      const registration = events.find((e: any) => e.eventId === eventId);
      return registration || null;
    },
    enabled: !!eventId,
    retry: false,
  });
}

// Register for event mutation
export function useRegisterEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ eventId, data }: { eventId: string; data?: any }) => {
      const token = await getAuthToken();
      const response = await fetch(
        `${API_URL}/api/events/${eventId}/register`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(data || {}),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to register for event");
      }

      return await response.json();
    },
    onSuccess: (_, variables) => {
      // Invalidate event details and user's registered events
      queryClient.invalidateQueries({ queryKey: ["event", variables.eventId] });
      queryClient.invalidateQueries({ queryKey: ["user-registered-events"] });
      queryClient.invalidateQueries({
        queryKey: ["registration", variables.eventId],
      });
    },
  });
}

// Cancel registration mutation
export function useCancelRegistration() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (eventId: string) => {
      const token = await getAuthToken();
      const response = await fetch(
        `${API_URL}/api/events/${eventId}/register`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to cancel registration");
      }

      return await response.json();
    },
    onSuccess: (_, eventId) => {
      queryClient.invalidateQueries({ queryKey: ["event", eventId] });
      queryClient.invalidateQueries({ queryKey: ["user-registered-events"] });
    },
  });
}

// Get event attendees (organizer only)
export function useEventAttendees(eventId: string) {
  return useQuery({
    queryKey: ["event-attendees", eventId],
    queryFn: async () => {
      const token = await getAuthToken();
      const response = await fetch(
        `${API_URL}/api/events/${eventId}/attendees`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch attendees");
      }

      const data = await response.json();
      return data.data;
    },
    enabled: !!eventId,
  });
}

// Get user's registered events
export function useUserEvents() {
  return useQuery({
    queryKey: ["user-registered-events"],
    queryFn: async () => {
      const token = await getAuthToken();
      if (!token) return [];

      const response = await fetch(`${API_URL}/api/users/events`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch user events");
      }

      const json = await response.json();
      return json.data;
    },
  });
}
