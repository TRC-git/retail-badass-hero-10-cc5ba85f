
export type PaymentMethod = "cash" | "card" | "check" | "tab" | "gift_card";

export interface CardDetails {
  cardNumber: string;
  cardExpiryMonth: string;
  cardExpiryYear: string;
  cardCVC: string;
}

export interface PaymentState {
  paymentMethod: PaymentMethod;
  amountTendered: string;
  cardNumber: string;
  cardExpiryMonth: string;
  cardExpiryYear: string;
  cardCVC: string;
  checkNumber: string;
  processing: boolean;
}
