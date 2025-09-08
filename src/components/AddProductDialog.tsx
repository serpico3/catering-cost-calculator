
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus } from 'lucide-react';

interface AddProductDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddProduct: (nome: string, prezzo: number, costoProduzione?: number) => void;
}

const AddProductDialog = ({ open, onOpenChange, onAddProduct }: AddProductDialogProps) => {
  const [nome, setNome] = useState('');
  const [prezzo, setPrezzo] = useState<string>('');
  const [costoProduzione, setCostoProduzione] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!nome.trim() || !prezzo.trim()) {
      return;
    }

    const prezzoNumerico = parseFloat(prezzo);
    if (isNaN(prezzoNumerico) || prezzoNumerico <= 0) {
      return;
    }

    const costoProduzioneNumerico = costoProduzione.trim() ? parseFloat(costoProduzione) : undefined;
    if (costoProduzione.trim() && (isNaN(costoProduzioneNumerico!) || costoProduzioneNumerico! < 0)) {
      return;
    }

    onAddProduct(nome.trim(), prezzoNumerico, costoProduzioneNumerico);
    setNome('');
    setPrezzo('');
    setCostoProduzione('');
    onOpenChange(false);
  };

  const handleClose = () => {
    setNome('');
    setPrezzo('');
    setCostoProduzione('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5 text-green-600" />
            Aggiungi Nuovo Prodotto
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="product-name">Nome del prodotto</Label>
            <Input
              id="product-name"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="es. Spaghetti alla carbonara"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="product-price">Prezzo per persona (€)</Label>
            <Input
              id="product-price"
              type="number"
              step="0.01"
              min="0.01"
              value={prezzo}
              onChange={(e) => setPrezzo(e.target.value)}
              placeholder="es. 8.50"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="production-cost">Costo di produzione (€) - Opzionale</Label>
            <Input
              id="production-cost"
              type="number"
              step="0.01"
              min="0"
              value={costoProduzione}
              onChange={(e) => setCostoProduzione(e.target.value)}
              placeholder="es. 4.50"
            />
          </div>
          
          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={handleClose}>
              Annulla
            </Button>
            <Button 
              type="submit" 
              className="bg-green-600 hover:bg-green-700"
              disabled={!nome.trim() || !prezzo.trim()}
            >
              <Plus className="h-4 w-4 mr-2" />
              Aggiungi Prodotto
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddProductDialog;
