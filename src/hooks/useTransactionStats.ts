
// Import required dependencies
import { useState, useEffect } from 'react';
import { fetchTransactions } from '@/api/transactionApi';
import { Transaction } from '@/types/transaction';
import { DateRange } from 'react-day-picker';

// Define return type for the hook
interface TransactionStatsReturn {
  totalSales: number;
  averageOrderValue: number;
  transactionCount: number;
  isLoading: boolean;
  error: Error | null;
}

/**
 * Hook to calculate transaction statistics
 */
export const useTransactionStats = (
  dateRange?: DateRange
): TransactionStatsReturn => {
  const [totalSales, setTotalSales] = useState<number>(0);
  const [averageOrderValue, setAverageOrderValue] = useState<number>(0);
  const [transactionCount, setTransactionCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const loadTransactions = async () => {
      setIsLoading(true);
      try {
        const transactions = await fetchTransactions();
        
        // Filter by date range if provided
        const filteredTransactions = dateRange && dateRange.from
          ? transactions.filter(transaction => {
              const transactionDate = new Date(transaction.created_at || '');
              const from = dateRange.from;
              const to = dateRange.to || dateRange.from;
              
              return (
                transactionDate >= from &&
                transactionDate <= to
              );
            })
          : transactions;
        
        // Calculate stats
        const count = filteredTransactions.length;
        const total = filteredTransactions.reduce(
          (sum, transaction) => sum + Number(transaction.total || 0), 
          0
        );
        
        setTransactionCount(count);
        setTotalSales(total);
        setAverageOrderValue(count > 0 ? total / count : 0);
        
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'));
      } finally {
        setIsLoading(false);
      }
    };

    loadTransactions();
  }, [dateRange]);

  return {
    totalSales,
    averageOrderValue,
    transactionCount,
    isLoading,
    error
  };
};
