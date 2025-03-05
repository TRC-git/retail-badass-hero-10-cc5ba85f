
import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/utils/formatters";

interface Transaction {
  id: string;
  customer: string;
  amount: number;
  items: number;
  date: Date;
}

interface RecentTransactionsTableProps {
  transactions: Transaction[] | undefined;
  isLoading: boolean;
}

const RecentTransactionsTable: React.FC<RecentTransactionsTableProps> = ({ 
  transactions, 
  isLoading 
}) => {
  const navigate = useNavigate();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Transactions</CardTitle>
        <CardDescription>Latest sales activity</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="flex items-center justify-center h-24">
              <p className="text-muted-foreground">Loading transactions...</p>
            </div>
          ) : transactions && transactions.length > 0 ? (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left font-medium py-2 px-4">ID</th>
                  <th className="text-left font-medium py-2 px-4">Customer</th>
                  <th className="text-left font-medium py-2 px-4">Items</th>
                  <th className="text-left font-medium py-2 px-4">Amount</th>
                  <th className="text-left font-medium py-2 px-4">Time</th>
                  <th className="text-left font-medium py-2 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((transaction) => (
                  <tr key={transaction.id} className="border-b hover:bg-muted/50">
                    <td className="py-3 px-4">{transaction.id.substring(0, 8)}</td>
                    <td className="py-3 px-4">{transaction.customer}</td>
                    <td className="py-3 px-4">{transaction.items}</td>
                    <td className="py-3 px-4">{formatCurrency(transaction.amount)}</td>
                    <td className="py-3 px-4">
                      {transaction.date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="py-3 px-4">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => navigate(`/transactions?id=${transaction.id}`)}
                      >
                        View
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-center py-4">
              <p className="text-muted-foreground">No recent transactions</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default RecentTransactionsTable;
