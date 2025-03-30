
import React, { useState } from "react";
import { Transaction } from "@/types/transaction";

// Import refactored components
import TransactionTable from "./transaction/TransactionTable";
import RefundDialog from "./transaction/RefundDialog";
import TransactionDetailsSheet from "./transaction/TransactionDetailsSheet";
import TransactionPagination from "./transaction/TransactionPagination";
import EmailDialog from "./transaction/EmailDialog";
import TransactionInvoice from "./TransactionInvoice";
import { useTransactionRefund } from "./transaction/useTransactionRefund";
import { useTransactionEmail } from "./transaction/useTransactionEmail";

interface ClientTransactionHistoryProps {
  transactions: Transaction[];
  pagination: {
    page: number;
    pageSize: number;
    totalPages: number;
    totalCount: number;
  };
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  loading: boolean;
}

const ClientTransactionHistory: React.FC<ClientTransactionHistoryProps> = ({
  transactions,
  pagination,
  onPageChange,
  onPageSizeChange,
  loading
}) => {
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedTransactionForDetails, setSelectedTransactionForDetails] = useState<Transaction | null>(null);
  
  const {
    isRefundDialogOpen,
    setIsRefundDialogOpen,
    selectedTransaction: selectedTransactionForRefund,
    refundAmount,
    setRefundAmount,
    isProcessingRefund,
    handleRefundClick,
    handleProcessRefund
  } = useTransactionRefund();

  const {
    isSendDialogOpen,
    setIsSendDialogOpen,
    selectedTransaction: selectedTransactionForEmail,
    emailRecipient,
    setEmailRecipient,
    emailSubject,
    setEmailSubject,
    emailMessage,
    setEmailMessage,
    isSendingEmail,
    handleEmailClick,
    handleSendEmail
  } = useTransactionEmail();

  const handleViewDetails = (transaction: Transaction) => {
    setSelectedTransactionForDetails(transaction);
    setIsDetailsOpen(true);
  };

  // Using an ID for the invoice to be captured for email
  const invoiceId = `transaction-invoice-preview`;

  return (
    <div className="space-y-4">
      {loading ? (
        <div className="text-center py-8">
          <div className="animate-pulse">Loading transactions...</div>
        </div>
      ) : transactions.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          No transactions found for this client.
        </div>
      ) : (
        <>
          <TransactionTable 
            transactions={transactions}
            onViewDetails={handleViewDetails}
            onRefund={handleRefundClick}
            onEmail={handleEmailClick}
          />
          
          <TransactionDetailsSheet 
            open={isDetailsOpen}
            onOpenChange={setIsDetailsOpen}
            transaction={selectedTransactionForDetails}
          />
          
          <TransactionPagination 
            {...pagination}
            onPageChange={onPageChange}
            onPageSizeChange={onPageSizeChange}
          />
          
          <RefundDialog 
            open={isRefundDialogOpen}
            onOpenChange={setIsRefundDialogOpen}
            transaction={selectedTransactionForRefund}
            refundAmount={refundAmount}
            onRefundAmountChange={setRefundAmount}
            onProcessRefund={handleProcessRefund}
            isProcessing={isProcessingRefund}
          />

          <div id={invoiceId} style={{ display: 'none' }}>
            {selectedTransactionForEmail && (
              <TransactionInvoice transaction={selectedTransactionForEmail} />
            )}
          </div>

          <EmailDialog
            open={isSendDialogOpen}
            onOpenChange={setIsSendDialogOpen}
            transaction={selectedTransactionForEmail}
            recipientEmail={emailRecipient}
            onRecipientEmailChange={setEmailRecipient}
            emailSubject={emailSubject}
            onEmailSubjectChange={setEmailSubject}
            emailMessage={emailMessage}
            onEmailMessageChange={setEmailMessage}
            onSendEmail={() => handleSendEmail(invoiceId)}
            isSending={isSendingEmail}
          />
        </>
      )}
    </div>
  );
};

export default ClientTransactionHistory;
