
import { supabase } from "@/integrations/supabase/client";
import { CartItem } from "../types/cartTypes";
import { Json } from "@/integrations/supabase/types";
import { checkStockAvailability, updateInventory } from "./inventoryUtils";
import { toast } from "@/components/ui/use-toast";

// Create a transaction record
export const createTransaction = async (
  cartItems: CartItem[],
  subtotal: number,
  tax: number,
  total: number,
  customerId: string | null,
  paymentMethod: string
): Promise<any> => {
  try {
    // Create transaction data
    const transactionData = {
      customer_id: customerId,
      subtotal: subtotal,
      tax: tax,
      total: total,
      items: cartItems as unknown as Json, // Type assertion to match Supabase's Json type
      status: 'completed',
      payment_method: paymentMethod,
      cashier_id: null, // You would get this from auth context
      completed_at: new Date().toISOString()
    };
    
    const { data, error } = await supabase
      .from('transactions')
      .insert(transactionData)
      .select()
      .single();
      
    if (error) {
      console.error('Error creating transaction:', error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Error creating transaction:', error);
    return null;
  }
};

// Process a complete transaction
export const processTransaction = async (
  cartItems: CartItem[],
  subtotal: number,
  tax: number,
  total: number,
  customerId: string | null,
  paymentDetails: any
): Promise<boolean> => {
  try {
    // First, check stock availability for all items
    const stockAvailable = await checkStockAvailability(cartItems);
    if (!stockAvailable) {
      toast.error('Some items in your cart are out of stock');
      return false;
    }
    
    // Create transaction record
    const transaction = await createTransaction(
      cartItems,
      subtotal,
      tax,
      total,
      customerId,
      paymentDetails.method
    );
    
    if (!transaction) {
      toast.error('Failed to create transaction');
      return false;
    }
    
    // Update inventory
    const inventoryUpdated = await updateInventory(cartItems);
    if (!inventoryUpdated) {
      toast.error('Failed to update inventory');
      return false;
    }
    
    toast.success('Transaction completed successfully');
    return true;
  } catch (error) {
    console.error('Error processing transaction:', error);
    toast.error('Failed to process transaction');
    return false;
  }
};

// Load tab items from a saved transaction
export const loadTabItems = async (tabId: string): Promise<{ cartItems: CartItem[], customerId: string | null }> => {
  try {
    // Fetch the tab items from Supabase
    const { data, error } = await supabase
      .from("transactions")
      .select("items, customer_id")
      .eq("id", tabId)
      .single();
      
    if (error) {
      console.error("Error fetching tab:", error);
      return { cartItems: [], customerId: null };
    }
    
    // Load tab items into cart with proper type checking
    let validCartItems: CartItem[] = [];
    
    if (data.items && Array.isArray(data.items)) {
      // Filter valid cart items
      validCartItems = data.items
        .filter(isValidCartItem)
        .map(item => {
          // We've already validated this is an object with the right properties
          const validItem = item as Record<string, Json>;
          
          // Safe type conversion with all required properties
          return {
            id: String(validItem.id),
            name: String(validItem.name),
            price: Number(validItem.price),
            quantity: Number(validItem.quantity),
            category: 'category' in validItem ? String(validItem.category) : null,
            image_url: 'image_url' in validItem ? String(validItem.image_url) : null,
            stock: 'stock' in validItem ? Number(validItem.stock) : null,
            description: 'description' in validItem ? String(validItem.description) : null,
            variant_id: 'variant_id' in validItem ? String(validItem.variant_id) : undefined,
            variant: 'variant' in validItem ? validItem.variant as any : null
          } as CartItem;
        });
    }
    
    return { cartItems: validCartItems, customerId: data.customer_id };
  } catch (error) {
    console.error("Unexpected error loading tab:", error);
    return { cartItems: [], customerId: null };
  }
};

// Helper to check if a JSON item is a valid cart item
const isValidCartItem = (item: Json): boolean => {
  return (
    typeof item === 'object' && 
    item !== null && 
    'id' in item && 
    typeof item.id === 'string' &&
    'name' in item && 
    typeof item.name === 'string' &&
    'price' in item && 
    typeof item.price === 'number' &&
    'quantity' in item &&
    typeof item.quantity === 'number'
  );
};
