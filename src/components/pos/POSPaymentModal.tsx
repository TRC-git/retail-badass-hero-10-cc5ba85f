
import React, { useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { TransactionSummary } from "./TransactionSummary";
import { PaymentMethodTabs } from "./payment/PaymentMethodTabs";
import { PaymentActions } from "./payment/PaymentActions";
import { usePaymentLogic } from "./payment/usePaymentLogic";
import { supabase } from "@/integrations/supabase/client";
import { updateInventory } from "@/hooks/pos/utils/inventoryUtils";

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
    processPayment: processPaymentBase,
    initializePayment,
    updateCustomerWallet
  } = usePaymentLogic(onSuccess, onClose);

  // Initialize the amount tendered when the modal opens or total changes
  useEffect(() => {
    if (open) {
      initializePayment(total);
    }
  }, [open, total]);

  // Enhanced payment processing with Supabase integration
  const processPayment = async () => {
    try {
      // First, save the transaction to Supabase
      const { data, error } = await supabase
        .from('transactions')
        .insert({
          customer_id: customer?.id || null,
          items: cartItems,
          subtotal: subtotal,
          tax: tax,
          total: total,
          payment_method: paymentMethod,
          status: paymentMethod === 'tab' ? 'open' : 'completed',
          completed_at: paymentMethod === 'tab' ? null : new Date().toISOString()
        })
        .select();

      if (error) {
        console.error('Error saving transaction:', error);
        // Continue with payment processing but log the error
      } else {
        console.log('Transaction saved successfully:', data);
        
        // If it's a tab payment, update the customer's wallet
        if (paymentMethod === 'tab' && customer?.id && data?.[0]?.id) {
          await updateCustomerWallet(customer.id, total, data[0].id);
        }
        
        // Update inventory for completed transactions (not for tabs)
        if (paymentMethod !== 'tab') {
          const inventoryUpdated = await updateInventory(cartItems);
          if (!inventoryUpdated) {
            console.error('Failed to update inventory');
            // Continue with payment process but log the error
          } else {
            console.log('Inventory updated successfully');
          }
        }
      }

      // Continue with the base payment processing
      await processPaymentBase();
    } catch (error) {
      console.error('Transaction processing error:', error);
      // Let the base payment processor handle errors
      await processPaymentBase();
    }
  };

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
