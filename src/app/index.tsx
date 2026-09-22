import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as FileSystem from "expo-file-system/legacy";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  Alert,
  Image,
  Linking,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import AnimatedNumbers from "react-native-animated-numbers";
import CountryFlag from "react-native-country-flag";
import Animated, {
  LinearTransition
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import Invoice from "../../components/Invoice";
import InvoiceDetail from "../../components/InvoiceDetail";
import InvoiceEmptyComponent from "../../components/InvoiceEmptyComponent";
import Toast from "../../components/Toast"
import { useInvoice } from "../../hooks/useInvoice"

const geminiApiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY;

const Home = () => {
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
    valid?: boolean;
  }

  const {
    openInvoice,
    setOpenInvoice,
    balance,
    setBalance,
    currency,
    setCurrency,
    invoices,
    setInvoices,
  } = useInvoice();

  const prompt = `
You are an invoice data extraction system.

Analyze the provided image and extract invoice information from it.

Return ONLY valid JSON. Do not include Markdown, code fences, explanations, comments, or any text outside the JSON object.

The JSON object MUST contain exactly these fields:

{
  "valid": boolean,
  "invoiceNumber": string | null,
  "issueDate": string | null,
  "dueDate": string | null,
  "sellerName": string | null,
  "buyerName": string | null,
  "description": string | null,
  "subtotal": number | null,
  "taxAmount": number | null,
  "totalAmount": number | null,
  "createdAt": string | null,
  "buyerEmail": string | null,
  "buyerAddress": string | null
}

Extraction rules:

1. Extract information only if it is clearly visible and readable in the image.
2. Do NOT guess, infer, fabricate, or hallucinate missing information.
3. If a field cannot be found or confidently extracted from the image, set its value to null.
4. Preserve information as it appears on the invoice, except for numeric fields.
5. For monetary values:
   - Remove currency symbols and currency codes.
   - Remove thousands separators.
   - Return only the numeric value.
   - Example: "$1,250.50" becomes 1250.50.
6. For dates, return strings and preferably use YYYY-MM-DD when the date can be determined unambiguously.
7. createdAt should represent the date/time the invoice was created ONLY if the invoice explicitly contains such information. Do NOT use the current date or invent a creation date. If no creation date is shown, return null.
8. description should contain the main invoice item or service description. If multiple items are present, provide a concise description covering the items.
9. sellerName is the business/person issuing the invoice.
10. buyerName is the customer/business being billed.
11. invoiceNumber is the invoice's identifying number.
12. subtotal is the amount before tax.
13. taxAmount is the total tax amount shown on the invoice.
14. totalAmount is the final invoice total or amount payable.

Validity rule:

Set "valid" to true ONLY if you can confidently extract ALL of these core invoice fields:

- invoiceNumber
- issueDate
- sellerName
- buyerName
- totalAmount

If the image is clearly an invoice and all core fields can be confidently extracted, set:

"valid": true

If the image is not an invoice, is too blurry/unreadable, or ANY of the core fields cannot be confidently extracted, set:

"valid": false

IMPORTANT:
If "valid" is false, set ALL other fields to null, even if some information was partially readable.

Final requirement:

Return ONLY the JSON object.
Do not wrap it in Markdown or code fences.
`;

  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [reviewOpen, setReviewOpen] = useState<boolean>(false);
  const cameraRef = useRef<CameraView>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [cameraOpen, setCameraOpen] = useState<boolean>(false);
  const [photoUri, setPhotoUri] = useState<string | undefined>(undefined);
  const [openToast, setOpenToast] = useState<boolean>(false);
  const [toast, setToast] = useState<string>("");

  const router = useRouter();

  function openModal(item: Invoice) {
    setOpenInvoice(item);
    setIsVisible(true);
  }

  async function onScan() {
    let cameraPermission = permission;
    let permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!cameraPermission?.granted && cameraPermission?.canAskAgain) {
      cameraPermission = await requestPermission();
    }

    if (!cameraPermission?.granted && !cameraPermission?.canAskAgain) {
      Alert.alert(
        "Turn on camera permission",
        "Go to settings and allow the app to access your camera",
        [
          {
            text: "Cancel",
            style: "cancel", // iOS only semantic styling
          },
          {
            text: "Open Settings",
            onPress: () => Linking.openSettings(),
            style: "cancel", // iOS only semantic styling
          },
        ],
      );
      return;
    }

    if (!permissionResult?.granted && permissionResult?.canAskAgain) {
      permissionResult =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
    }

    if (!permissionResult?.granted && !permissionResult?.canAskAgain) {
      Alert.alert(
        "Turn on albums permission",
        "Go to settings and allow the app to access your albums",
        [
          {
            text: "Cancel",
            style: "cancel", // iOS only semantic styling
          },
          {
            text: "Open Settings",
            onPress: () => Linking.openSettings(),
            style: "cancel", // iOS only semantic styling
          },
        ],
      );
      return;
    }

    if (cameraPermission?.granted) setCameraOpen(true);
  }

  async function pickImage() {
      let imageResult = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        quality: 1,
      });

      console.log(imageResult);

      if (!imageResult.canceled) {
        setPhotoUri(imageResult.assets[0].uri);
        setCameraOpen(false);
        setReviewOpen(true);
      }
    }

  async function takePicture() {
      if (cameraRef.current) {
        try {
          // Options like quality, skipping processing, or mirroring can be passed here
          const options = { quality: 0.8, skipProcessing: false };
          const data = await cameraRef.current.takePictureAsync(options);

          // The data object contains the local URI of the image
          if (data?.uri) {
            setPhotoUri(data.uri);
            setCameraOpen(false);
            setReviewOpen(true);
            console.log(data.uri);
          }
        } catch (error) {
          console.log("Error taking picture:", error);
          Alert.alert("Something went wrong...");
        }
      }
    }

  async function processInvoice() {
    let data;
    let results: Invoice;

    setReviewOpen(false);
    setToast("Processing your invoice...");
    setOpenToast(true);
    setTimeout(() => {
      setOpenToast(false);
    }, 3500);

    if (!photoUri) return;

    const base64Image = await FileSystem.readAsStringAsync(photoUri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    // 4. Send to Gemini
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent?key=${geminiApiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  { text: prompt },
                  {
                    inline_data: {
                      mime_type: "image/jpeg",
                      data: base64Image,
                    },
                  },
                ],
              },
            ],
          }),
        },
      );

      if (!response.ok) {
        const errorText = await response.text();
        setToast("Something went wrong, try again.");
        setOpenToast(true);
        setTimeout(() => {
          setOpenToast(false);
        }, 3500);
        throw new Error(
          `Gemini API error (${response.status}): ${errorText || "Unknown error"}`,
        );
      }

      data = await response.json();
      const rawText = data?.candidates
        ?.map((candidate: any) =>
          candidate?.content?.parts
            ?.map((part: any) => part?.text ?? "")
            .join(""),
        )
        .join("")
        .trim();

      if (!rawText) {
        setToast("No data was found.");
        setOpenToast(true);
        setTimeout(() => {
          setOpenToast(false);
        }, 3500);
        throw new Error("Gemini returned an empty response.");
      }

      const cleanedText = rawText
        .replace(/^```(?:json)?\s*/i, "")
        .replace(/\s*```$/i, "")
        .trim();

      results = JSON.parse(cleanedText);
      console.log(results);

      //Update the invoices list
      if (!results["valid"]) {
        setToast("No valid in image uploaded.");
        setOpenToast(true);
        setTimeout(() => {
          setOpenToast(false);
        }, 3500);
        return;
      }

      const updatedInvoices = [results, ...(invoices ?? [])];
      setInvoices(updatedInvoices);
      const total = updatedInvoices.map((inv) => inv.totalAmount);
      setBalance(total.reduce((acc, cv) => acc + cv, 0));

      try {
        const stringifiedInvoices = JSON.stringify(updatedInvoices);
        await AsyncStorage.setItem("invoices", stringifiedInvoices);
      } catch (e) {
        console.error("Error saving invoices: ", e);
      }
    } catch (e) {
      setOpenToast(true);
      setToast("Something went wrong, try again.");
      setTimeout(() => {
        setOpenToast(false);
      }, 3500);
      console.error("Something went wrong: ", e);
    } finally {
      setPhotoUri(undefined);
    }
  }

  function dummyAddInvoice() {
    const updatedInvoices = [
      {
        invoiceNumber: "INV-002",
        issueDate: "2026-09-15",
        dueDate: "2026-9-20",
        sellerName: "Apex Tech",
        buyerName: "Global Trade",
        description: "Web Design Services.",
        subtotal: 1322.32,
        taxAmount: 500,
        totalAmount: 1822.32,
        createdAt: new Date(),
      },
      ...(invoices ?? []),
    ];
    setInvoices(updatedInvoices);
    const total = updatedInvoices.map((inv) => inv.totalAmount);
    setBalance(total.reduce((acc, cv) => acc + cv, 0));
  }

  useEffect(() => {
    if (!permission?.granted) requestPermission();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Wallet</Text>
      </View>

      {/* Balance */}
      <View style={styles.balance}>
        <TouchableOpacity activeOpacity={0.6} style={styles.currency}>
          <View style={styles.flag}>
            <CountryFlag isoCode={currency.logo} size={22} />
          </View>
          <Text style={styles.currencyText}>{currency.name}</Text>
        </TouchableOpacity>
        <View
          style={{ flexDirection: "row", alignItems: "flex-start", gap: 4 }}
        >
          <Text style={styles.currencySign}>{currency.sign}</Text>
          <AnimatedNumbers
            includeComma
            animateToNumber={balance ?? 0}
            fontStyle={styles.amountBalance}
          />
        </View>
      </View>

      {/* Recent Transactions */}
      <View style={styles.recentTransactions}>
        <View style={styles.recentTransactionsHeader}>
          <Text style={styles.recentTransactionsTitle}>
            Transactions
          </Text>
        </View>
        <Animated.FlatList
          layout={LinearTransition.springify()}
          data={invoices}
          ListHeaderComponent={() => <View style={styles.headerComponent} />}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => (
            <View style={styles.separatorComponent} />
          )}
          ListEmptyComponent={() => <InvoiceEmptyComponent />}
          renderItem={({ item }) => (
            <Invoice data={item} onPress={() => openModal(item)} />
          )}
          style={{borderWidth: 0, marginHorizontal: 15, borderRadius: 30, marginBottom: 20, marginTop: 10, backgroundColor: "#ffffff8f"}}
          contentContainerStyle={{paddingBottom: 50}}
        />
      </View>

      {/* Invovice Detail Modal */}
      <Modal
        visible={isVisible}
        animationType="slide"
        transparent
        onRequestClose={() => {
          setIsVisible(false);
        }}
      >
        <InvoiceDetail onPress={() => setIsVisible(false)} data={openInvoice} />
      </Modal>

      {/* Add Invoice Button */}
      <TouchableOpacity style={styles.fab} activeOpacity={0.6} onPress={onScan}>
        <Ionicons name={"add"} color={"white"} size={32} />
      </TouchableOpacity>

      {/* Open Camera Modal */}
      <Modal
        visible={cameraOpen}
        animationType="slide"
        onRequestClose={() => setCameraOpen(false)}
        style={{
          paddingBottom: 20,
          backgroundColor: "#000000",
          paddingTop: 20,
          paddingHorizontal: 5,
        }}
      >
        <View style={styles.cameraContainer}>
          <CameraView ref={cameraRef} style={styles.camera} />
          <View
            style={{
              position: "absolute",
              top: 24,
              left: 0,
              right: 0,
              alignItems: "center",
            }}
          >
            <View
              style={{
                backgroundColor: "rgba(0,0,0,0.45)",
                paddingHorizontal: 16,
                paddingVertical: 8,
                borderRadius: 20,
              }}
            >
              <Text style={{ color: "#fff", fontSize: 13, fontWeight: "600" }}>
                Align invoice within frame
              </Text>
            </View>
          </View>
        </View>
        {/* Camera Controls */}
        <View
          style={{
            borderColor: "white",
            borderWidth: 0,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            paddingHorizontal: 28,
            marginTop: 40,
          }}
        >
          <TouchableOpacity
            style={{
              alignItems: "center",
              justifyContent: "center",
            }}
            onPress={pickImage}
          >
            <Ionicons name="images" color={"white"} size={24} />
          </TouchableOpacity>
          <TouchableOpacity
            style={{
              backgroundColor: "#ffffff",
              width: 78,
              height: 78,
              borderRadius: 39,
              alignItems: "center",
              justifyContent: "center",
              borderWidth: 4,
              borderColor: "rgba(255,255,255,0.35)",
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 10,
              elevation: 6,
            }}
            onPress={takePicture}
          >
            <View
              style={{
                width: 60,
                height: 60,
                borderRadius: 30,
                backgroundColor: "#ffffff",
                borderWidth: 2,
                borderColor: "#0E0E10",
              }}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={{
              width: 44,
              height: 44,
              borderRadius: 22,
              backgroundColor: "rgba(255,255,255,0.14)",
              alignItems: "center",
              justifyContent: "center",
            }}
            onPress={() => setCameraOpen(false)}
          >
            <Ionicons name="close" color="white" size={24} />
          </TouchableOpacity>
        </View>
      </Modal>

      {/* Photo Review Modal */}
      <Modal
        visible={reviewOpen}
        animationType="slide"
        onRequestClose={() => {
          setCameraOpen(false);
          setPhotoUri(undefined);
        }}
        style={{
          paddingBottom: 20,
          backgroundColor: "#000000",
          paddingTop: 10,
          paddingHorizontal: 5,
        }}
      >
        <View style={styles.cameraContainer}>
          <Image source={{ uri: photoUri }} style={styles.camera} />
        </View>
        <View
          style={{
            borderColor: "white",
            borderWidth: 0,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            paddingHorizontal: 24,
            marginTop: 40,
            gap: 16,
          }}
        >
          <TouchableOpacity
            onPress={() => {
              setReviewOpen(false);
              setCameraOpen(true);
              setPhotoUri(undefined);
            }}
            style={{
              flex: 1,
              backgroundColor: "rgba(255,255,255,0.12)",
              flexDirection: "row",
              borderRadius: 30,
              paddingVertical: 16,
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              borderWidth: 1,
              borderColor: "rgba(255,255,255,0.2)",
            }}
          >
            <Ionicons name="refresh-outline" size={18} color={"#fff"} />
            <Text style={{ color: "#fff", fontWeight: "600", fontSize: 15 }}>
              Retake
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={{
              flex: 1,
              backgroundColor: "#ffffff",
              flexDirection: "row",
              borderRadius: 30,
              paddingVertical: 16,
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.2,
              shadowRadius: 8,
              elevation: 4,
            }}
            onPress={processInvoice}
          >
            <Text style={{ color: "#0E0E10", fontWeight: "700", fontSize: 15 }}>
              Done
            </Text>
            <Ionicons name="checkmark" color="#0E0E10" size={18} />
          </TouchableOpacity>
        </View>
      </Modal>

      {openToast && <Toast text={toast} />}
    </SafeAreaView>
  );
};

