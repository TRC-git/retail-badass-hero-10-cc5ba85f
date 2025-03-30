
import { useState } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useTransactionEmail = () => {
  const [isSendDialogOpen, setIsSendDialogOpen] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [emailRecipient, setEmailRecipient] = useState('');
  const [emailSubject, setEmailSubject] = useState('');
  const [emailMessage, setEmailMessage] = useState('Thank you for your business. Please find your receipt attached.');

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
    sendInvoice
  };
};
