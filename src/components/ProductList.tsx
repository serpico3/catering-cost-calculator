
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Plus, Trash2, FileText, X, Edit, UtensilsCrossed } from 'lucide-react';
import { Product, SelectedProduct } from '@/hooks/useProducts';
import AddProductDialog from '@/components/AddProductDialog';
import RemoveProductDialog from '@/components/RemoveProductDialog';
import CsvImportExportDialog from '@/components/CsvImportExportDialog';
import EditProductDialog from '@/components/EditProductDialog';

interface ProductListProps {
  selectedProducts: SelectedProduct[];
  products: Product[];
  onToggleSelection: (productId: string) => void;
  onDeselectAll: () => void;
  onAddProduct: (nome: string, prezzo: number, costoProduzione?: number) => void;
  onEditProduct: (id: string, nome: string, prezzo: number, costoProduzione?: number) => void;
  onRemoveProduct: (productId: string) => void;
  onImportProducts: (products: Product[]) => void;
}

const ProductList = ({
  selectedProducts,
  products,
  onToggleSelection,
  onDeselectAll,
  onAddProduct,
  onEditProduct,
  onRemoveProduct,
  onImportProducts
}: ProductListProps) => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isRemoveDialogOpen, setIsRemoveDialogOpen] = useState(false);
  const [isCsvDialogOpen, setIsCsvDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const openEditDialog = (product: Product) => {
    setEditingProduct(product);
    setIsEditDialogOpen(true);
  };

  const ProductGrid = () => (
    <div className="grid gap-4">
      {selectedProducts.map((product) => (
        <div
          key={product.id}
          className={`flex items-center justify-between p-4 rounded-lg border-2 transition-all duration-200 ${
            product.selected
              ? 'border-orange-500 bg-orange-50'
              : 'border-gray-200 bg-white hover:border-orange-300'
          }`}
        >
          <div className="flex items-center space-x-3 flex-1">
            <Checkbox
              id={product.id}
              checked={product.selected}
              onCheckedChange={() => onToggleSelection(product.id)}
              className="h-5 w-5"
            />
            <div className="flex-1">
              <label
                htmlFor={product.id}
                className="text-lg font-medium text-gray-800 cursor-pointer"
              >
                {product.nome}
              </label>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="text-xl font-bold text-orange-600">
                €{product.prezzo.toFixed(2)}
              </span>
              <div className="text-sm text-gray-500">per persona</div>
            </div>
            <Button
              onClick={() => openEditDialog(product)}
              variant="outline"
              size="icon"
              className="border-blue-500 text-blue-600 hover:bg-blue-50"
            >
              <Edit className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <Card className="shadow-lg border-0 bg-white/80 backdrop-blur">
      <CardHeader className="bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-t-lg">
        <CardTitle className="flex items-center gap-2">
          <UtensilsCrossed className="h-5 w-5" />
          Menu Disponibile
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        {/* Deselect All Button */}
        {selectedProducts.some(p => p.selected) && (
          <div className="mb-4 pb-4 border-b">
            <Button
              onClick={onDeselectAll}
              variant="outline"
              className="border-orange-500 text-orange-600 hover:bg-orange-50"
            >
              <X className="h-4 w-4 mr-2" />
              Deseleziona Tutto
            </Button>
          </div>
        )}

        {/* Conditional scrolling area */}
        {selectedProducts.length > 7 ? (
          <ScrollArea className="h-[400px] pr-4">
            <ProductGrid />
          </ScrollArea>
        ) : (
          <ProductGrid />
        )}

        {/* Product Management Buttons */}
        <div className="grid grid-cols-2 gap-3 mt-6 pt-6 border-t">
          <Button
            onClick={() => setIsAddDialogOpen(true)}
            className="bg-green-600 hover:bg-green-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Aggiungi
          </Button>
          <Button
            onClick={() => setIsRemoveDialogOpen(true)}
            variant="outline"
            className="border-red-500 text-red-600 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Rimuovi
          </Button>
          <Button
            onClick={() => setIsCsvDialogOpen(true)}
            variant="outline"
            className="col-span-2 border-blue-500 text-blue-600 hover:bg-blue-50"
          >
            <FileText className="h-4 w-4 mr-2" />
            Gestione CSV
          </Button>
        </div>
      </CardContent>

      {/* Dialogs */}
      <AddProductDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onAddProduct={onAddProduct}
      />
      
      <RemoveProductDialog
        open={isRemoveDialogOpen}
        onOpenChange={setIsRemoveDialogOpen}
        products={products}
        onRemoveProduct={onRemoveProduct}
      />

      <CsvImportExportDialog
        open={isCsvDialogOpen}
        onOpenChange={setIsCsvDialogOpen}
        products={products}
        onImportProducts={onImportProducts}
      />

      <EditProductDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        product={editingProduct}
        onEditProduct={onEditProduct}
      />
    </Card>
  );
};

export default ProductList;
