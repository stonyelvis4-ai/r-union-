import { useEffect, useState } from 'react';
import { Text, View, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { getMeeting, getSummary, type Meeting, type Summary } from '@/services/api';

export default function MeetingDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { token } = useAuth();
  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token || !id) {
      setLoading(false);
      return;
    }
    Promise.all([getMeeting(id, token), getSummary(id, token)])
      .then(([m, s]) => {
        setMeeting(m);
        setSummary(s ?? null);
      })
      .catch(() => setMeeting(null))
      .finally(() => setLoading(false));
  }, [token, id]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!meeting) {
    return (
      <View style={styles.centered}>
        <Text>Réunion introuvable</Text>
      </View>
    );
  }

  const formatDate = (d: string) => new Date(d).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>{meeting.title}</Text>
        <Text style={styles.meta}>
          {formatDate(meeting.date)} · {meeting.time}
          {meeting.location ? ` · ${meeting.location}` : ''}
        </Text>
      </View>

      {meeting.agenda ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ordre du jour</Text>
          <Text style={styles.body}>{meeting.agenda}</Text>
        </View>
      ) : null}

      {meeting.participants && meeting.participants.length > 0 ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Participants</Text>
          <Text style={styles.body}>
            {meeting.participants.map((p) => p.displayName || p.email).join(', ')}
          </Text>
        </View>
      ) : null}

      {summary ? (
        <>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Résumé</Text>
            <Text style={styles.body}>{summary.discussionSummary}</Text>
          </View>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Décisions clés</Text>
            <Text style={styles.body}>{summary.keyDecisions}</Text>
          </View>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Actions</Text>
            <Text style={styles.body}>{summary.actionItems}</Text>
          </View>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Responsables</Text>
            <Text style={styles.body}>{summary.responsiblePersons}</Text>
          </View>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Prochaines étapes</Text>
            <Text style={styles.body}>{summary.nextSteps}</Text>
          </View>
        </>
      ) : (
        <View style={styles.section}>
          <Text style={styles.muted}>Aucun rapport généré pour cette réunion.</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, paddingBottom: 32 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { marginBottom: 20 },
  title: { fontSize: 22, fontWeight: 'bold', color: '#111' },
  meta: { fontSize: 14, color: '#6b7280', marginTop: 4 },
  section: { marginBottom: 20 },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: '#374151', marginBottom: 6 },
  body: { fontSize: 15, color: '#374151', lineHeight: 22 },
  muted: { fontSize: 14, color: '#9ca3af' },
});
