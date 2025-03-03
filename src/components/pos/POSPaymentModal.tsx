
import React, { useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { TransactionSummary } from "./TransactionSummary";
import { PaymentMethodTabs } from "./payment/PaymentMethodTabs";
import { PaymentActions } from "./payment/PaymentActions";
import { usePaymentLogic } from "./payment/usePaymentLogic";

export interface POSPaymentModalProps {
  open: boolean;
  onClose: () => void;
  cartItems: any[];
  subtotal: number;
  tax: number;
  total: number;
  customer: any;
  taxRate: number;
  storeName: string;
  onSuccess: () => void;
}

export function POSPaymentModal({
  open,
  onClose,
  cartItems,
  subtotal,
  tax,
  total,
  customer,
  taxRate,
  storeName,
  onSuccess,
}: POSPaymentModalProps) {
  const {
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
    handleNumpadInput,
    handleGiftCardPaymentComplete,
    processPayment,
    initializePayment
  } = usePaymentLogic(onSuccess, onClose);

  // Initialize the amount tendered when the modal opens or total changes
  useEffect(() => {
    if (open) {
      initializePayment(total);
    }
  }, [open, total]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] lg:max-w-[900px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Payment</DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <PaymentMethodTabs
              paymentMethod={paymentMethod}
              setPaymentMethod={setPaymentMethod}
              amountTendered={amountTendered}
              setAmountTendered={setAmountTendered}
              total={total}
              handleNumpadInput={handleNumpadInput}
              cardNumber={cardNumber}
              setCardNumber={setCardNumber}
              cardExpiryMonth={cardExpiryMonth}
              setCardExpiryMonth={setCardExpiryMonth}
              cardExpiryYear={cardExpiryYear}
              setCardExpiryYear={setCardExpiryYear}
              cardCVC={cardCVC}
              setCardCVC={setCardCVC}
              checkNumber={checkNumber}
              setCheckNumber={setCheckNumber}
              storeName={storeName}
              customer={customer}
              onGiftCardPaymentComplete={handleGiftCardPaymentComplete}
            />
          </div>
          
          <div>
            <TransactionSummary 
              cartItems={cartItems}
              subtotal={subtotal}
              tax={tax}
              total={total}
              taxRate={taxRate}
              customer={customer}
            />
          </div>
        </div>
        
        <DialogFooter>
          <PaymentActions
            onCancel={onClose}
            onPayment={processPayment}
            processing={processing}
            paymentMethod={paymentMethod}
          />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
