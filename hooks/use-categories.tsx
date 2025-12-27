import { useQuery } from "@tanstack/react-query";
import Constants from "expo-constants";

const API_URL =
  Constants.expoConfig?.extra?.apiUrl || process.env.EXPO_PUBLIC_API_URL;

// Get all categories
export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const response = await fetch(`${API_URL}/api/categories`);
      if (!response.ok) {
        throw new Error("Failed to fetch categories");
      }
      const data = await response.json();
      return data.data;
    },
  });
}

// Get category by ID
export function useCategory(id: string) {
  return useQuery({
    queryKey: ["category", id],
    queryFn: async () => {
      const response = await fetch(`${API_URL}/api/categories/${id}`);
      if (!response.ok) {
        throw new Error("Failed to fetch category");
      }
      const data = await response.json();
      return data.data;
    },
    enabled: !!id,
  });
}

// Get events by category
export function useCategoryEvents(
  categoryId: string,
  filters?: { limit?: number; offset?: number }
) {
  return useQuery({
    queryKey: ["category-events", categoryId, filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.limit) params.append("limit", filters.limit.toString());
      if (filters?.offset) params.append("offset", filters.offset.toString());

      const response = await fetch(
        `${API_URL}/api/categories/${categoryId}/events?${params}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch category events");
      }
      const data = await response.json();
      return data;
    },
    enabled: !!categoryId,
  });
}
