
import React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { FileEdit, Trash2, RefreshCw, Eye } from "lucide-react";
import { formatCurrency } from "@/utils/formatters";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Product } from "@/types";

interface ProductTableProps {
  products: Product[];
  loading: boolean;
  handleEditProduct: (product: Product) => void;
  handleManageVariants: (product: Product) => void;
  handleDeleteProduct: (id: string) => Promise<void>;
}

const ProductTable = ({
  products,
  loading,
  handleEditProduct,
  handleManageVariants,
  handleDeleteProduct
}: ProductTableProps) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>SKU</TableHead>
          <TableHead>Category</TableHead>
          <TableHead>Price</TableHead>
          <TableHead>Stock</TableHead>
          <TableHead>Variants</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {loading ? (
          <TableRow>
            <TableCell colSpan={7} className="h-24 text-center">
              <RefreshCw className="h-5 w-5 animate-spin mx-auto" />
            </TableCell>
          </TableRow>
        ) : products.length === 0 ? (
          <TableRow>
            <TableCell colSpan={7} className="h-24 text-center">
              No products found.
            </TableCell>
          </TableRow>
        ) : (
          products.map(product => (
            <TableRow key={product.id}>
              <TableCell className="font-medium">{product.name}</TableCell>
              <TableCell>{product.sku || "-"}</TableCell>
              <TableCell>
                {product.category || product.category_id && (product as any).product_categories?.name || "Uncategorized"}
              </TableCell>
              <TableCell>{formatCurrency(product.price)}</TableCell>
              <TableCell>
                {product.has_variants ? (
                  <Badge variant="outline">Has variants</Badge>
                ) : (
                  <span>{product.stock ?? 0}</span>
                )}
              </TableCell>
              <TableCell>
                {product.has_variants ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleManageVariants(product);
                      return false;
                    }}
                    className="flex items-center gap-1"
                    type="button"
                  >
                    <Eye className="h-3 w-3" />
                    Manage
                  </Button>
                ) : (
                  <Badge variant="secondary">No variants</Badge>
                )}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleEditProduct(product);
                      return false;
                    }}
                    title="Edit product"
                    aria-label="Edit product"
                    type="button"
                  >
                    <FileEdit className="h-4 w-4" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="icon" 
                        title="Delete product" 
                        aria-label="Delete product"
                        type="button"
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Product</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete this product? This action cannot be undone.
                          {product.has_variants && (
                            <p className="mt-2 font-bold text-destructive">
                              All associated variants will also be deleted!
                            </p>
                          )}
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          className="bg-destructive text-destructive-foreground"
                          onClick={() => handleDeleteProduct(product.id)}
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
};

export default ProductTable;
