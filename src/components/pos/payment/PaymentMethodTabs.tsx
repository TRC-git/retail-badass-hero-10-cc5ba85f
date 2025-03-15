
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CashPayment } from "../payment-methods/CashPayment";
import { CardPayment } from "../payment-methods/CardPayment";
import { CheckPayment } from "../payment-methods/CheckPayment";
import { TabPayment } from "../payment-methods/TabPayment";
import { GiftCardPayment } from "../GiftCardPayment";
import { PaymentMethod } from "./types/paymentTypes";

interface PaymentMethodTabsProps {
  paymentMethod: PaymentMethod;
  setPaymentMethod: (method: PaymentMethod) => void;
  amountTendered: string;
  setAmountTendered: (amount: string) => void;
  total: number;
  handleNumpadInput: (value: string) => void;
  cardNumber: string;
  setCardNumber: (value: string) => void;
  cardExpiryMonth: string;
  setCardExpiryMonth: (value: string) => void;
  cardExpiryYear: string;
  setCardExpiryYear: (value: string) => void;
  cardCVC: string;
  setCardCVC: (value: string) => void;
  checkNumber: string;
  setCheckNumber: (value: string) => void;
  storeName: string;
  customer: any;
  onGiftCardPaymentComplete: (cardCode: string) => void;
}

export function PaymentMethodTabs({
  paymentMethod,
  setPaymentMethod,
  amountTendered,
  setAmountTendered,
  total,
  handleNumpadInput,
  cardNumber,
  setCardNumber,
  cardExpiryMonth,
  setCardExpiryMonth,
  cardExpiryYear,
  setCardExpiryYear,
  cardCVC,
  setCardCVC,
  checkNumber,
  setCheckNumber,
  storeName,
  customer,
  onGiftCardPaymentComplete,
}: PaymentMethodTabsProps) {
  return (
    <Tabs 
      defaultValue="cash" 
      className="w-full" 
      value={paymentMethod} 
      onValueChange={(value) => setPaymentMethod(value as PaymentMethod)}
    >
      <TabsList className="grid w-full grid-cols-5">
        <TabsTrigger value="cash">Cash</TabsTrigger>
        <TabsTrigger value="card">Card</TabsTrigger>
        <TabsTrigger value="check">Check</TabsTrigger>
        <TabsTrigger value="gift_card">Gift Card</TabsTrigger>
        <TabsTrigger 
          value="tab" 
          disabled={!customer}
        >
          Tab
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="cash" className="mt-4">
        <CashPayment 
          amountTendered={amountTendered}
          setAmountTendered={setAmountTendered}
          total={total}
          handleNumpadInput={handleNumpadInput}
        />
      </TabsContent>
      
      <TabsContent value="card" className="mt-4">
        <CardPayment 
          cardNumber={cardNumber}
          setCardNumber={setCardNumber}
          cardExpiryMonth={cardExpiryMonth}
          setCardExpiryMonth={setCardExpiryMonth}
          cardExpiryYear={cardExpiryYear}
          setCardExpiryYear={setCardExpiryYear}
          cardCVC={cardCVC}
          setCardCVC={setCardCVC}
        />
      </TabsContent>
      
      <TabsContent value="check" className="mt-4">
        <CheckPayment 
          checkNumber={checkNumber}
          setCheckNumber={setCheckNumber}
          total={total}
          storeName={storeName}
        />
      </TabsContent>
      
      <TabsContent value="gift_card" className="mt-4">
        <GiftCardPayment 
          total={total}
          onPaymentComplete={(cardCode) => onGiftCardPaymentComplete(cardCode)}
        />
      </TabsContent>
      
      <TabsContent value="tab" className="mt-4">
        <TabPayment customer={customer} />
      </TabsContent>
    </Tabs>
  );
}
