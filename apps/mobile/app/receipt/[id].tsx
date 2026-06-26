import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";

type Receipt = {
  merchantName: string;
  merchantDocument?: string | null;
  totalAmount: number;
  items: Array<{ description: string; quantity: number; unit?: string | null; unitPrice: number; totalPrice: number }>;
};

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3300";
const money = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

export default function ReceiptDetails() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [receipt, setReceipt] = useState<Receipt | null>(null);

  useEffect(() => {
    fetch(`${API_URL}/receipts/${id}`)
      .then((response) => response.json())
      .then(setReceipt);
  }, [id]);

  if (!receipt) {
    return <View style={styles.loading}><ActivityIndicator color="#e7ad2d" size="large" /></View>;
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Pressable onPress={() => router.replace("/")}><Text style={styles.back}>‹</Text></Pressable>
        <Text style={styles.headerTitle}>Compra adicionada</Text>
        <View style={{ width: 30 }} />
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.check}>✓</Text>
        <Text style={styles.store}>{receipt.merchantName}</Text>
        {receipt.merchantDocument && <Text style={styles.document}>{receipt.merchantDocument}</Text>}
        <View style={styles.card}>
          {receipt.items.map((item, index) => (
            <View style={styles.item} key={`${item.description}-${index}`}>
              <View style={styles.itemCopy}>
                <Text style={styles.itemName}>{item.description}</Text>
                <Text style={styles.itemMeta}>{item.quantity} {item.unit ?? "un"} × {money.format(item.unitPrice)}</Text>
              </View>
              <Text style={styles.itemPrice}>{money.format(item.totalPrice)}</Text>
            </View>
          ))}
          <View style={styles.total}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>{money.format(receipt.totalAmount)}</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#f4f1e9" },
  loading: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#153d2c" },
  header: { height: 64, paddingHorizontal: 20, flexDirection: "row", alignItems: "center", justifyContent: "space-between", backgroundColor: "#153d2c" },
  back: { color: "white", fontSize: 40, lineHeight: 42 },
  headerTitle: { color: "white", fontSize: 16, fontWeight: "800" },
  content: { padding: 22, alignItems: "center" },
  check: { width: 56, height: 56, paddingTop: 7, borderRadius: 28, overflow: "hidden", textAlign: "center", color: "#153d2c", backgroundColor: "#e7ad2d", fontSize: 30, fontWeight: "800" },
  store: { marginTop: 16, color: "#173b2b", fontSize: 27, fontWeight: "800", textAlign: "center" },
  document: { marginTop: 4, color: "#718078" },
  card: { width: "100%", marginTop: 26, padding: 18, borderRadius: 15, backgroundColor: "#fffdf8" },
  item: { flexDirection: "row", justifyContent: "space-between", gap: 12, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: "#ece9df" },
  itemCopy: { flex: 1, gap: 4 },
  itemName: { color: "#173b2b", fontWeight: "700" },
  itemMeta: { color: "#718078", fontSize: 12 },
  itemPrice: { color: "#173b2b", fontWeight: "700" },
  total: { flexDirection: "row", justifyContent: "space-between", paddingTop: 20 },
  totalLabel: { color: "#173b2b", fontSize: 19, fontWeight: "800" },
  totalValue: { color: "#173b2b", fontSize: 21, fontWeight: "800" },
});
