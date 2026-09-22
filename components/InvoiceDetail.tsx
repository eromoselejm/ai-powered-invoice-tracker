import FeatherIcon from "@expo/vector-icons/Feather";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

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

interface Props {
  data: Invoice | null;
  onPress: () => void;
}

export default function InvoiceDetail({ data, onPress }: Props) {
  return (
    <View style={{ flex: 1, backgroundColor: "rgba(15,15,17,0.35)" }}>
      <SafeAreaView
        style={{
          flex: 1,
          marginTop: 60,
          backgroundColor: "#fff",
          borderTopLeftRadius: 32,
          borderTopRightRadius: 32,
          elevation: 5,
          shadowColor: "black",
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.12,
          shadowRadius: 16,
          overflow: "hidden",
        }}
      >
        <View style={styles.container}>
          <View style={styles.grabber} />

          <View style={styles.headerAction}/>

          <ScrollView
            contentContainerStyle={styles.receipt}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.receiptLogo}>
              <FeatherIcon color="#fff" name="codepen" size={30} />
            </View>

            <Text style={styles.receiptTitle}>{data?.buyerName}</Text>

            <Text style={styles.receiptSubtitle}>{data?.invoiceNumber}</Text>

            <View style={styles.receiptPrice}>
              <Text style={styles.receiptPriceText}>${data?.totalAmount}</Text>
            </View>

            {data?.description && (
              <Text style={styles.receiptDescription}>{data.description}</Text>
            )}

            <View style={styles.divider}>
              <View style={styles.dividerInset} />
            </View>

            <View style={styles.details}>
              <Text style={styles.detailsTitle}>Transaction details</Text>

              <View style={styles.detailsRow}>
                <Text style={styles.detailsField}>Date</Text>

                <Text style={styles.detailsValue}>{data?.issueDate}</Text>
              </View>

              <View style={styles.detailsRow}>
                <Text style={styles.detailsField}>Sub Total</Text>

                <Text style={styles.detailsValue}>${data?.subtotal}</Text>
              </View>

              <View style={styles.detailsRow}>
                <Text style={styles.detailsField}>Tax Amount</Text>

                <Text style={styles.detailsValue}>${data?.taxAmount}</Text>
              </View>

              {data?.buyerEmail && (
                <View style={styles.detailsRow}>
                  <Text style={styles.detailsField}>Buyer Email</Text>

                  <Text style={styles.detailsValue}>{data.buyerEmail}</Text>
                </View>
              )}

              {data?.buyerAddress && (
                <View style={styles.detailsRow}>
                  <Text style={styles.detailsField}>Buyer Address</Text>

                  <Text style={styles.detailsValue}>{data.buyerAddress}</Text>
                </View>
              )}
            </View>
          </ScrollView>
        </View>
      </SafeAreaView>

      <View style={styles.overlay}>
        <TouchableOpacity
          onPress={onPress}
          activeOpacity={0.85}
        >
          <View style={styles.btnSecondary}>
            <Text style={styles.btnSecondaryText}>Close</Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 6,
    paddingHorizontal: 16,
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: 0,
  },
  grabber: {
    alignSelf: "center",
    width: 40,
    height: 4,
    borderRadius: 4,
    backgroundColor: "#E3E3E7",
    marginBottom: 6,
  },
  overlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    flexDirection: "column",
    alignItems: "stretch",
    paddingTop: 12,
    paddingHorizontal: 16,
    paddingBottom: 40,
    borderTopWidth: 1,
    borderTopColor: "#F0F0F2",
  },
  /** Header */
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerAction: {
    alignItems: "flex-end",
    justifyContent: "center",
    borderWidth: 0,
    marginTop: 4,
    height: 32,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#F2F2F4",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#000",
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: 0,
    textAlign: "center",
  },
  /** Receipt */
  receipt: {
    alignItems: "center",
    paddingTop: 12,
    paddingBottom: 140,
  },
  receiptLogo: {
    width: 64,
    height: 64,
    borderRadius: 9999,
    marginBottom: 14,
    backgroundColor: "#0e0e0e",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 10,
    elevation: 4,
  },
  receiptTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#151515",
    marginBottom: 2,
  },
  receiptSubtitle: {
    fontSize: 13,
    lineHeight: 20,
    color: "#9B9BA1",
    marginBottom: 14,
    fontWeight: "500",
  },
  receiptPrice: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "flex-end",
    marginBottom: 8,
  },
  receiptPriceText: {
    fontSize: 34,
    lineHeight: 40,
    fontWeight: "800",
    letterSpacing: 0.35,
    color: "#000",
  },
  receiptDescription: {
    fontSize: 14,
    lineHeight: 22,
    color: "#818181",
    textAlign: "center",
    marginBottom: 12,
    paddingHorizontal: 12,
  },
  /** Avatar */
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 9999,
    borderWidth: 3,
    borderColor: "#fff",
  },
  avatarWrapper: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 10,
  },
  /** Divider */
  divider: {
    overflow: "hidden",
    width: "100%",
    marginVertical: 22,
  },
  dividerInset: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#EBEBEE",
    borderStyle: "dashed",
    marginTop: -1,
  },
  /** Details */
  details: {
    width: "100%",
    flexDirection: "column",
    alignItems: "stretch",
    backgroundColor: "#FAFAFB",
    borderRadius: 20,
    padding: 18,
  },
  detailsTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1A1A1D",
    marginBottom: 16,
  },
  detailsRow: {
    marginBottom: 14,
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  detailsField: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "500",
    color: "#9B9BA1",
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: 0,
  },
  detailsValue: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "600",
    color: "#28282C",
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: 0,
    textAlign: "right",
  },
  /** Button */
  btnText: {
    fontSize: 18,
    lineHeight: 26,
    fontWeight: "600",
    color: "#fff",
  },
  btnSecondary: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 30,
    paddingVertical: 15,
    paddingHorizontal: 20,
    backgroundColor: "#101012",
  },
  btnSecondaryText: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: "700",
    color: "#fff",
  },
});