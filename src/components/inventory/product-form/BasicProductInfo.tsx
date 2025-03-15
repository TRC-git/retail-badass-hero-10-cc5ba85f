
import React, { useState, useEffect } from 'react';
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { UseFormReturn } from 'react-hook-form';
import { ImageIcon, UploadCloud } from 'lucide-react';
import { ProductFormData } from './types';
import { Button } from '@/components/ui/button';
import { uploadImage, deleteImage } from '@/api/utils/imageUpload';
import { toast } from 'sonner';

interface BasicProductInfoProps {
  form: UseFormReturn<ProductFormData>;
}

const BasicProductInfo: React.FC<BasicProductInfoProps> = ({ form }) => {
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  
  // Initialize preview from form values when component mounts or form changes
  useEffect(() => {
    const currentImageUrl = form.getValues('image_url');
    if (currentImageUrl) {
      setPreviewUrl(currentImageUrl);
    }
  }, [form]);

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      if (!event.target.files || event.target.files.length === 0) {
        return;
      }
      
      const file = event.target.files[0];
      setUploading(true);
      
      // Use the dedicated image upload utility
      const imageUrl = await uploadImage(file);
      
      if (imageUrl) {
        // If there's an existing image, delete it first
        const currentImageUrl = form.getValues('image_url');
        if (currentImageUrl) {
          await deleteImage(currentImageUrl);
        }
        
        // Update the form with the new image URL
        form.setValue('image_url', imageUrl);
        setPreviewUrl(imageUrl);
        toast.success('Image uploaded successfully');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Error uploading image');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Product Name</FormLabel>
            <FormControl>
              <Input placeholder="Enter product name" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="image_url"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Product Image</FormLabel>
            <FormControl>
              <div className="space-y-4">
                {previewUrl ? (
                  <div className="relative w-full h-40 bg-muted rounded-md overflow-hidden">
                    <img 
                      src={previewUrl} 
                      alt="Product preview" 
                      className="w-full h-full object-contain"
                    />
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      className="absolute bottom-2 right-2"
                      onClick={() => {
                        setPreviewUrl(null);
                        form.setValue('image_url', '');
                      }}
                    >
                      Remove
                    </Button>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-muted-foreground/25 rounded-md p-6 flex flex-col items-center justify-center">
                    <UploadCloud className="h-10 w-10 text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground mb-2">Drag and drop or click to upload</p>
                    <Input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      id="product-image-upload"
                      onChange={handleImageUpload}
                      disabled={uploading}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => document.getElementById('product-image-upload')?.click()}
                      disabled={uploading}
                    >
                      {uploading ? 'Uploading...' : 'Select Image'}
                    </Button>
                  </div>
                )}
                <div className="relative">
                  <ImageIcon className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input 
                    placeholder="Or enter image URL" 
                    className="pl-10" 
                    {...field} 
                    onChange={(e) => {
                      field.onChange(e);
                      setPreviewUrl(e.target.value);
                    }}
                  />
                </div>
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="description"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Description</FormLabel>
            <FormControl>
              <Textarea 
                placeholder="Enter product description" 
                className="min-h-[120px]" 
                {...field} 
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};

export default BasicProductInfo;
