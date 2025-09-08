
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Edit } from 'lucide-react';

interface Product {
  id: string;
  nome: string;
  prezzo: number;
  costoProduzione?: number;
}

interface EditProductDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: Product | null;
  onEditProduct: (id: string, nome: string, prezzo: number, costoProduzione?: number) => void;
}

const EditProductDialog = ({ open, onOpenChange, product, onEditProduct }: EditProductDialogProps) => {
  const [nome, setNome] = useState('');
  const [prezzo, setPrezzo] = useState('');
  const [costoProduzione, setCostoProduzione] = useState('');

  useEffect(() => {
    if (product) {
      setNome(product.nome);
      setPrezzo(product.prezzo.toString());
      setCostoProduzione(product.costoProduzione?.toString() || '');
    }
  }, [product]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const nomeValue = nome.trim();
    const prezzoValue = parseFloat(prezzo);
    const costoProduzioneValue = costoProduzione.trim() ? parseFloat(costoProduzione) : undefined;
    
    if (!nomeValue || isNaN(prezzoValue) || prezzoValue <= 0) {
      return;
    }

    if (costoProduzione.trim() && (isNaN(costoProduzioneValue!) || costoProduzioneValue! < 0)) {
      return;
    }

    if (product) {
      onEditProduct(product.id, nomeValue, prezzoValue, costoProduzioneValue);
      onOpenChange(false);
      setNome('');
      setPrezzo('');
      setCostoProduzione('');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit className="h-5 w-5" />
            Modifica Prodotto
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-nome">Nome del prodotto</Label>
            <Input
              id="edit-nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Es. Lasagne della casa"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="edit-prezzo">Prezzo (€)</Label>
            <Input
              id="edit-prezzo"
              type="number"
              step="0.01"
              min="0.01"
              value={prezzo}
              onChange={(e) => setPrezzo(e.target.value)}
              placeholder="Es. 12.50"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-costo-produzione">Costo di produzione (€) - Opzionale</Label>
            <Input
              id="edit-costo-produzione"
              type="number"
              step="0.01"
              min="0"
              value={costoProduzione}
              onChange={(e) => setCostoProduzione(e.target.value)}
              placeholder="Es. 4.50"
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annulla
            </Button>
            <Button type="submit" className="bg-orange-500 hover:bg-orange-600">
              <Edit className="h-4 w-4 mr-2" />
              Salva Modifiche
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditProductDialog;
