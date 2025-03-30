
import { supabase } from "@/integrations/supabase/client";
import { Transaction } from "@/types";

// Fetch transactions by customer ID
export const fetchTransactionsByCustomerId = async (customerId: string): Promise<Transaction[]> => {
  try {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('customer_id', customerId);
    
    if (error) {
      throw error;
    }
    
    return data || [];
  } catch (error) {
    console.error(`Error fetching transactions for customer ${customerId}:`, error);
    return [];
  }
};

// Alias for backward compatibility
export const fetchTransactionsByCustomer = fetchTransactionsByCustomerId;

// Add fetchTransactions function
export const fetchTransactions = async (): Promise<Transaction[]> => {
  try {
    const { data, error } = await supabase
      .from('transactions')
      .select('*');
    
    if (error) {
      throw error;
    }
    
    return data || [];
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return [];
  }
};
