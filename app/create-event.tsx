import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import DateTimePicker from "@react-native-community/datetimepicker";
import Constants from "expo-constants";
import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { Colors } from "../constants/Colors";
import { useTheme } from "../context/ThemeContext";
import { useToast } from "../context/ToastContext";
import { useCategories } from "../hooks/use-categories";
import { useEvent, useRequestEvent, useUpdateEvent } from "../hooks/use-events";

export default function CreateEventScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const isEditing = !!id;
  const router = useRouter();
  const { actualTheme } = useTheme();
  const colors = Colors[actualTheme];
  const { data: categories, isLoading: categoriesLoading } = useCategories();
  const { data: existingEvent, isLoading: eventLoading } = useEvent(id as string);
  const createEventMutation = useRequestEvent();
  const updateEventMutation = useUpdateEvent();
  const { showToast } = useToast();
  const [isUploading, setIsUploading] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    categoryId: "",
    startDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000), // Default to 4 days in future
    endDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000 + 3600000), // 4 days + 1 hour later
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
    brideName: "",
    groomName: "",
    babyName: "",
    babyGender: "",
    babyDob: new Date(),
    muhurtaTime: "",
    boyName: "",
  });

  useEffect(() => {
    if (existingEvent) {
      setFormData({
        title: existingEvent.title || "",
        description: existingEvent.description || "",
        categoryId: existingEvent.categoryId || "",
        startDate: new Date(existingEvent.startDate),
        endDate: new Date(existingEvent.endDate),
        venueName: existingEvent.venueName || "",
        address: existingEvent.address || "",
        city: existingEvent.city || "",
        state: existingEvent.state || "",
        isVirtual: existingEvent.isVirtual || false,
        isFree: existingEvent.isFree ?? true,
        price: existingEvent.price?.toString() || "0",
        currency: existingEvent.currency || "NPR",
        capacity: existingEvent.capacity?.toString() || "",
        coverImage: existingEvent.coverImage || "",
        images: existingEvent.images || [],
        brideName: existingEvent.brideName || "",
        groomName: existingEvent.groomName || "",
        babyName: existingEvent.babyName || "",
        babyGender: existingEvent.babyGender || "",
        babyDob: existingEvent.babyDob ? new Date(existingEvent.babyDob) : new Date(),
        muhurtaTime: existingEvent.muhurtaTime || "",
        boyName: existingEvent.boyName || "",
      });
    }
  }, [existingEvent]);

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
      showToast({ message: error.message || "Upload Failed", type: "error" });
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
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
      showToast({ message: "Failed to pick image", type: "error" });
    }
  };

  const pickGalleryImages = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
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
      showToast({ message: "Failed to pick gallery images", type: "error" });
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
      // Enforce 3-day lead time minimum for preparation (from start of day)
      const minLeadTime = new Date();
      minLeadTime.setHours(0, 0, 0, 0);
      minLeadTime.setDate(minLeadTime.getDate() + 3);
      
      const targetField = pickerState.target === "start" ? "startDate" : "endDate";
      const currentTargetDate = formData[targetField];
      let newDate = new Date(currentTargetDate);

      if (pickerState.mode === "date") {
        newDate.setFullYear(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());
      } else {
        newDate.setHours(selectedDate.getHours(), selectedDate.getMinutes(), 0, 0);
      }

      // If updating startDate, ensure lead time and auto-update endDate
      if (pickerState.target === "start") {
        if (newDate < minLeadTime) {
          showToast({ message: "Events must be scheduled at least 3 days in advance for preparation.", type: "warning" });
          setPickerState({ ...pickerState, show: false });
          return;
        }

        // Calculate duration to keep it synced
        const duration = formData.endDate.getTime() - formData.startDate.getTime();
        const newEndDate = new Date(newDate.getTime() + (duration > 0 ? duration : 3600000));
        
        setFormData({
          ...formData,
          startDate: newDate,
          endDate: newEndDate,
        });
      } else {
        // Ensuring end date is not before start date
        if (newDate <= formData.startDate) {
          showToast({ message: "End time must be after start time.", type: "error" });
          setPickerState({ ...pickerState, show: false });
          return;
        }
        setFormData({ ...formData, endDate: newDate });
      }

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
      showToast({ message: "Please fill in all required fields", type: "error" });
      return;
    }

    try {
      if (isEditing) {
        await updateEventMutation.mutateAsync({
          id: id as string,
          data: {
            ...formData,
            price: formData.isFree ? 0 : parseFloat(formData.price) || 0,
            capacity: formData.capacity ? parseInt(formData.capacity) : null,
            startDate: formData.startDate.toISOString(),
            endDate: formData.endDate.toISOString(),
          },
        });
        showToast({ message: "Event updated successfully!", type: "success" });
        setTimeout(() => router.back(), 1500);
      } else {
        await createEventMutation.mutateAsync({
          ...formData,
          price: formData.isFree ? 0 : parseFloat(formData.price) || 0,
          capacity: formData.capacity ? parseInt(formData.capacity) : null,
          startDate: formData.startDate.toISOString(),
          endDate: formData.endDate.toISOString(),
        });
        showToast({ message: "Event request submitted successfully!", type: "success" });
        setTimeout(() => router.back(), 1500);
      }
    } catch (error: any) {
      showToast({ message: error.message || `Failed to ${isEditing ? 'update' : 'submit'} event request`, type: "error" });
    }
  };

  if (categoriesLoading || (isEditing && eventLoading)) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.tint} />
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
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.background }]}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={[styles.backButton, { backgroundColor: colors.card }]}
        >
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>{isEditing ? 'Edit Event' : 'Request Event'}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Basic Information</Text>

          <TouchableOpacity
            style={[styles.imagePicker, { backgroundColor: actualTheme === 'dark' ? colors.background : '#F3F4F6', borderColor: colors.border }]}
            onPress={pickImage}
            disabled={isUploading}
          >
            {formData.coverImage ? (
              <Image
                source={{ uri: getFullImageUrl(formData.coverImage) as string }}
                style={styles.coverImage}
              />
            ) : (
              <View style={[styles.imagePlaceholder, { backgroundColor: actualTheme === 'dark' ? colors.background : '#F3F4F6' }]}>
                {isUploading ? (
                  <ActivityIndicator color={colors.tint} />
                ) : (
                  <>
                    <Ionicons name="image-outline" size={40} color={colors.secondary} />
                    <Text style={[styles.imagePlaceholderText, { color: colors.secondary }]}>
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

          <Text style={[styles.label, { color: colors.secondary }]}>Event Title *</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
            placeholder="Enter event title"
            placeholderTextColor={colors.secondary}
            value={formData.title}
            onChangeText={(text) => setFormData({ ...formData, title: text })}
          />

          <Text style={[styles.label, { color: colors.secondary }]}>Category *</Text>
          <View style={styles.categoryContainer}>
            {categories?.map((cat: any) => (
              <TouchableOpacity
                key={cat.id}
                style={[
                  styles.categoryChip,
                  { backgroundColor: actualTheme === 'dark' ? colors.background : '#F3F4F6', borderColor: colors.border },
                  formData.categoryId === cat.id && { backgroundColor: colors.tint, borderColor: colors.tint },
                ]}
                onPress={() => setFormData({ ...formData, categoryId: cat.id })}
              >
                {cat.icon && (cat.icon.startsWith('http') || cat.icon.startsWith('/')) ? (
                  <Image 
                    source={{ uri: getFullImageUrl(cat.icon) as string }} 
                    style={[styles.categoryIconImage, { tintColor: formData.categoryId === cat.id ? '#fff' : undefined }]}
                  />
                ) : (
                  <Text style={[styles.categoryIcon, { color: formData.categoryId === cat.id ? '#fff' : colors.text }]}>{cat.icon || "✨"}</Text>
                )}
                <Text
                  style={[
                    styles.categoryName,
                    { color: colors.secondary },
                    formData.categoryId === cat.id && styles.categoryNameActive,
                  ]}
                >
                  {cat.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={[styles.label, { color: colors.secondary }]}>Services *</Text>
          <TextInput
            style={[styles.input, styles.textArea, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
            placeholder="Add Services"
            placeholderTextColor={colors.secondary}
            multiline
            numberOfLines={4}
            value={formData.description}
            onChangeText={(text) =>
              setFormData({ ...formData, description: text })
            }
          />

          {categories?.find((c: any) => c.id === formData.categoryId)?.name === "Wedding" && (
            <>
              <Text style={[styles.label, { color: colors.secondary }]}>Bride's Name *</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                placeholder="Enter bride's name"
                placeholderTextColor={colors.secondary}
                value={formData.brideName}
                onChangeText={(text) => setFormData({ ...formData, brideName: text })}
              />

              <Text style={[styles.label, { color: colors.secondary }]}>Groom's Name *</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                placeholder="Enter groom's name"
                placeholderTextColor={colors.secondary}
                value={formData.groomName}
                onChangeText={(text) => setFormData({ ...formData, groomName: text })}
              />
            </>
          )}

          {categories?.find((c: any) => c.id === formData.categoryId)?.name === "Pasni" && (
            <>
              <Text style={[styles.label, { color: colors.secondary }]}>Baby's Name *</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                placeholder="Enter baby's name"
                placeholderTextColor={colors.secondary}
                value={formData.babyName}
                onChangeText={(text) => setFormData({ ...formData, babyName: text })}
              />

              <Text style={[styles.label, { color: colors.secondary }]}>Gender *</Text>
              <View style={styles.categoryContainer}>
                {['Boy', 'Girl'].map((gender) => (
                  <TouchableOpacity
                    key={gender}
                    style={[
                      styles.categoryChip,
                      { backgroundColor: actualTheme === 'dark' ? colors.background : '#F3F4F6', borderColor: colors.border },
                      formData.babyGender === gender && { backgroundColor: colors.tint, borderColor: colors.tint },
                    ]}
                    onPress={() => setFormData({ ...formData, babyGender: gender })}
                  >
                    <Text style={[styles.categoryName, { color: colors.secondary }, formData.babyGender === gender && styles.categoryNameActive]}>
                      {gender}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={[styles.label, { color: colors.secondary }]}>Auspicious Time (Muhurta)</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                placeholder="e.g. 10:30 AM"
                placeholderTextColor={colors.secondary}
                value={formData.muhurtaTime}
                onChangeText={(text) => setFormData({ ...formData, muhurtaTime: text })}
              />
            </>
          )}

          {categories?.find((c: any) => c.id === formData.categoryId)?.name === "Nwaran" && (
            <>
              <Text style={[styles.label, { color: colors.secondary }]}>Baby's Name *</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                placeholder="Enter baby's name"
                placeholderTextColor={colors.secondary}
                value={formData.babyName}
                onChangeText={(text) => setFormData({ ...formData, babyName: text })}
              />

              <Text style={[styles.label, { color: colors.secondary }]}>Gender *</Text>
              <View style={styles.categoryContainer}>
                {['Boy', 'Girl'].map((gender) => (
                  <TouchableOpacity
                    key={gender}
                    style={[
                      styles.categoryChip,
                      { backgroundColor: actualTheme === 'dark' ? colors.background : '#F3F4F6', borderColor: colors.border },
                      formData.babyGender === gender && { backgroundColor: colors.tint, borderColor: colors.tint },
                    ]}
                    onPress={() => setFormData({ ...formData, babyGender: gender })}
                  >
                    <Text style={[styles.categoryName, { color: colors.secondary }, formData.babyGender === gender && styles.categoryNameActive]}>
                      {gender}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={[styles.label, { color: colors.secondary }]}>Auspicious Time (Muhurta)</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                placeholder="e.g. 10:30 AM"
                placeholderTextColor={colors.secondary}
                value={formData.muhurtaTime}
                onChangeText={(text) => setFormData({ ...formData, muhurtaTime: text })}
              />
            </>
          )}

          {categories?.find((c: any) => c.id === formData.categoryId)?.name === "Bartaband" && (
            <>
              <Text style={[styles.label, { color: colors.secondary }]}>Boy's Name *</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                placeholder="Enter boy's name"
                placeholderTextColor={colors.secondary}
                value={formData.boyName}
                onChangeText={(text) => setFormData({ ...formData, boyName: text })}
              />

              <Text style={[styles.label, { color: colors.secondary }]}>Auspicious Time (Muhurta)</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                placeholder="e.g. 09:00 AM"
                placeholderTextColor={colors.secondary}
                value={formData.muhurtaTime}
                onChangeText={(text) => setFormData({ ...formData, muhurtaTime: text })}
              />
            </>
          )}
        </View>

        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Gallery Images</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.galleryContainer}
          >
            <TouchableOpacity
              style={[styles.addGalleryButton, { borderColor: colors.border, backgroundColor: colors.background }]}
              onPress={pickGalleryImages}
            >
              <Ionicons name="add" size={32} color={colors.secondary} />
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
                    color={colors.tint}
                  />
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        </View>

        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Date & Time</Text>

          <View style={styles.dateTimeRow}>
            <View style={{ flex: 1, marginRight: 10 }}>
              <Text style={[styles.label, { color: colors.secondary }]}>Start Date *</Text>
              <TouchableOpacity
                style={[styles.datePickerButton, { backgroundColor: colors.background, borderColor: colors.border }]}
                onPress={() => showPicker("start", "date")}
              >
                <Text style={[styles.dateText, { color: colors.text }]}>
                  {formData.startDate.toLocaleDateString()}
                </Text>
              </TouchableOpacity>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.label, { color: colors.secondary }]}>Start Time *</Text>
              <TouchableOpacity
                style={[styles.datePickerButton, { backgroundColor: colors.background, borderColor: colors.border }]}
                onPress={() => showPicker("start", "time")}
              >
                <Text style={[styles.dateText, { color: colors.text }]}>
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
              <Text style={[styles.label, { color: colors.secondary }]}>End Date *</Text>
              <TouchableOpacity
                style={[styles.datePickerButton, { backgroundColor: colors.background, borderColor: colors.border }]}
                onPress={() => showPicker("end", "date")}
              >
                <Text style={[styles.dateText, { color: colors.text }]}>
                  {formData.endDate.toLocaleDateString()}
                </Text>
              </TouchableOpacity>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.label, { color: colors.secondary }]}>End Time *</Text>
              <TouchableOpacity
                style={[styles.datePickerButton, { backgroundColor: colors.background, borderColor: colors.border }]}
                onPress={() => showPicker("end", "time")}
              >
                <Text style={[styles.dateText, { color: colors.text }]}>
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
              value={pickerState.target === "start" ? formData.startDate : formData.endDate}
              mode={pickerState.mode}
              is24Hour={false}
              minimumDate={pickerState.target === "start" ? new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) : formData.startDate}
              display={Platform.OS === "ios" ? "spinner" : "default"}
              onChange={handleDateChange}
            />
          )}
        </View>

        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Location</Text>

          <View style={styles.switchRow}>
            <Text style={[styles.label, { color: colors.secondary }]}>Virtual Event</Text>
            <Switch
              value={formData.isVirtual}
              onValueChange={(val) =>
                setFormData({ ...formData, isVirtual: val })
              }
              trackColor={{ false: colors.border, true: colors.tint }}
              thumbColor={Platform.OS === 'ios' ? undefined : colors.card}
            />
          </View>

          {!formData.isVirtual && (
            <>
              <Text style={[styles.label, { color: colors.secondary }]}>Venue Name</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                placeholder="Enter venue name"
                placeholderTextColor={colors.secondary}
                value={formData.venueName}
                onChangeText={(text) =>
                  setFormData({ ...formData, venueName: text })
                }
              />
              <Text style={[styles.label, { color: colors.secondary }]}>City *</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                placeholder="Enter city"
                placeholderTextColor={colors.secondary}
                value={formData.city}
                onChangeText={(text) =>
                  setFormData({ ...formData, city: text })
                }
              />
            </>
          )}
        </View>

        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Pricing & Capacity</Text>

          <View style={styles.switchRow}>
            <Text style={[styles.label, { color: colors.secondary }]}>Free Event</Text>
            <Switch
              value={formData.isFree}
              onValueChange={(val) => setFormData({ ...formData, isFree: val })}
              trackColor={{ false: colors.border, true: colors.tint }}
              thumbColor={Platform.OS === 'ios' ? undefined : colors.card}
            />
          </View>

          {!formData.isFree && (
            <View style={styles.row}>
              <View style={{ flex: 1, marginRight: 10 }}>
                <Text style={[styles.label, { color: colors.secondary }]}>Price</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                  placeholder="0.00"
                  placeholderTextColor={colors.secondary}
                  keyboardType="numeric"
                  value={formData.price}
                  onChangeText={(text) =>
                    setFormData({ ...formData, price: text })
                  }
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.label, { color: colors.secondary }]}>Currency</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: actualTheme === 'dark' ? colors.border : '#F3F4F6', color: colors.text, borderColor: colors.border }]}
                  value={formData.currency}
                  editable={false}
                />
              </View>
            </View>
          )}

          <Text style={[styles.label, { color: colors.secondary }]}>Capacity (optional)</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
            placeholder="Unlimited"
            placeholderTextColor={colors.secondary}
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
            { backgroundColor: colors.tint },
            (createEventMutation.isPending || isUploading) &&
              styles.submitButtonDisabled,
          ]}
          onPress={handleSubmit}
          disabled={createEventMutation.isPending || isUploading}
        >
          {createEventMutation.isPending || updateEventMutation.isPending ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitButtonText}>{isEditing ? 'Update Event' : 'Submit Request'}</Text>
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
  categoryIconImage: {
    width: 16,
    height: 16,
    borderRadius: 4,
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
