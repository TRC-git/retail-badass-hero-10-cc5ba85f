
import React from "react";
import { Button } from "@/components/ui/button";
import { PaymentMethod } from "./types/paymentTypes";

interface PaymentActionsProps {
  onCancel: () => void;
  onPayment: () => void;
  processing: boolean;
  paymentMethod: PaymentMethod;
}

export function PaymentActions({ 
  onCancel, 
  onPayment, 
  processing, 
  paymentMethod 
}: PaymentActionsProps) {
  const getButtonText = () => {
    switch(paymentMethod) {
      case "cash":
        return "Complete Cash Payment";
      case "card":
        return "Process Card Payment";
      case "check":
        return "Accept Check";
      case "tab":
        return "Add to Customer Tab";
      case "gift_card":
        return "Apply Gift Card";
      default:
        return "Complete Payment";
    }
  };

  return (
    <div className="flex justify-end gap-2 w-full">
      <Button variant="outline" onClick={onCancel} disabled={processing}>
        Cancel
      </Button>
      <Button 
        onClick={onPayment} 
        disabled={processing}
        className="min-w-[180px]"
      >
        {processing ? "Processing..." : getButtonText()}
      </Button>
    </div>
  );
}
