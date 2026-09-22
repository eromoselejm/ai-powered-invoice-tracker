import { useRouter } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Animated, {
  FadeInDown,
  Layout,
  LinearTransition,
} from 'react-native-reanimated';


function formatDate(createdAt: Date) {
  const now = new Date();
  const diff = +now - +createdAt;
  const hoursSince = Math.floor(diff / (1000 * 60 * 60));
  const daysSince = Math.floor(diff / (1000 * 60 * 60 * 24));

  const createdTime = createdAt.toLocaleString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
  const dotw = createdAt.toLocaleString("en-US", { weekday: "long" });
  const date = createdAt.toLocaleDateString("en-US", {
    day: "numeric",
    month: "numeric",
    year: "2-digit",
  });

  if (hoursSince <= 24) return createdTime;
  if (daysSince <= 7) return dotw;
  return date;
}

interface Invoice {
  invoiceNumber: string;
  issueDate: string;
  dueDate?: string;
  sellerName: string;
  buyerName: string;
  description?: string;
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  createdAt: Date;
  buyerEmail?: string;
  buyerAddress?: string;
}

interface Props{
    data: Invoice,
    onPress: ()=> void
}

export default function Invoice({ data, onPress }: Props) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={1}>
      <Animated.View
      entering={FadeInDown.duration(300)}
      layout={LinearTransition.springify()}
      style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.buyerName}>{data.buyerName}</Text>
          <Text style={styles.date}>{formatDate(data.createdAt)}</Text>
        </View>
        <View style={[styles.header, { marginBottom: 0 }]}>
          <Text style={styles.invoiceNumber}>{data.invoiceNumber}</Text>
          <Text style={styles.totalAmount}>+{data.totalAmount}</Text>
        </View>
      </Animated.View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderColor: "#ECECEF",
    borderRadius: 20,
    padding: 18,
    gap: 4,
    marginHorizontal: 16,
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  buyerName: { fontSize: 17, fontWeight: "700", color: "#101012" },
  date: { fontSize: 12, fontWeight: "500", color: "#9B9BA1" },
  text: { fontSize: 13 },
  invoiceNumber: {
    fontSize: 12,
    fontWeight: "500",
    color: "#9B9BA1",
  },
  totalAmount: {
    fontSize: 20,
    fontWeight: "800",
    color: "#1FAE5C",
  },
});