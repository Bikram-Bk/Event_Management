import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function CreateTab() {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Create Event</Text>
        <Text style={styles.subtitle}>Share your event with the world</Text>

        <View style={styles.optionsContainer}>
          <TouchableOpacity style={styles.optionCard}>
            <Ionicons name="camera" size={40} color="#007AFF" />
            <Text style={styles.optionTitle}>Add Photo</Text>
            <Text style={styles.optionDescription}>Select from gallery</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.optionCard}>
            <Ionicons name="location" size={40} color="#007AFF" />
            <Text style={styles.optionTitle}>Add Location</Text>
            <Text style={styles.optionDescription}>Where is the event?</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.optionCard}>
            <Ionicons name="calendar" size={40} color="#007AFF" />
            <Text style={styles.optionTitle}>Set Date & Time</Text>
            <Text style={styles.optionDescription}>When does it start?</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.optionCard}>
            <Ionicons name="people" size={40} color="#007AFF" />
            <Text style={styles.optionTitle}>Invite People</Text>
            <Text style={styles.optionDescription}>Share with friends</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.createButton}>
          <Text style={styles.createButtonText}>Create Event</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#000',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 24,
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 32,
  },
  optionCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    width: '47%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 12,
    marginBottom: 4,
    color: '#000',
  },
  optionDescription: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  createButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  createButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});
