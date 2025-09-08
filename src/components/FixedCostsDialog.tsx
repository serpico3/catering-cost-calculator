import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Truck } from 'lucide-react';
import { FixedCosts } from '@/hooks/useFixedCosts';

interface FixedCostsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fixedCosts: FixedCosts;
  onUpdateFixedCosts: (costs: FixedCosts) => void;
}

const FixedCostsDialog = ({ open, onOpenChange, fixedCosts, onUpdateFixedCosts }: FixedCostsDialogProps) => {
  const [foodLoop, setFoodLoop] = useState('');
  const [panche, setPanche] = useState('');
  const [personale, setPersonale] = useState('');

  useEffect(() => {
    setFoodLoop(fixedCosts.foodLoop.toString());
    setPanche(fixedCosts.panche.toString());
    setPersonale(fixedCosts.personale.toString());
  }, [fixedCosts]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const foodLoopValue = parseFloat(foodLoop);
    const pancheValue = parseFloat(panche);
    const personaleValue = parseFloat(personale);
    
    if (isNaN(foodLoopValue) || isNaN(pancheValue) || isNaN(personaleValue) || 
        foodLoopValue < 0 || pancheValue < 0 || personaleValue < 0) {
      return;
    }

    onUpdateFixedCosts({
      foodLoop: foodLoopValue,
      panche: pancheValue,
      personale: personaleValue
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Truck className="h-5 w-5" />
            Gestione Costi Fissi
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="foodloop-cost">Costo Food Loop (€)</Label>
            <Input
              id="foodloop-cost"
              type="number"
              step="0.01"
              min="0"
              value={foodLoop}
              onChange={(e) => setFoodLoop(e.target.value)}
              placeholder="es. 100.00"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="panche-cost">Costo Panche (€)</Label>
            <Input
              id="panche-cost"
              type="number"
              step="0.01"
              min="0"
              value={panche}
              onChange={(e) => setPanche(e.target.value)}
              placeholder="es. 50.00"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="personale-cost">Costo Personale (€)</Label>
            <Input
              id="personale-cost"
              type="number"
              step="0.01"
              min="0"
              value={personale}
              onChange={(e) => setPersonale(e.target.value)}
              placeholder="es. 120.00"
              required
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annulla
            </Button>
            <Button type="submit" className="bg-orange-500 hover:bg-orange-600">
              <Truck className="h-4 w-4 mr-2" />
              Salva Costi
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default FixedCostsDialog;