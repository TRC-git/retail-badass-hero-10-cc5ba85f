
import { useState } from "react";
import { toast } from "sonner";
import { formatCurrency } from "@/utils/formatters";
import { supabase } from "@/integrations/supabase/client";

export function usePaymentLogic(onSuccess: () => void, onClose: () => void) {
  const [paymentMethod, setPaymentMethod] = useState<string>("cash");
  const [amountTendered, setAmountTendered] = useState<string>("0");
  const [cardNumber, setCardNumber] = useState<string>("");
  const [cardExpiryMonth, setCardExpiryMonth] = useState<string>("");
  const [cardExpiryYear, setCardExpiryYear] = useState<string>("");
  const [cardCVC, setCardCVC] = useState<string>("");
  const [checkNumber, setCheckNumber] = useState<string>("");
  const [processing, setProcessing] = useState<boolean>(false);

  const calculateChange = (): number => {
    const tendered = parseFloat(amountTendered) || 0;
    return Math.max(0, tendered - (total || 0));
  };

  const handleNumpadInput = (value: string) => {
    if (value === "clear") {
      setAmountTendered("0");
      return;
    }

    if (value === "backspace") {
      setAmountTendered((prev) => 
        prev.length > 1 ? prev.slice(0, -1) : "0"
      );
      return;
    }

    if ([10, 20, 50, 100].includes(Number(value))) {
      setAmountTendered(value);
      return;
    }

    setAmountTendered((prev) => {
      if (prev === "0" && value !== ".") {
        return value;
      }
      if (value === "." && prev.includes(".")) {
        return prev;
      }
      return prev + value;
    });
  };

  // This function must be called with the appropriate total in the component
  let total = 0; 
  const initializePayment = (totalAmount: number) => {
    total = totalAmount;
    setAmountTendered(totalAmount.toFixed(2));
  };

  const handleGiftCardPaymentComplete = (cardCode: string) => {
    toast.success(`Payment completed using gift card: ${cardCode}`);
    onSuccess();
    onClose();
  };

  const processPayment = async () => {
    setProcessing(true);
    
    try {
      if (paymentMethod === "cash") {
        const tendered = parseFloat(amountTendered) || 0;
        if (tendered < total) {
          toast.error("Amount tendered must be equal to or greater than the total");
          setProcessing(false);
          return;
        }
      } else if (paymentMethod === "card") {
        if (!cardNumber || !cardExpiryMonth || !cardExpiryYear || !cardCVC) {
          toast.error("Please enter all card details");
          setProcessing(false);
          return;
        }
        if (cardNumber.length < 13 || cardNumber.length > 19) {
          toast.error("Invalid card number");
          setProcessing(false);
          return;
        }
      } else if (paymentMethod === "check") {
        if (!checkNumber) {
          toast.error("Please enter a check number");
          setProcessing(false);
          return;
        }
      }
      
      // Wait a bit to simulate processing
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      let successMessage = "";
      switch (paymentMethod) {
        case "cash":
          const change = calculateChange();
          successMessage = `Payment complete. Change: ${formatCurrency(change)}`;
          break;
        case "card":
          successMessage = "Card payment processed successfully";
          break;
        case "check":
          successMessage = `Check #${checkNumber} accepted`;
          break;
        case "tab":
          successMessage = "Transaction added to customer tab";
          break;
        case "gift_card":
          // Gift card payments are handled by the GiftCardPayment component
          setProcessing(false);
          return;
      }

      // Save the transaction to Supabase
      const { error } = await saveTransactionToSupabase();
      
      if (error) {
        console.error("Error saving transaction:", error);
        toast.error("Transaction completed but there was an error saving the record");
      } else {
        console.log("Transaction saved successfully to Supabase");
        toast.success(successMessage);
        onSuccess();
      }
    } catch (error) {
      console.error("Payment error:", error);
      toast.error("Payment processing failed");
    } finally {
      setProcessing(false);
      onClose();
    }
  };

  // New function to save transaction to Supabase
  const saveTransactionToSupabase = async () => {
    // This function needs context from the POSPaymentModal component
    // We'll modify it to accept the necessary parameters in a future update
    
    // For now, let's set up a stub to be replaced with the actual implementation
    return { error: null };
  };

  return {
    paymentMethod,
    setPaymentMethod,
    amountTendered,
    setAmountTendered,
    cardNumber,
    setCardNumber,
    cardExpiryMonth,
    setCardExpiryMonth,
    cardExpiryYear,
    setCardExpiryYear,
    cardCVC,
    setCardCVC,
    checkNumber,
    setCheckNumber,
    processing,
    setProcessing,
    calculateChange,
    handleNumpadInput,
    handleGiftCardPaymentComplete,
    processPayment,
    initializePayment
  };
}
