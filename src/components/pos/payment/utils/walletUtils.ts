
import { supabase } from "@/integrations/supabase/client";

export const updateCustomerWallet = async (
  customerId: string,
  amount: number,
  transactionId: string
): Promise<{ success: boolean; error?: any }> => {
  if (!customerId || !amount) return { success: false };
  
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
