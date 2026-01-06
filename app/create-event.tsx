import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Constants from "expo-constants";
import { Colors } from "../constants/Colors";
import { useCategories } from "../hooks/use-categories";
import { useRequestEvent } from "../hooks/use-events";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function CreateEventScreen() {
  const router = useRouter();
  const { data: categories, isLoading: categoriesLoading } = useCategories();
  const createEventMutation = useRequestEvent();
  const [isUploading, setIsUploading] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    categoryId: "",
    startDate: new Date(),
    endDate: new Date(Date.now() + 3600000), // Default to 1 hour later
    venueName: "",
    address: "",
    city: "",
    state: "",
    isVirtual: false,
    isFree: true,
    price: "0",
    currency: "NPR",
    capacity: "",
    coverImage: "",
    images: [] as string[],
  });

  const [pickerState, setPickerState] = useState<{
    show: boolean;
    mode: "date" | "time";
    target: "start" | "end";
  }>({
    show: false,
    mode: "date",
    target: "start",
  });

  const uploadImage = async (uri: string) => {
    try {
      setIsUploading(true);
      const token = await AsyncStorage.getItem("accessToken");
      const apiUrl =
        Constants.expoConfig?.extra?.apiUrl || process.env.EXPO_PUBLIC_API_URL;

      const formData = new FormData();
      // @ts-ignore
      formData.append("file", {
        uri,
        name: "upload.jpg",
        type: "image/jpeg",
      });

      const response = await fetch(`${apiUrl}/api/upload`, {
        method: "POST",
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Image upload failed");
      }

      return data.data.url;
    } catch (error: any) {
      console.error("Upload error:", error);
      Alert.alert("Upload Failed", error.message);
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0].uri) {
        const uploadedUrl = await uploadImage(result.assets[0].uri);
        if (uploadedUrl) {
          setFormData({ ...formData, coverImage: uploadedUrl });
        }
      }
    } catch (error) {
      Alert.alert("Error", "Failed to pick image");
    }
  };

  const pickGalleryImages = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        selectionLimit: 5,
        quality: 0.8,
      });

      if (!result.canceled) {
        setIsUploading(true); // Set global uploading state

        const uploadPromises = result.assets.map((asset) =>
          uploadImage(asset.uri)
        );
        const uploadedUrls = await Promise.all(uploadPromises);

        // Filter out nulls (failed uploads)
        const validUrls = uploadedUrls.filter(
          (url) => url !== null
        ) as string[];

        if (validUrls.length > 0) {
          setFormData((prev) => ({
            ...prev,
            images: [...prev.images, ...validUrls],
          }));
        }
        setIsUploading(false);
      }
    } catch (error) {
      Alert.alert("Error", "Failed to pick gallery images");
      setIsUploading(false);
    }
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    // On Android, the picker is closed after selection
    const isAndroid = Platform.OS === "android";

    if (event.type === "dismissed") {
      setPickerState({ ...pickerState, show: false });
      return;
    }

    if (selectedDate) {
      const currentDate =
        pickerState.target === "start" ? formData.startDate : formData.endDate;

      let newDate = new Date(currentDate);
      if (pickerState.mode === "date") {
        newDate.setFullYear(
          selectedDate.getFullYear(),
          selectedDate.getMonth(),
          selectedDate.getDate()
        );
      } else {
        newDate.setHours(selectedDate.getHours(), selectedDate.getMinutes());
      }

      setFormData({
        ...formData,
        [pickerState.target === "start" ? "startDate" : "endDate"]: newDate,
      });

      // On Android, if we just finished 'date', we might want to immediately show 'time'
      if (isAndroid && pickerState.mode === "date") {
        setPickerState({ ...pickerState, mode: "time", show: true });
      } else {
        setPickerState({ ...pickerState, show: false });
      }
    } else {
      setPickerState({ ...pickerState, show: false });
    }
  };

  const showPicker = (target: "start" | "end", mode: "date" | "time") => {
    setPickerState({ show: true, target, mode });
  };

  const handleSubmit = async () => {
    if (
      !formData.title ||
      !formData.description ||
      !formData.categoryId ||
      (!formData.isVirtual && !formData.city)
    ) {
      Alert.alert("Error", "Please fill in all required fields");
      return;
    }

    try {
      await createEventMutation.mutateAsync({
        ...formData,
        price: formData.isFree ? 0 : parseFloat(formData.price) || 0,
        capacity: formData.capacity ? parseInt(formData.capacity) : null,
        startDate: formData.startDate.toISOString(),
        endDate: formData.endDate.toISOString(),
      });

      Alert.alert("Success", "Event request submitted successfully!", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to submit event request");
    }
  };

  if (categoriesLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.light.tint} />
      </View>
    );
  }

  const getFullImageUrl = (path: string) => {
    if (!path) return null;
    if (path.startsWith("http")) return path;
    const apiUrl =
      Constants.expoConfig?.extra?.apiUrl || process.env.EXPO_PUBLIC_API_URL;
    return `${apiUrl}${path}`;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="chevron-back" size={24} color={Colors.light.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Request Event</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Basic Information</Text>

          <TouchableOpacity
            style={styles.imagePicker}
            onPress={pickImage}
            disabled={isUploading}
          >
            {formData.coverImage ? (
              <Image
                source={{ uri: getFullImageUrl(formData.coverImage) as string }}
                style={styles.coverImage}
              />
            ) : (
              <View style={styles.imagePlaceholder}>
                {isUploading ? (
                  <ActivityIndicator color={Colors.light.tint} />
                ) : (
                  <>
                    <Ionicons name="image-outline" size={40} color="#9CA3AF" />
                    <Text style={styles.imagePlaceholderText}>
                      Add Cover Image
                    </Text>
                  </>
                )}
              </View>
            )}
            {isUploading && (
              <View style={[styles.coverImage, styles.uploadingOverlay]}>
                <ActivityIndicator color="#fff" />
              </View>
            )}
          </TouchableOpacity>

          <Text style={styles.label}>Event Title *</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter event title"
            value={formData.title}
            onChangeText={(text) => setFormData({ ...formData, title: text })}
          />

          <Text style={styles.label}>Category *</Text>
          <View style={styles.categoryContainer}>
            {categories?.map((cat: any) => (
              <TouchableOpacity
                key={cat.id}
                style={[
                  styles.categoryChip,
                  formData.categoryId === cat.id && styles.categoryChipActive,
                ]}
                onPress={() => setFormData({ ...formData, categoryId: cat.id })}
              >
                <Text style={styles.categoryIcon}>{cat.icon}</Text>
                <Text
                  style={[
                    styles.categoryName,
                    formData.categoryId === cat.id && styles.categoryNameActive,
                  ]}
                >
                  {cat.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>Description *</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Describe your event"
            multiline
            numberOfLines={4}
            value={formData.description}
            onChangeText={(text) =>
              setFormData({ ...formData, description: text })
            }
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Gallery Images</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.galleryContainer}
          >
            <TouchableOpacity
              style={styles.addGalleryButton}
              onPress={pickGalleryImages}
            >
              <Ionicons name="add" size={32} color="#9CA3AF" />
            </TouchableOpacity>
            {formData.images.map((uri, index) => (
              <View key={index} style={styles.galleryImageContainer}>
                <Image
                  source={{ uri: getFullImageUrl(uri) as string }}
                  style={styles.galleryImage}
                />
                <TouchableOpacity
                  style={styles.removeGalleryImage}
                  onPress={() => {
                    const newImages = [...formData.images];
                    newImages.splice(index, 1);
                    setFormData({ ...formData, images: newImages });
                  }}
                >
                  <Ionicons
                    name="close-circle"
                    size={20}
                    color={Colors.light.tint}
                  />
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Date & Time</Text>

          <View style={styles.dateTimeRow}>
            <View style={{ flex: 1, marginRight: 10 }}>
              <Text style={styles.label}>Start Date *</Text>
              <TouchableOpacity
                style={styles.datePickerButton}
                onPress={() => showPicker("start", "date")}
              >
                <Text style={styles.dateText}>
                  {formData.startDate.toLocaleDateString()}
                </Text>
              </TouchableOpacity>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>Start Time *</Text>
              <TouchableOpacity
                style={styles.datePickerButton}
                onPress={() => showPicker("start", "time")}
              >
                <Text style={styles.dateText}>
                  {formData.startDate.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: true,
                  })}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.dateTimeRow}>
            <View style={{ flex: 1, marginRight: 10 }}>
              <Text style={styles.label}>End Date *</Text>
              <TouchableOpacity
                style={styles.datePickerButton}
                onPress={() => showPicker("end", "date")}
              >
                <Text style={styles.dateText}>
                  {formData.endDate.toLocaleDateString()}
                </Text>
              </TouchableOpacity>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>End Time *</Text>
              <TouchableOpacity
                style={styles.datePickerButton}
                onPress={() => showPicker("end", "time")}
              >
                <Text style={styles.dateText}>
                  {formData.endDate.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: true,
                  })}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {pickerState.show && (
            <DateTimePicker
              value={
                pickerState.target === "start"
                  ? formData.startDate
                  : formData.endDate
              }
              mode={pickerState.mode}
              is24Hour={false}
              display={Platform.OS === "ios" ? "spinner" : "default"}
              onChange={handleDateChange}
            />
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Location</Text>

          <View style={styles.switchRow}>
            <Text style={styles.label}>Virtual Event</Text>
            <Switch
              value={formData.isVirtual}
              onValueChange={(val) =>
                setFormData({ ...formData, isVirtual: val })
              }
            />
          </View>

          {!formData.isVirtual && (
            <>
              <Text style={styles.label}>Venue Name</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter venue name"
                value={formData.venueName}
                onChangeText={(text) =>
                  setFormData({ ...formData, venueName: text })
                }
              />
              <Text style={styles.label}>City *</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter city"
                value={formData.city}
                onChangeText={(text) =>
                  setFormData({ ...formData, city: text })
                }
              />
            </>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Pricing & Capacity</Text>

          <View style={styles.switchRow}>
            <Text style={styles.label}>Free Event</Text>
            <Switch
              value={formData.isFree}
              onValueChange={(val) => setFormData({ ...formData, isFree: val })}
            />
          </View>

          {!formData.isFree && (
            <View style={styles.row}>
              <View style={{ flex: 1, marginRight: 10 }}>
                <Text style={styles.label}>Price</Text>
                <TextInput
                  style={styles.input}
                  placeholder="0.00"
                  keyboardType="numeric"
                  value={formData.price}
                  onChangeText={(text) =>
                    setFormData({ ...formData, price: text })
                  }
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>Currency</Text>
                <TextInput
                  style={styles.input}
                  value={formData.currency}
                  editable={false}
                />
              </View>
            </View>
          )}

          <Text style={styles.label}>Capacity (optional)</Text>
          <TextInput
            style={styles.input}
            placeholder="Unlimited"
            keyboardType="numeric"
            value={formData.capacity}
            onChangeText={(text) =>
              setFormData({ ...formData, capacity: text })
            }
          />
        </View>

        <TouchableOpacity
          style={[
            styles.submitButton,
            (createEventMutation.isPending || isUploading) &&
              styles.submitButtonDisabled,
          ]}
          onPress={handleSubmit}
          disabled={createEventMutation.isPending || isUploading}
        >
          {createEventMutation.isPending ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitButtonText}>Submit Request</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
    paddingTop: 60,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    elevation: 2,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  section: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#4B5563",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    color: "#111827",
    marginBottom: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  categoryContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 16,
  },
  categoryChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    gap: 4,
  },
  categoryChipActive: {
    backgroundColor: Colors.light.tint,
    borderColor: Colors.light.tint,
  },
  categoryIcon: {
    fontSize: 14,
  },
  categoryName: {
    fontSize: 12,
    fontWeight: "600",
    color: "#4B5563",
  },
  categoryNameActive: {
    color: "#fff",
  },
  datePickerButton: {
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
    minHeight: 48,
    justifyContent: "center",
  },
  dateTimeRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  dateText: {
    fontSize: 14,
    color: "#111827",
  },
  switchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  row: {
    flexDirection: "row",
  },
  submitButton: {
    backgroundColor: Colors.light.tint,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  imagePicker: {
    width: "100%",
    height: 150,
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderStyle: "dashed",
    justifyContent: "center",
    alignItems: "center",
  },
  coverImage: {
    width: "100%",
    height: "100%",
  },
  imagePlaceholder: {
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  imagePlaceholderText: {
    fontSize: 14,
    color: "#9CA3AF",
    fontWeight: "500",
  },
  uploadingOverlay: {
    position: "absolute",
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  galleryContainer: {
    flexDirection: "row",
    marginBottom: 16,
  },
  addGalleryButton: {
    width: 80,
    height: 80,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderStyle: "dashed",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  galleryImageContainer: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 12,
    position: "relative",
  },
  galleryImage: {
    width: "100%",
    height: "100%",
    borderRadius: 8,
  },
  removeGalleryImage: {
    position: "absolute",
    top: -6,
    right: -6,
    backgroundColor: "#fff",
    borderRadius: 10,
  },
});
