
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Trash2, AlertTriangle } from 'lucide-react';

interface Product {
  id: string;
  nome: string;
  prezzo: number;
}

interface RemoveProductDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  products: Product[];
  onRemoveProduct: (productId: string) => void;
}

const RemoveProductDialog = ({ open, onOpenChange, products, onRemoveProduct }: RemoveProductDialogProps) => {
  const [selectedForRemoval, setSelectedForRemoval] = useState<string[]>([]);

  const toggleSelection = (productId: string) => {
    setSelectedForRemoval(prev =>
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const handleRemove = () => {
    selectedForRemoval.forEach(productId => {
      onRemoveProduct(productId);
    });
    setSelectedForRemoval([]);
    onOpenChange(false);
  };

  const handleClose = () => {
    setSelectedForRemoval([]);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Trash2 className="h-5 w-5 text-red-600" />
            Rimuovi Prodotti
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {products.length === 0 ? (
            <p className="text-gray-500 text-center py-4">
              Nessun prodotto disponibile da rimuovere
            </p>
          ) : (
            <>
              <p className="text-sm text-gray-600">
                Seleziona i prodotti che vuoi rimuovere dal menu:
              </p>
              
              <div className="max-h-60 overflow-y-auto space-y-2">
                {products.map((product) => (
                  <div
                    key={product.id}
                    className={`flex items-center space-x-3 p-3 rounded-lg border ${
                      selectedForRemoval.includes(product.id)
                        ? 'border-red-500 bg-red-50'
                        : 'border-gray-200 hover:border-red-300'
                    }`}
                  >
                    <Checkbox
                      id={`remove-${product.id}`}
                      checked={selectedForRemoval.includes(product.id)}
                      onCheckedChange={() => toggleSelection(product.id)}
                      className="h-4 w-4"
                    />
                    <div className="flex-1">
                      <label
                        htmlFor={`remove-${product.id}`}
                        className="font-medium cursor-pointer"
                      >
                        {product.nome}
                      </label>
                      <div className="text-sm text-gray-500">
                        €{product.prezzo.toFixed(2)} per persona
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {selectedForRemoval.length > 0 && (
                <div className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <AlertTriangle className="h-4 w-4 text-yellow-600" />
                  <span className="text-sm text-yellow-800">
                    {selectedForRemoval.length} prodotto/i verranno rimossi definitivamente
                  </span>
                </div>
              )}
            </>
          )}
        </div>
        
        <DialogFooter className="gap-2">
          <Button type="button" variant="outline" onClick={handleClose}>
            Annulla
          </Button>
          <Button
            onClick={handleRemove}
            variant="destructive"
            disabled={selectedForRemoval.length === 0}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Rimuovi Selezionati
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RemoveProductDialog;
