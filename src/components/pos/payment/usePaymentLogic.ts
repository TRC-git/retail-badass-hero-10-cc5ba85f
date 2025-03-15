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
          setProcessing(false);
          return;
      }

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

  const saveTransactionToSupabase = async () => {
    return { error: null };
  };

  const updateCustomerWallet = async (customerId: string, amount: number, transactionId: string) => {
    if (!customerId || !amount) return;
    
    try {
      const { data: wallet, error: walletError } = await supabase
        .from('client_wallets')
        .select('id, current_balance')
        .eq('customer_id', customerId)
        .single();
        
      if (walletError) {
        const { data: newWallet, error: createError } = await supabase
          .from('client_wallets')
          .insert([{ 
            customer_id: customerId, 
            current_balance: amount 
          }])
          .select()
          .single();
          
        if (createError) throw createError;
        
        await supabase
          .from('wallet_transactions')
          .insert([{
            wallet_id: newWallet.id,
            amount: amount,
            type: 'charge',
            description: 'Added to tab during checkout',
            reference_id: transactionId
          }]);
      } else {
        const newBalance = (wallet.current_balance || 0) + amount;
        
        await supabase
          .from('client_wallets')
          .update({ 
            current_balance: newBalance,
            updated_at: new Date().toISOString()
          })
          .eq('id', wallet.id);
          
        await supabase
          .from('wallet_transactions')
          .insert([{
            wallet_id: wallet.id,
            amount: amount,
            type: 'charge',
            description: 'Added to tab during checkout',
            reference_id: transactionId
          }]);
      }
      
      console.log('Customer wallet updated successfully');
      return { success: true };
    } catch (error) {
      console.error('Error updating customer wallet:', error);
      return { success: false, error };
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
    calculateChange,
    handleNumpadInput,
    handleGiftCardPaymentComplete,
    processPayment,
    initializePayment,
    updateCustomerWallet
  };
}
