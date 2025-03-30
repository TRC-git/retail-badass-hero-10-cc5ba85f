
import { useState } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Transaction } from "@/types/transaction";
import html2canvas from 'html2canvas';
import JsPDF from 'jspdf';

export const useTransactionEmail = () => {
  const [isSendDialogOpen, setIsSendDialogOpen] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [emailRecipient, setEmailRecipient] = useState('');
  const [emailSubject, setEmailSubject] = useState('');
  const [emailMessage, setEmailMessage] = useState('Thank you for your business. Please find your receipt attached.');
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

  const initializeEmailData = (recipientEmail: string, subject: string) => {
    setEmailRecipient(recipientEmail || '');
    setEmailSubject(subject || '');
  };

  const handleRecipientChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmailRecipient(e.target.value);
  };

  const handleSubjectChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmailSubject(e.target.value);
  };

  const handleMessageChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setEmailMessage(e.target.value);
  };

  const handleEmailClick = (transaction: Transaction, customerEmail?: string) => {
    setSelectedTransaction(transaction);
    setEmailRecipient(customerEmail || transaction.customers?.email || '');
    setEmailSubject(`Receipt from Transaction #${transaction.id.slice(0, 8)}`);
    setIsSendDialogOpen(true);
  };

  const handleSendEmail = async (invoiceElementId: string) => {
    const invoiceElement = document.getElementById(invoiceElementId);
    if (!invoiceElement || !emailRecipient) {
      toast.error('Failed to generate PDF or missing recipient email');
      return;
    }

    setIsSending(true);
    
    try {
      // Generate PDF using html2canvas and jsPDF
      const canvas = await html2canvas(invoiceElement, {
        scale: 2,
        useCORS: true,
        logging: false
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new JsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: [canvas.width, canvas.height]
      });
      
      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
      // Fix: Ensure we're getting a string, not a number array
      const pdfBase64 = pdf.output('datauristring').split(',')[1];

      await sendInvoice(pdfBase64, 'Store Name');
    } catch (error) {
      console.error('Error generating or sending PDF:', error);
      toast.error('Failed to send receipt. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  const sendInvoice = async (pdfBase64: string | null, storeName: string) => {
    if (!pdfBase64 || !emailRecipient) {
      toast.error('Failed to generate PDF or missing recipient email');
      return false;
    }
    
    setIsSending(true);
    
    try {
      // Send email with PDF attachment using Supabase Edge Function
      const { data, error } = await supabase.functions.invoke('send-invoice', {
        body: {
          pdfBase64,
          recipientEmail: emailRecipient,
          subject: emailSubject,
          message: emailMessage,
          storeName
        }
      });
      
      if (error) throw error;
      
      setIsSendDialogOpen(false);
      toast.success('Invoice sent successfully');
      return true;
    } catch (error) {
      console.error('Error sending invoice:', error);
      toast.error('Failed to send invoice. Please try again.');
      return false;
    } finally {
      setIsSending(false);
    }
  };

  return {
    isSendDialogOpen,
    setIsSendDialogOpen,
    isSending,
    emailRecipient,
    emailSubject,
    emailMessage,
    handleRecipientChange,
    handleSubjectChange,
    handleMessageChange,
    initializeEmailData,
    sendInvoice,
    selectedTransaction,
    setSelectedTransaction,
    setEmailRecipient,
    setEmailSubject,
    setEmailMessage,
    handleEmailClick,
    handleSendEmail,
    isSendingEmail: isSending // Alias for backward compatibility
  };
};
