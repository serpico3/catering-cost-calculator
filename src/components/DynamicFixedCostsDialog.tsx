import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Trash2, Edit, Save, X } from 'lucide-react';
import { FixedCostItem } from '@/hooks/useDynamicFixedCosts';

interface DynamicFixedCostsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fixedCosts: FixedCostItem[];
  onAddFixedCost: (nome: string, costo: number) => void;
  onUpdateFixedCost: (id: string, nome: string, costo: number) => void;
  onRemoveFixedCost: (id: string) => void;
}

const DynamicFixedCostsDialog = ({ 
  open, 
  onOpenChange, 
  fixedCosts, 
  onAddFixedCost, 
  onUpdateFixedCost, 
  onRemoveFixedCost 
}: DynamicFixedCostsDialogProps) => {
  const [newNome, setNewNome] = useState('');
  const [newCosto, setNewCosto] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editNome, setEditNome] = useState('');
  const [editCosto, setEditCosto] = useState('');

  const handleAdd = () => {
    const costo = parseFloat(newCosto);
    if (newNome.trim() && !isNaN(costo) && costo >= 0) {
      onAddFixedCost(newNome.trim(), costo);
      setNewNome('');
      setNewCosto('');
    }
  };

  const startEdit = (item: FixedCostItem) => {
    setEditingId(item.id);
    setEditNome(item.nome);
    setEditCosto(item.costo.toString());
  };

  const handleEdit = () => {
    const costo = parseFloat(editCosto);
    if (editingId && editNome.trim() && !isNaN(costo) && costo >= 0) {
      onUpdateFixedCost(editingId, editNome.trim(), costo);
      setEditingId(null);
      setEditNome('');
      setEditCosto('');
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditNome('');
    setEditCosto('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Gestione Costi Fissi
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Existing Fixed Costs */}
          <div className="space-y-2">
            <h4 className="font-medium">Costi Attuali:</h4>
            {fixedCosts.map((item) => (
              <div key={item.id} className="flex items-center gap-2 p-3 border rounded">
                {editingId === item.id ? (
                  <>
                    <Input
                      value={editNome}
                      onChange={(e) => setEditNome(e.target.value)}
                      placeholder="Nome costo"
                      className="flex-1"
                    />
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={editCosto}
                      onChange={(e) => setEditCosto(e.target.value)}
                      placeholder="Costo"
                      className="w-24"
                    />
                    <Button size="sm" onClick={handleEdit}>
                      <Save className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={cancelEdit}>
                      <X className="h-4 w-4" />
                    </Button>
                  </>
                ) : (
                  <>
                    <span className="flex-1">{item.nome}</span>
                    <span className="w-20 text-right">€{item.costo.toFixed(2)}</span>
                    <Button size="sm" variant="outline" onClick={() => startEdit(item)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => onRemoveFixedCost(item.id)}
                      className="border-red-500 text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </>
                )}
              </div>
            ))}
          </div>

          {/* Add New Fixed Cost */}
          <div className="border-t pt-4 space-y-3">
            <h4 className="font-medium">Aggiungi Nuovo Costo:</h4>
            <div className="space-y-2">
              <div>
                <Label htmlFor="new-nome">Nome</Label>
                <Input
                  id="new-nome"
                  value={newNome}
                  onChange={(e) => setNewNome(e.target.value)}
                  placeholder="es. Attrezzatura"
                />
              </div>
              <div>
                <Label htmlFor="new-costo">Costo (€)</Label>
                <Input
                  id="new-costo"
                  type="number"
                  step="0.01"
                  min="0"
                  value={newCosto}
                  onChange={(e) => setNewCosto(e.target.value)}
                  placeholder="es. 50.00"
                />
              </div>
              <Button onClick={handleAdd} className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Aggiungi Costo
              </Button>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Chiudi
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DynamicFixedCostsDialog;
