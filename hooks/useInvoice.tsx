import { useContext } from "react";
import { InvoiceContext } from "../context/InvoiceContext";

export function useInvoice(){
    const context = useContext(InvoiceContext)
    if(!context) throw new Error("useInvoice must be used within InvoiceContextProvider")
    return context
}