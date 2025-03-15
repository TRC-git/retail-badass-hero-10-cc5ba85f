
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Product } from '@/types';
import { ProductFormData } from './types';
import { fetchCategories } from '@/api/inventoryApi';
import { fetchProductById, createProduct, updateProduct } from '@/api/productApi';

interface UseProductFormProps {
  product?: Product;
  productId?: string;
  onClose: () => void;
  onSave?: () => void;
}

const useProductForm = ({ product, productId, onClose, onSave }: UseProductFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [categories, setCategories] = useState<{ id: string; name: string; }[]>([]);
  const [showVariantsManager, setShowVariantsManager] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null);
  
  // Initialize form with useForm
  const form = useForm<ProductFormData>({
    defaultValues: {
      name: '',
      description: '',
      price: undefined,
      cost: undefined,
      stock: undefined,
      sku: '',
      barcode: '',
      image_url: '',
      category: '',
      category_id: '',
      has_variants: false,
    }
  });

  useEffect(() => {
    const fetchCategoriesData = async () => {
      try {
        const categoriesData = await fetchCategories();
        setCategories(categoriesData);
      } catch (error) {
        console.error('Error fetching categories:', error);
        toast.error('Failed to load categories');
      }
    };

    fetchCategoriesData();
  }, []);

  useEffect(() => {
    if (product) {
      console.log('Setting form data from product', product);
      setIsEditing(true);
      setCurrentProduct(product);
      form.reset({
        name: product.name || '',
        description: product.description || '',
        price: product.price,
        cost: product.cost || undefined,
        stock: product.stock || undefined,
        sku: product.sku || '',
        barcode: product.barcode || '',
        image_url: product.image_url || '',
        category: product.category || '',
        category_id: product.category_id || '',
        has_variants: product.has_variants || false,
      });
    } else if (productId) {
      setIsEditing(true);
      const fetchProductDetails = async () => {
        try {
          const productData = await fetchProductById(productId);
          if (productData) {
            console.log('Fetched product details', productData);
            setCurrentProduct(productData);
            form.reset({
              name: productData.name,
              description: productData.description || '',
              price: productData.price,
              cost: productData.cost || undefined,
              stock: productData.stock || undefined,
              sku: productData.sku || '',
              barcode: productData.barcode || '',
              image_url: productData.image_url || '',
              category: productData.category || '',
              category_id: productData.category_id || '',
              has_variants: productData.has_variants || false,
            });
          } else {
            throw new Error("Product not found");
          }
        } catch (error) {
          console.error("Could not fetch product details", error);
          toast.error("Failed to load product details");
        }
      };

      fetchProductDetails();
    }
  }, [product, productId, form]);

  const onSubmit = async (data: ProductFormData) => {
    if (!data.name) {
      toast.error("Product name is required");
      return;
    }
  
    if (data.price === undefined || isNaN(Number(data.price))) {
      toast.error("Valid product price is required");
      return;
    }
  
    try {
      setIsSubmitting(true);
      console.log('Submitting product data:', data);
    
      const productData = {
        name: data.name,
        description: data.description,
        price: Number(data.price),
        cost: data.cost !== undefined ? Number(data.cost) : undefined,
        stock: data.stock !== undefined ? Number(data.stock) : undefined,
        sku: data.sku,
        barcode: data.barcode,
        image_url: data.image_url,
        category_id: data.category_id,
        category: data.category,
        has_variants: Boolean(data.has_variants)
      };
    
      let savedProduct: Product | null = null;
      
      if (isEditing && (productId || (product && product.id))) {
        console.log('Updating product:', productId || product?.id);
        savedProduct = await updateProduct(productId || (product?.id as string), productData);
        setCurrentProduct(savedProduct);
      } else {
        console.log('Creating new product');
        savedProduct = await createProduct(productData);
        setCurrentProduct(savedProduct);
        
        // If the product has variants, show the variants manager immediately
        if (data.has_variants && savedProduct) {
          setShowVariantsManager(true);
          return; // Don't close the form yet
        }
      }
    
      if (onSave) onSave();
      if (!data.has_variants) {
        onClose(); // Only close if it's not a variant product or if we're editing
      }
    
    } catch (error) {
      console.error('Error saving product:', error);
      toast.error('Failed to save product');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVariantManagerClose = () => {
    setShowVariantsManager(false);
    if (onSave) onSave();
    onClose();
  };

  return {
    form,
    isSubmitting,
    isEditing,
    categories,
    showVariantsManager,
    currentProduct,
    onSubmit,
    setShowVariantsManager,
    handleVariantManagerClose
  };
};

export default useProductForm;
