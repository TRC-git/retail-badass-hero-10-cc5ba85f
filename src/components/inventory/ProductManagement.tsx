
import React, { useState, useCallback, useEffect } from "react";
import { useProducts } from "@/contexts/ProductContext";
import { Card, CardContent } from "@/components/ui/card";
import { deleteProduct } from "@/api/productApi";
import { toast } from "sonner";
import ProductTable from "./products/ProductTable";
import ProductSearch from "./products/ProductSearch";
import ProductHeader from "./products/ProductHeader";
import ProductModals from "./products/ProductModals";

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

  // Debugging for dialog visibility
  useEffect(() => {
    console.log("Dialog states - Add:", showAddForm, "Edit:", showEditForm, "Variants:", showVariantsManager);
    console.log("Selected product:", selectedProduct?.name);
  }, [showAddForm, showEditForm, showVariantsManager, selectedProduct]);

  // Filter products based on search term
  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (product.sku && product.sku.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (product.barcode && product.barcode.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (product.description && product.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Use useCallback to ensure the handler doesn't change between renders
  const handleAddProduct = useCallback(() => {
    console.log("handleAddProduct called in ProductManagement");
    
    // First set selected product to null, then open the form
    setSelectedProduct(null);
    
    // Explicitly set dialog state
    setShowAddForm(true);
    console.log("Set showAddForm to true");
  }, [setSelectedProduct]);

  const handleEditProduct = useCallback((product) => {
    console.log("handleEditProduct called in ProductManagement for:", product.name);
    
    // Close any other open dialogs first
    setShowAddForm(false);
    setShowVariantsManager(false);
    
    // First set the selected product
    setSelectedProduct(product);
    
    // Then open the edit modal
    setShowEditForm(true);
    console.log("Set showEditForm to true for product:", product.name);
  }, [setSelectedProduct]);

  const handleManageVariants = useCallback((product) => {
    // Close other dialogs first
    setShowAddForm(false);
    setShowEditForm(false);
    
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

      {/* Product modals (Add, Edit, Variants) */}
      <ProductModals
        selectedProduct={selectedProduct}
        showAddForm={showAddForm}
        showEditForm={showEditForm}
        showVariantsManager={showVariantsManager}
        setShowAddForm={setShowAddForm}
        setShowEditForm={setShowEditForm}
        setShowVariantsManager={setShowVariantsManager}
        setSelectedProduct={setSelectedProduct}
        refreshProducts={refreshProducts}
      />
    </div>
  );
};

export default ProductManagement;
