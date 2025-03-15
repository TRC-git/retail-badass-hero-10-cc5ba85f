
import { useState } from "react";
import { toast } from "sonner";
import { formatCurrency } from "@/utils/formatters";
import { PaymentMethod, CardDetails } from "./types/paymentTypes";
import { calculateChange, handleNumpadInput as handleNumpadInputUtil } from "./utils/cashPaymentUtils";
import { validatePayment } from "./utils/paymentValidation";
import { updateCustomerWallet } from "./utils/walletUtils";

export function usePaymentLogic(onSuccess: () => void, onClose: () => void) {
  // Payment state
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cash");
  const [amountTendered, setAmountTendered] = useState<string>("0");
  const [cardNumber, setCardNumber] = useState<string>("");
  const [cardExpiryMonth, setCardExpiryMonth] = useState<string>("");
  const [cardExpiryYear, setCardExpiryYear] = useState<string>("");
  const [cardCVC, setCardCVC] = useState<string>("");
  const [checkNumber, setCheckNumber] = useState<string>("");
  const [processing, setProcessing] = useState<boolean>(false);
  
  // Store total amount (set via initializePayment)
  let total = 0;

  // Handler for numpad input
  const handleNumpadInput = (value: string) => {
    handleNumpadInputUtil(value, amountTendered, setAmountTendered);
  };

  // Initialize payment with total amount
  const initializePayment = (totalAmount: number) => {
    total = totalAmount;
    setAmountTendered(totalAmount.toFixed(2));
  };

  // Gift card payment completion handler
  const handleGiftCardPaymentComplete = (cardCode: string) => {
    toast.success(`Payment completed using gift card: ${cardCode}`);
    onSuccess();
    onClose();
  };

  // Mock function for saving transaction to Supabase
  const saveTransactionToSupabase = async () => {
    return { error: null };
  };

  // Process payment
  const processPayment = async () => {
    setProcessing(true);
    
    try {
      // Validate payment details
      const cardDetails: CardDetails = { cardNumber, cardExpiryMonth, cardExpiryYear, cardCVC };
      const isValid = validatePayment(paymentMethod, total, amountTendered, cardDetails, checkNumber);
      
      if (!isValid) {
        setProcessing(false);
        return;
      }
      
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Set success message based on payment method
      let successMessage = "";
      switch (paymentMethod) {
        case "cash":
          const change = calculateChange(amountTendered, total);
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
          setProcessing(false);
          return;
      }

      // Save transaction
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
    calculateChange: () => calculateChange(amountTendered, total),
    handleNumpadInput,
    handleGiftCardPaymentComplete,
    processPayment,
    initializePayment,
    updateCustomerWallet
  };
}
