
import React, { useRef, useEffect, useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Mail } from "lucide-react";
import TransactionInvoice from "../TransactionInvoice";
import EmailDialog from "./EmailDialog";
import { useTransactionEmail } from "./useTransactionEmail";
import { Transaction } from "@/types/transaction";
import { supabase } from "@/integrations/supabase/client";
import { Customer } from "@/types";

interface TransactionDetailsSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transaction: Transaction | null;
}

const TransactionDetailsSheet: React.FC<TransactionDetailsSheetProps> = ({
  open,
  onOpenChange,
  transaction
}) => {
  const invoiceRef = useRef<HTMLDivElement>(null);
  const invoiceId = `invoice-${transaction?.id || 'preview'}`;
  const [customerDetails, setCustomerDetails] = useState<Customer | null>(null);
  
  const {
    isSendDialogOpen,
    setIsSendDialogOpen,
    selectedTransaction,
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

  // Fetch customer details from Supabase when transaction changes
  useEffect(() => {
    const fetchCustomerDetails = async () => {
      if (transaction?.customers?.id) {
        try {
          const { data, error } = await supabase
            .from('customers')
            .select('*')
            .eq('id', transaction.customers.id)
            .single();
          
          if (error) {
            console.error('Error fetching customer:', error);
            return;
          }
          
          setCustomerDetails(data);
        } catch (error) {
          console.error('Error fetching customer details:', error);
        }
      } else {
        setCustomerDetails(null);
      }
    };

    fetchCustomerDetails();
  }, [transaction]);

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="w-full sm:max-w-3xl overflow-y-auto theme-bg">
          <SheetHeader>
            <div className="flex justify-between items-center">
              <SheetTitle>Transaction Details</SheetTitle>
              {transaction && (
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="flex items-center gap-1"
                  onClick={() => handleEmailClick(transaction, customerDetails?.email)}
                >
                  <Mail className="h-4 w-4" />
                  Email Receipt
                </Button>
              )}
            </div>
            <SheetDescription>
              Transaction ID: {transaction?.id ? transaction.id.slice(0, 8) : ''}
            </SheetDescription>
          </SheetHeader>
          {transaction && (
            <div className="mt-6 space-y-6" id={invoiceId} ref={invoiceRef}>
              <TransactionInvoice 
                transaction={transaction}
                customerDetails={customerDetails}
              />
            </div>
          )}
        </SheetContent>
      </Sheet>

      <EmailDialog
        open={isSendDialogOpen}
        onOpenChange={setIsSendDialogOpen}
        transaction={selectedTransaction}
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
  );
};

export default TransactionDetailsSheet;