export default Home;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    gap: 24,
    backgroundColor: "#F7F8FA",
  },
  camera: {
    flex: 1,
    borderRadius: 50,
  },
  cameraContainer: {
    flex: 1,
    backgroundColor: "black",
  },
  closeCamera: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0, 0, 0, 0.55)",
  },
  header: {
    width: "100%",
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
  title: {
    fontWeight: "800",
    fontSize: 30,
    color: "#0E0E10",
    letterSpacing: -0.5,
  },
  balance: {
    width: "90%",
    paddingVertical: 26,
    paddingHorizontal: 22,
    paddingBottom: 32,
    alignItems: "center",
    justifyContent: "flex-start",
    gap: 20,
    marginBottom: 4,
    backgroundColor: "#111214",
    borderRadius: 28,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.18,
    shadowRadius: 20,
    elevation: 6,
  },
  amountBalance: {
    fontSize: 42,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: -1,
  },
  currencySign: {
    fontSize: 42,
    fontWeight: "700",
    color: "#FFFFFF",
    opacity: 0.85,
  },
  currency: {
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.14)",
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: 22,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(255,255,255,0.06)",
  },
  currencyText: {
    fontWeight: "600",
    fontSize: 13,
    color: "#FFFFFF",
  },
  recentTransactions: {
    width: "100%",
    flex: 1,
    marginBottom: 30,
  },
  recentTransactionsHeader: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  recentTransactionsTitle: {
    fontWeight: "700",
    fontSize: 17,
    color: "#0E0E10",
  },
  seeAll: {
    fontSize: 13,
    fontWeight: "600",
    color: "#6C6C72",
  },
  flag: {
    width: 22,
    height: 22,
    borderRadius: 18,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },
  headerComponent: {
    height: 12,
  },
  separatorComponent: {
    height: 8,
  },
  fab: {
    position: "absolute",
    right: 30,
    width: 60,
    height: 60,
    borderRadius: 50,
    backgroundColor: "black",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
    bottom: 50,
  },
});
