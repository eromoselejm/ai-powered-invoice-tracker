import { StyleSheet, Text, View } from "react-native";

const InvoiceEmptyComponent = () => {
  return (
    <View style={styles.container}>
      <View style={styles.iconWrap}>
        <Text style={styles.icon}>💸</Text>
      </View>
      <Text style={styles.mainText}>No Transactions yet</Text>
      <Text style={styles.subText}>
        Scan an invoice and it'll show up here.
      </Text>
    </View>
  );
};

export default InvoiceEmptyComponent;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
    marginTop: 80,
  },
  iconWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#F2F2F4",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  icon: {
    fontSize: 32,
  },
  mainText: {
    fontSize: 17,
    fontWeight: "700",
    color: "#101012",
    marginBottom: 6,
  },
  subText: {
    fontSize: 14,
    color: "#9B9BA1",
    textAlign: "center",
    lineHeight: 20,
  },
});