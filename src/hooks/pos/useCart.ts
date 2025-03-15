import { useState } from "react";
import { formatTaxRulesFromSettings } from "@/utils/taxCalculator";
import { calculateTotalTax } from "@/utils/taxCalculator";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { CartItem, Product } from "./types/cartTypes";
import { prepareCartItem, updateCartWithNewItem, calculateSubtotal } from "./utils/cartUtils";
import { processTransaction as processTransactionUtil } from "./utils/transactionUtils";
import { loadTabItems } from "./utils/transactionUtils";
import { updateInventory } from "./utils/inventoryUtils";

export { type CartItem, type Product } from "./types/cartTypes";

export const useCart = (taxRate: number) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);

  const addToCart = async (product: Product, variantId?: string) => {
    try {
      const itemToAdd = await prepareCartItem(product, variantId);
      
      if (!itemToAdd) {
        return;
      }
      
      const updatedCart = updateCartWithNewItem(cartItems, itemToAdd);
      setCartItems(updatedCart);
      
      toast.success(`Added ${product.name} to cart`);
    } catch (error) {
      console.error("Error adding to cart:", error);
      toast.error("Failed to add item to cart");
    }
  };

  const updateItemQuantity = (index: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeItem(index);
    } else {
      const item = cartItems[index];
      
      if (item.variant_id && item.variant) {
        if (item.variant.stock_count !== null && newQuantity > item.variant.stock_count) {
          toast.error(`Only ${item.variant.stock_count} units available`);
          return;
        }
      } 
      else if (item.stock !== null && newQuantity > item.stock) {
        toast.error(`Only ${item.stock} units available`);
        return;
      }
      
      const updatedCart = [...cartItems];
      updatedCart[index].quantity = newQuantity;
      setCartItems(updatedCart);
    }
  };

  const removeItem = (index: number) => {
    const updatedCart = [...cartItems];
    updatedCart.splice(index, 1);
    setCartItems(updatedCart);
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const getSubtotal = () => {
    return calculateSubtotal(cartItems);
  };

  const getTaxAmount = () => {
    const taxRules = formatTaxRulesFromSettings([], taxRate);
    return calculateTotalTax(
      cartItems.map(item => ({
        price: item.price,
        quantity: item.quantity,
        category: item.category
      })),
      taxRules,
      taxRate
    );
  };

  const getTotal = () => {
    return getSubtotal() + getTaxAmount();
  };

  const processTransaction = async (paymentDetails: any) => {
    const result = await processTransactionUtil(
      cartItems,
      getSubtotal(),
      getTaxAmount(),
      getTotal(),
      selectedCustomer?.id || null,
      paymentDetails
    );
    
    return result;
  };

  const handleCheckoutTab = async (tabId: string) => {
    try {
      const { cartItems: tabItems, customerId } = await loadTabItems(tabId);
      
      setCartItems(tabItems);
      
      if (customerId) {
        const { data: customerData, error: customerError } = await supabase
          .from("customers")
          .select("*")
          .eq("id", customerId)
          .single();
          
        if (!customerError && customerData) {
          setSelectedCustomer(customerData);
        }
      }
    } catch (error) {
      console.error("Unexpected error loading tab:", error);
    }
  };

  return {
    cartItems,
    selectedCustomer,
    setSelectedCustomer,
    addToCart,
    updateItemQuantity,
    removeItem,
    clearCart,
    getSubtotal,
    getTaxAmount,
    getTotal,
    handleCheckoutTab,
    processTransaction
  };
};
