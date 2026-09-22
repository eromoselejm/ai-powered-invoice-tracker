import { createContext, useState } from "react";

type InvoiceContextValue = {
  openInvoice: Invoice | null;
  setOpenInvoice: React.Dispatch<React.SetStateAction<Invoice | null>>;
  balance: number | undefined;
  setBalance: React.Dispatch<React.SetStateAction<number | undefined>>;
  currency: Currency;
  setCurrency: React.Dispatch<React.SetStateAction<Currency>>;
  invoices: Invoice[] | null;
  setInvoices: React.Dispatch<React.SetStateAction<Invoice[] | null>>;
};

export const InvoiceContext = createContext<InvoiceContextValue | null>(null);

interface Props {
  children: React.ReactNode;
}

interface Currency {
  name: string;
  sign: string;
  logo: string;
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
  valid?: boolean;
}

export default function InvoiceContextProvider({ children }: Props) {
  const [openInvoice, setOpenInvoice] = useState<Invoice | null>(null);
  const [invoices, setInvoices] = useState<Invoice[] | null>([]);
  const [balance, setBalance] = useState<number | undefined>(0);
  const [currency, setCurrency] = useState<Currency>({
    name: "US Dollars",
    sign: "$",
    logo: "us",
  });

  return (
    <InvoiceContext.Provider
      value={{
        openInvoice,
        setOpenInvoice,
        balance,
        setBalance,
        currency,
        setCurrency,
        invoices,
        setInvoices,
      }}
    >
      {children}
    </InvoiceContext.Provider>
  );
}
