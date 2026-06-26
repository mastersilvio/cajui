import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { router } from "expo-router";

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3300";

export default function Home() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(receiptUrl: string) {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/receipts/import`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ url: receiptUrl.trim() }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.details || result.error);
      setUrl("");
      router.push({ pathname: "/receipt/[id]", params: { id: result.id } });
    } catch (error) {
      Alert.alert(
        "Não foi possível adicionar",
        error instanceof Error ? error.message : "Tente novamente.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View>
          <Text style={styles.brand}>cajui</Text>
          <Text style={styles.kicker}>CUPOM FISCAL INTELIGENTE</Text>
          <Text style={styles.title}>Registre uma compra</Text>
          <Text style={styles.subtitle}>
            Leia o QR Code impresso no cupom ou cole o link da NFC-e.
          </Text>
        </View>

        <View style={styles.actions}>
          <Pressable style={styles.scanButton} onPress={() => router.push("/scan")}>
            <Text style={styles.scanIcon}>⌗</Text>
            <Text style={styles.scanText}>Ler QR Code</Text>
          </Pressable>

          <View style={styles.divider}>
            <View style={styles.line} />
            <Text style={styles.or}>OU ADICIONE O LINK</Text>
            <View style={styles.line} />
          </View>

          <TextInput
            style={styles.input}
            value={url}
            onChangeText={setUrl}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="url"
            placeholder="https://...sefaz.../nfce..."
            placeholderTextColor="#84978e"
          />
          <Pressable
            style={[styles.addButton, (!url || loading) && styles.disabled]}
            disabled={!url || loading}
            onPress={() => void submit(url)}
          >
            {loading ? (
              <ActivityIndicator color="#153d2c" />
            ) : (
              <Text style={styles.addText}>Adicionar compra</Text>
            )}
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#153d2c" },
  container: { flex: 1, justifyContent: "space-between", padding: 28, paddingBottom: 42 },
  brand: { color: "#e7ad2d", fontSize: 25, fontWeight: "800", marginBottom: 55 },
  kicker: { color: "#e7ad2d", fontSize: 11, fontWeight: "800", letterSpacing: 1.6 },
  title: { color: "#fffdf5", fontSize: 44, lineHeight: 48, fontWeight: "700", marginTop: 12 },
  subtitle: { color: "#b9cec4", fontSize: 17, lineHeight: 25, marginTop: 12 },
  actions: { gap: 14 },
  scanButton: { height: 64, borderRadius: 14, backgroundColor: "#e7ad2d", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 12 },
  scanIcon: { color: "#153d2c", fontSize: 29, fontWeight: "700" },
  scanText: { color: "#153d2c", fontSize: 17, fontWeight: "800" },
  divider: { flexDirection: "row", alignItems: "center", gap: 10, marginVertical: 7 },
  line: { flex: 1, height: 1, backgroundColor: "#456555" },
  or: { color: "#88a095", fontSize: 10, fontWeight: "800", letterSpacing: 1.1 },
  input: { height: 58, paddingHorizontal: 16, color: "#173b2b", backgroundColor: "#fffdf7", borderRadius: 12, fontSize: 15 },
  addButton: { height: 56, alignItems: "center", justifyContent: "center", borderRadius: 12, backgroundColor: "#fffdf7" },
  addText: { color: "#153d2c", fontSize: 16, fontWeight: "800" },
  disabled: { opacity: 0.55 },
});
