
import React, { useState } from "react";
import { 
  BanknoteIcon, 
  CalendarIcon, 
  TrendingUp
} from "lucide-react";
import StatCard from "@/components/StatCard";
import { formatCurrency } from "@/utils/formatters";
import { useTransactionStats } from "@/hooks/useTransactionStats";
import { DateRange } from "react-day-picker";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface TransactionStatsProps {
  dateRange?: DateRange;
}

const TransactionStats: React.FC<TransactionStatsProps> = ({ dateRange }) => {
  const [periodType, setPeriodType] = useState<string>('week');
  const { 
    totalSales, 
    averageOrderValue, 
    transactionCount,
    isLoading 
  } = useTransactionStats(dateRange);
  
  const getDateRangeDescription = () => {
    if (!dateRange?.from) return "";
    
    const fromDate = dateRange.from.toLocaleDateString();
    const toDate = dateRange.to ? dateRange.to.toLocaleDateString() : fromDate;
    
    return ` (${fromDate} - ${toDate})`;
  };

  // Get period subtitle text based on period type
  const getPeriodSubtitle = (type: string): string => {
    switch (type) {
      case 'day':
        return 'Today';
      case 'week':
        return 'This Week';
      case 'month':
        return 'This Month';
      default:
        return '';
    }
  };
  
  return (
    <div className="mb-6">
      <div className="flex justify-end mb-4">
        <Select value={periodType} onValueChange={(value) => setPeriodType(value)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select period" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="day">Daily</SelectItem>
            <SelectItem value="week">Weekly</SelectItem>
            <SelectItem value="month">Monthly</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          title="Total Sales"
          subtitle={getDateRangeDescription()}
          value={isLoading ? "Loading..." : formatCurrency(totalSales || 0)}
          icon={<BanknoteIcon />}
        />
        <StatCard
          title="Transactions"
          subtitle={getDateRangeDescription()}
          value={isLoading ? "Loading..." : String(transactionCount || 0)}
          icon={<CalendarIcon />}
        />
        <StatCard
          title="Avg. Transaction"
          subtitle={getDateRangeDescription()}
          value={isLoading ? "Loading..." : formatCurrency(averageOrderValue || 0)}
          icon={<TrendingUp />}
        />
        <StatCard
          title="Trend"
          subtitle={getPeriodSubtitle(periodType)}
          value={isLoading ? "Loading..." : "0%"}
          icon={<TrendingUp />}
        />
      </div>
    </div>
  );
};

export default TransactionStats;
