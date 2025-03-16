
import React, { useEffect } from "react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Product } from "@/types";
import ProductForm from "../ProductForm";
import { ProductVariantsManager } from "../ProductVariantsManager";

interface ProductModalsProps {
  selectedProduct: Product | null;
  showAddForm: boolean;
  showEditForm: boolean;
  showVariantsManager: boolean;
  setShowAddForm: (show: boolean) => void;
  setShowEditForm: (show: boolean) => void;
  setShowVariantsManager: (show: boolean) => void;
  setSelectedProduct: (product: Product | null) => void;
  refreshProducts: () => void;
}

const ProductModals: React.FC<ProductModalsProps> = ({
  selectedProduct,
  showAddForm,
  showEditForm,
  showVariantsManager,
  setShowAddForm,
  setShowEditForm,
  setShowVariantsManager,
  setSelectedProduct,
  refreshProducts
}) => {
  // Debug log when props change to help diagnose issues
  useEffect(() => {
    console.log("ProductModals received props:", {
      showAddForm,
      showEditForm,
      showVariantsManager,
      selectedProduct: selectedProduct?.name
    });
  }, [showAddForm, showEditForm, showVariantsManager, selectedProduct]);

  const handleFormClose = () => {
    console.log("Closing form dialog");
    setShowAddForm(false);
    setShowEditForm(false);
    setSelectedProduct(null);
    refreshProducts();
  };

  const handleVariantsClose = () => {
    setShowVariantsManager(false);
    setSelectedProduct(null);
    refreshProducts();
  };

  return (
    <>
      {/* Dialog for adding products */}
      <Dialog 
        open={showAddForm} 
        onOpenChange={(open) => {
          console.log("Add dialog onOpenChange called with:", open);
          if (!open) {
            setSelectedProduct(null);
          }
          setShowAddForm(open);
        }}
      >
        <DialogContent className="max-w-7xl max-h-[85vh] bg-background overflow-y-auto custom-scrollbar">
          <DialogTitle>Add New Product</DialogTitle>
          <DialogDescription>
            Fill out the form below to add a new product to your inventory.
          </DialogDescription>
          {showAddForm && (
            <ProductForm 
              onClose={handleFormClose} 
              onSave={refreshProducts} 
              threeColumns={true} 
            />
          )}
        </DialogContent>
      </Dialog>
      
      {/* Dialog for editing products */}
      <Dialog 
        open={showEditForm} 
        onOpenChange={(open) => {
          console.log("Edit dialog onOpenChange called with:", open);
          if (!open) {
            setSelectedProduct(null);
          }
          setShowEditForm(open);
        }}
      >
        <DialogContent className="max-w-7xl max-h-[85vh] bg-background overflow-y-auto custom-scrollbar">
          <DialogTitle>Edit Product</DialogTitle>
          <DialogDescription>
            Update product information below.
          </DialogDescription>
          {showEditForm && selectedProduct && (
            <ProductForm 
              product={selectedProduct} 
              onClose={handleFormClose} 
              onSave={refreshProducts} 
              threeColumns={true} 
            />
          )}
        </DialogContent>
      </Dialog>
      
      {/* Dialog for managing variants */}
      <Dialog 
        open={showVariantsManager} 
        onOpenChange={(open) => {
          console.log("Variants dialog onOpenChange called with:", open);
          if (!open) {
            setSelectedProduct(null);
          }
          setShowVariantsManager(open);
        }}
      >
        <DialogContent className="sm:max-w-[800px] max-h-[90vh]">
          <DialogTitle>Manage Product Variants</DialogTitle>
          <DialogDescription>
            Create and manage variants for this product.
          </DialogDescription>
          {showVariantsManager && selectedProduct && (
            <ProductVariantsManager 
              product={selectedProduct} 
              onClose={handleVariantsClose} 
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ProductModals;
