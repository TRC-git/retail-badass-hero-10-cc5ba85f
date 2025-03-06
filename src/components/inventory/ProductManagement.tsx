
import React, { useState, useCallback } from "react";
import { useProducts } from "@/contexts/ProductContext";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { deleteProduct } from "@/api/productApi";
import { toast } from "sonner";
import ProductForm from "./ProductForm";
import ProductVariantsManager from "./ProductVariantsManager";
import ProductTable from "./products/ProductTable";
import ProductSearch from "./products/ProductSearch";
import ProductHeader from "./products/ProductHeader";

const ProductManagement = () => {
  const {
    products,
    loading,
    refreshProducts,
    selectedProduct,
    setSelectedProduct
  } = useProducts();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showVariantsManager, setShowVariantsManager] = useState(false);

  // Filter products based on search term
  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (product.sku && product.sku.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (product.barcode && product.barcode.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (product.description && product.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Use useCallback to ensure the handler doesn't change between renders
  const handleAddProduct = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    // Ensure we capture and cancel the event completely
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    console.log("handleAddProduct called in ProductManagement");
    
    // First set selected product to null, then open the form
    setSelectedProduct(null);
    
    // Explicitly set dialog state
    setShowAddForm(true);
    console.log("Set showAddForm to true:", showAddForm);
  }, [setSelectedProduct]);

  const handleEditProduct = useCallback((product: any, e?: React.MouseEvent) => {
    // Stop event propagation
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    console.log("handleEditProduct called in ProductManagement for:", product.name);
    
    // Set the selected product first, then show the form
    setSelectedProduct(product);
    
    // Open the edit form modal
    setShowEditForm(true);
    console.log("Set showEditForm to true");
  }, [setSelectedProduct]);

  const handleManageVariants = useCallback((product: any, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setSelectedProduct(product);
    setShowVariantsManager(true);
    return false;
  }, [setSelectedProduct]);

  const handleDeleteProduct = async (id: string) => {
    try {
      const success = await deleteProduct(id);
      if (success) {
        toast.success("Product deleted successfully");
        refreshProducts();
      } else {
        toast.error("Failed to delete product");
      }
    } catch (error) {
      console.error("Error deleting product:", error);
      toast.error("An error occurred while deleting the product");
    }
  };

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

  console.log("Current add form dialog state:", showAddForm);

  return (
    <div className="space-y-4">
      <ProductHeader 
        handleAddProduct={handleAddProduct} 
        refreshProducts={refreshProducts} 
      />

      <ProductSearch 
        searchTerm={searchTerm} 
        setSearchTerm={setSearchTerm} 
      />

      <Card>
        <CardContent className="p-0">
          <ProductTable 
            products={filteredProducts}
            loading={loading}
            handleEditProduct={handleEditProduct}
            handleManageVariants={handleManageVariants}
            handleDeleteProduct={handleDeleteProduct}
          />
        </CardContent>
      </Card>

      {/* Dialog for adding products */}
      <Dialog 
        open={showAddForm} 
        onOpenChange={(open) => {
          console.log("Add dialog open state changing to:", open);
          // If dialog is closing
          if (!open) {
            setShowAddForm(false);
            setSelectedProduct(null);
          }
        }}
      >
        <DialogContent className="max-w-7xl max-h-[85vh] bg-background overflow-y-auto custom-scrollbar">
          <DialogTitle>Add New Product</DialogTitle>
          <ProductForm onClose={handleFormClose} onSave={refreshProducts} threeColumns={true} />
        </DialogContent>
      </Dialog>
      
      {/* Dialog for editing products */}
      <Dialog 
        open={showEditForm} 
        onOpenChange={(open) => {
          console.log("Edit dialog open state changing to:", open);
          // If dialog is closing
          if (!open) {
            setShowEditForm(false);
            setSelectedProduct(null);
          }
        }}
      >
        <DialogContent className="max-w-7xl max-h-[85vh] bg-background overflow-y-auto custom-scrollbar">
          <DialogTitle>Edit Product</DialogTitle>
          {selectedProduct && (
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
      {showVariantsManager && selectedProduct && (
        <ProductVariantsManager 
          product={selectedProduct} 
          onClose={handleVariantsClose} 
        />
      )}
    </div>
  );
};

export default ProductManagement;
