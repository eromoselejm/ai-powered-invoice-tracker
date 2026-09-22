import { Stack } from "expo-router";
import InvoiceContextProvider from "../../context/InvoiceContext";

export default function RootLayout() {
  return (
      <InvoiceContextProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
        </Stack>
      </InvoiceContextProvider>
  );
}
