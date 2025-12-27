import { ScrollView, StyleSheet, Text, View } from 'react-native';

export default function EventsTab() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Events</Text>
        <Text style={styles.subtitle}>Discover upcoming events</Text>
        
        <View style={styles.card}>
          <Text style={styles.cardTitle}>🎉 Sample Event 1</Text>
          <Text style={styles.cardDate}>Dec 25, 2025</Text>
          <Text style={styles.cardDescription}>
            This is a sample event. Add your event management logic here.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>🎊 Sample Event 2</Text>
          <Text style={styles.cardDate}>Dec 31, 2025</Text>
          <Text style={styles.cardDescription}>
            Another sample event to showcase the tab structure.
          </Text>
        </View>
      </View>
    </ScrollView>
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
  card: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
    color: '#000',
  },
  cardDate: {
    fontSize: 14,
    color: '#007AFF',
    marginBottom: 8,
    fontWeight: '500',
  },
  cardDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
});
