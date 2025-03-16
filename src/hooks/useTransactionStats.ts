
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DateRange } from "react-day-picker";

type PeriodType = 'day' | 'week' | 'month';

export const useTransactionStats = (dateRange?: DateRange, periodType: PeriodType = 'week') => {
  return useQuery({
    queryKey: ["transaction-stats", dateRange, periodType],
    queryFn: async () => {
      let query = supabase
        .from('transactions')
        .select('total, status, payment_method, created_at')
        .order('created_at', { ascending: false });

      // Apply date range filters if provided
      if (dateRange?.from) {
        query = query.gte('created_at', dateRange.from.toISOString());
      }

      if (dateRange?.to) {
        const toDate = new Date(dateRange.to);
        toDate.setHours(23, 59, 59, 999);
        query = query.lte('created_at', toDate.toISOString());
      }

      const { data: transactions, error } = await query;

      if (error) throw error;

      const totalSales = transactions.reduce((sum, tx) => 
        tx.status === 'completed' ? sum + (Number(tx.total) || 0) : sum, 0);
      
      const completedCount = transactions.filter(tx => tx.status === 'completed').length;
      const openTabsCount = transactions.filter(tx => tx.status === 'open').length;
      
      const paymentMethods = transactions
        .filter(tx => tx.status === 'completed')
        .reduce((acc: Record<string, number>, tx) => {
          const method = tx.payment_method || 'unknown';
          acc[method] = (acc[method] || 0) + 1;
          return acc;
        }, {});
      
      const topPaymentMethod = Object.entries(paymentMethods)
        .sort((a, b) => b[1] - a[1])
        .map(([method]) => method)[0] || 'None';
      
      const avgTransactionValue = completedCount > 0 
        ? totalSales / completedCount 
        : 0;
      
      // Today's date at midnight
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      // Calculate today's sales
      const todayTransactions = transactions.filter(tx => 
        new Date(tx.created_at) >= today && 
        tx.status === 'completed'
      );
      const todaySales = todayTransactions.reduce((sum, tx) => sum + (Number(tx.total) || 0), 0);
      
      // Get dates for comparison based on period type
      let currentPeriodStart: Date;
      let previousPeriodStart: Date;
      let previousPeriodEnd: Date;
      let periodLabel: string;
      
      if (periodType === 'day') {
        // Compare today vs yesterday
        currentPeriodStart = today;
        
        previousPeriodStart = new Date(today);
        previousPeriodStart.setDate(previousPeriodStart.getDate() - 1);
        
        previousPeriodEnd = new Date(previousPeriodStart);
        previousPeriodEnd.setHours(23, 59, 59, 999);
        
        periodLabel = "yesterday";
      } else if (periodType === 'week') {
        // Current week (starting Monday)
        currentPeriodStart = new Date(today);
        const dayOfWeek = currentPeriodStart.getDay();
        const diff = currentPeriodStart.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
        currentPeriodStart.setDate(diff);
        
        // Previous week
        previousPeriodStart = new Date(currentPeriodStart);
        previousPeriodStart.setDate(previousPeriodStart.getDate() - 7);
        
        previousPeriodEnd = new Date(currentPeriodStart);
        previousPeriodEnd.setDate(previousPeriodEnd.getDate() - 1);
        previousPeriodEnd.setHours(23, 59, 59, 999);
        
        periodLabel = "last week";
      } else if (periodType === 'month') {
        // Current month
        currentPeriodStart = new Date(today.getFullYear(), today.getMonth(), 1);
        
        // Previous month
        previousPeriodStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        
        previousPeriodEnd = new Date(today.getFullYear(), today.getMonth(), 0);
        previousPeriodEnd.setHours(23, 59, 59, 999);
        
        periodLabel = "last month";
      }
      
      // Calculate current period transactions
      const currentPeriodTransactions = transactions.filter(tx => 
        new Date(tx.created_at) >= currentPeriodStart && 
        tx.status === 'completed'
      );
      
      const currentPeriodSales = currentPeriodTransactions.reduce((sum, tx) => sum + (Number(tx.total) || 0), 0);
      
      // Calculate previous period transactions
      const previousPeriodTransactions = transactions.filter(tx => 
        new Date(tx.created_at) >= previousPeriodStart && 
        new Date(tx.created_at) <= previousPeriodEnd && 
        tx.status === 'completed'
      );
      
      const previousPeriodSales = previousPeriodTransactions.reduce((sum, tx) => sum + (Number(tx.total) || 0), 0);
      
      // Calculate trend percentage - Fix type issue with explicit number casting
      const salesTrend = previousPeriodSales > 0 
        ? ((Number(currentPeriodSales) - Number(previousPeriodSales)) / Number(previousPeriodSales)) * 100 
        : 0;

      return {
        totalSales,
        completedCount,
        openTabsCount,
        topPaymentMethod,
        avgTransactionValue,
        todaySales,
        currentPeriodSales,
        previousPeriodSales,
        salesTrend,
        periodLabel
      };
    }
  });
};
