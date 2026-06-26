import { useEffect, useState } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { router } from "expo-router";

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3300";

export default function Scan() {
  const [permission, requestPermission] = useCameraPermissions();
  const [locked, setLocked] = useState(false);

  useEffect(() => {
    if (permission && !permission.granted && permission.canAskAgain) {
      void requestPermission();
    }
  }, [permission, requestPermission]);

  async function handleCode(data: string) {
    if (locked) return;
    setLocked(true);
    try {
      const response = await fetch(`${API_URL}/receipts/import`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ url: data }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.details || result.error);
      router.replace({ pathname: "/receipt/[id]", params: { id: result.id } });
    } catch (error) {
      Alert.alert(
        "QR Code não reconhecido",
        error instanceof Error ? error.message : "Tente novamente.",
        [{ text: "Tentar novamente", onPress: () => setLocked(false) }],
      );
    }
  }

  if (!permission) return <View style={styles.screen} />;
  if (!permission.granted) {
    return (
      <View style={styles.permission}>
        <Text style={styles.permissionText}>Precisamos da câmera para ler o cupom.</Text>
        <Pressable style={styles.button} onPress={() => void requestPermission()}>
          <Text style={styles.buttonText}>Permitir câmera</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <CameraView
        style={StyleSheet.absoluteFill}
        barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
        onBarcodeScanned={({ data }) => void handleCode(data)}
      />
      <View style={styles.overlay}>
        <Pressable style={styles.close} onPress={() => router.back()}>
          <Text style={styles.closeText}>×</Text>
        </Pressable>
        <Text style={styles.title}>Aponte para o QR Code</Text>
        <Text style={styles.subtitle}>Mantenha o código dentro da moldura.</Text>
        <View style={styles.frame} />
        {locked && <Text style={styles.reading}>Lendo cupom…</Text>}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#07160f" },
  overlay: { flex: 1, alignItems: "center", paddingTop: 70, backgroundColor: "#06150d66" },
  close: { position: "absolute", top: 55, left: 24, width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center", backgroundColor: "#0008" },
  closeText: { color: "white", fontSize: 34, lineHeight: 36 },
  title: { marginTop: 70, color: "white", fontSize: 26, fontWeight: "800" },
  subtitle: { marginTop: 8, color: "#d7e1dc", fontSize: 15 },
  frame: { width: 270, height: 270, marginTop: 75, borderWidth: 4, borderColor: "#e7ad2d", borderRadius: 22 },
  reading: { marginTop: 25, color: "white", fontWeight: "700" },
  permission: { flex: 1, alignItems: "center", justifyContent: "center", gap: 20, padding: 30, backgroundColor: "#153d2c" },
  permissionText: { color: "white", fontSize: 18, textAlign: "center" },
  button: { paddingHorizontal: 22, paddingVertical: 14, borderRadius: 10, backgroundColor: "#e7ad2d" },
  buttonText: { color: "#153d2c", fontWeight: "800" },
});
