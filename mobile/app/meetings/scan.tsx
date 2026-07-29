import { useState, useEffect, useCallback } from 'react';
import { Text, View, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useAuth } from '@/context/AuthContext';
import { scanAttendance } from '@/services/api';
import { addPendingScan, getPendingScans } from '@/services/offlineAttendanceQueue';

function parseQrData(data: string): { qrToken?: string; meetingId?: string } {
  const trimmed = data.trim();
  if (!trimmed) return {};
  try {
    if (trimmed.startsWith('http')) {
      const url = new URL(trimmed);
      const token = url.searchParams.get('token');
      if (token) return { qrToken: token };
      const pathParts = url.pathname.split('/');
      const idIndex = pathParts.indexOf('meetings') + 1;
      if (pathParts[idIndex]) return { meetingId: pathParts[idIndex] };
    }
    if (trimmed.length >= 20 && /^[a-z0-9]+$/i.test(trimmed)) return { qrToken: trimmed };
    return { qrToken: trimmed };
  } catch {
    return { qrToken: trimmed };
  }
}

export default function ScanQRScreen() {
  const router = useRouter();
  const { token } = useAuth();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [pendingCount, setPendingCount] = useState(0);

  const refreshPending = useCallback(() => {
    getPendingScans().then((p) => setPendingCount(p.length));
  }, []);

  useEffect(() => {
    refreshPending();
  }, [refreshPending]);

  const handleBarCodeScanned = async ({ data }: { type: string; data: string }) => {
    if (scanned) return;
    setScanned(true);
    const params = parseQrData(data);
    if (!params.qrToken && !params.meetingId) {
      setMessage('QR code non reconnu');
      setTimeout(() => setScanned(false), 2000);
      return;
    }
    try {
      await scanAttendance(params, token);
      setMessage('Présence enregistrée');
      setTimeout(() => setScanned(false), 1500);
    } catch {
      try {
        await addPendingScan(params);
        setMessage('Hors ligne : enregistré, sera synchronisé plus tard');
        refreshPending();
      } catch {
        setMessage('Erreur');
      }
      setTimeout(() => setScanned(false), 2500);
    }
  };

  if (!permission) {
    return (
      <View style={styles.centered}>
        <Text>Chargement des permissions…</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.centered}>
        <Text style={styles.permissionText}>Accès caméra nécessaire pour scanner le QR</Text>
        <TouchableOpacity style={styles.button} onPress={requestPermission}>
          <Text style={styles.buttonText}>Autoriser</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        style={StyleSheet.absoluteFillObject}
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
      />
      <View style={styles.overlay}>
        {message ? <Text style={styles.message}>{message}</Text> : null}
        {pendingCount > 0 ? (
          <Text style={styles.pending}>{pendingCount} présence(s) en attente de synchronisation</Text>
        ) : null}
        {scanned && (
          <TouchableOpacity style={styles.rescanButton} onPress={() => setScanned(false)}>
            <Text style={styles.buttonText}>Scanner à nouveau</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  permissionText: { textAlign: 'center', marginBottom: 16 },
  overlay: {
    position: 'absolute',
    bottom: 40,
    left: 24,
    right: 24,
    alignItems: 'center',
  },
  message: {
    backgroundColor: 'rgba(0,0,0,0.7)',
    color: '#fff',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  pending: { color: '#fff', fontSize: 12, marginBottom: 8 },
  button: { backgroundColor: '#2563eb', paddingVertical: 12, paddingHorizontal: 24, borderRadius: 8 },
  rescanButton: { backgroundColor: '#2563eb', paddingVertical: 12, paddingHorizontal: 24, borderRadius: 8 },
  buttonText: { color: '#fff', fontWeight: '600' },
});
