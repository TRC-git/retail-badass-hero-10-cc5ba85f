import { supabase } from "@/integrations/supabase/client";
import { Product, ProductUpdate } from "../types/productTypes";
import { cleanProductData } from "../utils/dataCleaners";
import { toast } from "sonner";

// Update an existing product
export const updateProduct = async (id: string, updates: ProductUpdate): Promise<Product | null> => {
  try {
    console.log("Updating product ID:", id, "with data:", updates);
    
    // Clean up the product data before sending to Supabase
    const productData = cleanProductData(updates as any);
    
    // If we're updating a product, we need to ensure we're not sending empty required fields
    if (Object.keys(productData).length === 0) {
      console.log("No valid product data to update");
      return null;
    }
    
    // First fetch the current product if we need name or price
    if (('name' in updates && updates.name === undefined) || ('price' in updates && updates.price === undefined)) {
      const { data: currentProduct, error: fetchError } = await supabase
        .from("products")
        .select("name, price, image_url")
        .eq("id", id)
        .single();
      
      if (fetchError) {
        console.error("Supabase error fetching current product:", fetchError);
        throw fetchError;
      }
      
      // Merge the current values for required fields if they're not provided
      if ('name' in updates && updates.name === undefined) {
        productData.name = currentProduct.name;
      }
      
      if ('price' in updates && updates.price === undefined) {
        productData.price = currentProduct.price;
      }
      
      // Keep existing image_url if not provided in update
      if (!updates.image_url && currentProduct.image_url) {
        productData.image_url = currentProduct.image_url;
      }
    }
    
    console.log("Cleaned product data for update:", productData);
    
    const { data, error } = await supabase
      .from("products")
      .update(productData)
      .eq("id", id)
      .select()
      .single();
      
    if (error) {
      console.error("Supabase error updating product:", error);
      throw error;
    }
    
    console.log("Product updated successfully:", data);
    toast.success("Product updated successfully");
    return data;
  } catch (error) {
    console.error("Error updating product:", error);
    toast.error(`Failed to update product: ${error instanceof Error ? error.message : "Unknown error"}`);
    return null;
  }
};

// Inventory adjustment for products
export const adjustProductStock = async (id: string, stock: number): Promise<boolean> => {
  try {
    console.log("Adjusting product stock, ID:", id, "new stock:", stock);
    
    const { error } = await supabase
      .from("products")
      .update({ stock, updated_at: new Date().toISOString() })
      .eq("id", id);
      
    if (error) {
      console.error("Supabase error adjusting product stock:", error);
      throw error;
    }
    
    console.log("Product stock updated successfully");
    toast.success("Inventory updated successfully");
    return true;
  } catch (error) {
    console.error("Error adjusting inventory:", error);
    toast.error(`Failed to update inventory: ${error instanceof Error ? error.message : "Unknown error"}`);
    return false;
  }
};
