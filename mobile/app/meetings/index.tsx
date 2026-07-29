import { useEffect, useState } from 'react';
import { Text, View, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { getMeetings, type Meeting } from '@/services/api';

export default function MeetingsListScreen() {
  const router = useRouter();
  const { token } = useAuth();
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      router.replace('/login');
      return;
    }
    getMeetings(token)
      .then(setMeetings)
      .catch(() => setMeetings([]))
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  const formatDate = (d: string) => new Date(d).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' });

  return (
    <View style={styles.container}>
      <FlatList
        data={meetings}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => router.push(`/meetings/${item.id}`)}
            activeOpacity={0.7}
          >
            <Text style={styles.cardTitle}>{item.title}</Text>
            <Text style={styles.cardMeta}>
              {formatDate(item.date)} · {item.time} · {item.status}
            </Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <Text style={styles.empty}>Aucune réunion</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  list: { padding: 16, paddingBottom: 32 },
  card: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  cardTitle: { fontSize: 16, fontWeight: '600', color: '#111' },
  cardMeta: { fontSize: 14, color: '#6b7280', marginTop: 4 },
  empty: { textAlign: 'center', color: '#6b7280', marginTop: 24 },
});
