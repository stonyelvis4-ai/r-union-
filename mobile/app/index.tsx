import { useEffect } from 'react';
import { Text, View, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { syncPendingScans } from '@/services/offlineAttendanceQueue';

export default function Index() {
  const router = useRouter();
  const { token, isLoading } = useAuth();

  useEffect(() => {
    if (token) {
      syncPendingScans().then(({ synced }) => {
        if (synced > 0) {
          // Optionnel: afficher un toast "X présences enregistrées"
        }
      });
    }
  }, [token]);

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <Text>Chargement…</Text>
      </View>
    );
  }

  return (
    <View style={styles.centered}>
      <Text style={styles.title}>SmartReunion</Text>
      <Text style={styles.subtitle}>Gestion de réunions</Text>
      <View style={styles.buttons}>
        {!token ? (
          <TouchableOpacity style={styles.primaryButton} onPress={() => router.push('/login')}>
            <Text style={styles.primaryButtonText}>Connexion</Text>
          </TouchableOpacity>
        ) : (
          <>
            <TouchableOpacity style={styles.primaryButton} onPress={() => router.push('/meetings')}>
              <Text style={styles.primaryButtonText}>Réunions</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.secondaryButton} onPress={() => router.push('/meetings/scan')}>
              <Text style={styles.secondaryButtonText}>Scanner QR (présence)</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  subtitle: {
    marginTop: 8,
    color: '#666',
  },
  buttons: {
    marginTop: 32,
    gap: 12,
    width: '100%',
    maxWidth: 280,
  },
  primaryButton: {
    backgroundColor: '#2563eb',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#374151',
    fontSize: 16,
  },
});
