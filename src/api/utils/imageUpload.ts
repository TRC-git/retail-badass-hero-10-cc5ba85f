
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

/**
 * Uploads an image file to Supabase storage and returns the public URL
 * @param file The file to upload
 * @param bucket The storage bucket name (default: 'product-images')
 * @returns The public URL of the uploaded file, or null if the upload failed
 */
export const uploadImage = async (
  file: File, 
  bucket: string = 'product-images'
): Promise<string | null> => {
  try {
    if (!file) {
      throw new Error('No file provided');
    }
    
    // Generate a unique file path
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
    const filePath = `${fileName}.${fileExt}`;
    
    // Upload the file
    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(filePath, file);
      
    if (uploadError) {
      console.error('Error uploading image:', uploadError);
      throw uploadError;
    }
    
    // Get the public URL
    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);
      
    return publicUrl;
  } catch (error) {
    console.error('Image upload failed:', error);
    toast.error('Failed to upload image');
    return null;
  }
};

/**
 * Deletes an image from Supabase storage by URL
 * @param url The public URL of the image to delete
 * @param bucket The storage bucket name (default: 'product-images')
 * @returns True if deletion was successful, false otherwise
 */
export const deleteImage = async (
  url: string,
  bucket: string = 'product-images'
): Promise<boolean> => {
  try {
    if (!url) return false;
    
    // Extract the file path from the URL
    const urlParts = url.split('/');
    const fileName = urlParts[urlParts.length - 1];
    
    // Delete the file
    const { error } = await supabase.storage
      .from(bucket)
      .remove([fileName]);
      
    if (error) {
      console.error('Error deleting image:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Image deletion failed:', error);
    return false;
  }
};
