
import { toast } from "sonner";
import { CardDetails, PaymentMethod } from "../types/paymentTypes";

export const validatePayment = (
  paymentMethod: PaymentMethod,
  total: number,
  amountTendered: string,
  cardDetails?: CardDetails,
  checkNumber?: string
): boolean => {
  if (paymentMethod === "cash") {
    const tendered = parseFloat(amountTendered) || 0;
    if (tendered < total) {
      toast.error("Amount tendered must be equal to or greater than the total");
      return false;
    }
  } else if (paymentMethod === "card") {
    if (!cardDetails) return false;
    
    const { cardNumber, cardExpiryMonth, cardExpiryYear, cardCVC } = cardDetails;
    
    if (!cardNumber || !cardExpiryMonth || !cardExpiryYear || !cardCVC) {
      toast.error("Please enter all card details");
      return false;
    }
    if (cardNumber.length < 13 || cardNumber.length > 19) {
      toast.error("Invalid card number");
      return false;
    }
  } else if (paymentMethod === "check") {
    if (!checkNumber) {
      toast.error("Please enter a check number");
      return false;
    }
  }
  
  return true;
};
