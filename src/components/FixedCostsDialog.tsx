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
  const [camioncino, setCamioncino] = useState('');
  const [furgone, setFurgone] = useState('');

  useEffect(() => {
    setCamioncino(fixedCosts.camioncino.toString());
    setFurgone(fixedCosts.furgone.toString());
  }, [fixedCosts]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const camioncinoValue = parseFloat(camioncino);
    const furgoneValue = parseFloat(furgone);
    
    if (isNaN(camioncinoValue) || isNaN(furgoneValue) || camioncinoValue < 0 || furgoneValue < 0) {
      return;
    }

    onUpdateFixedCosts({
      camioncino: camioncinoValue,
      furgone: furgoneValue
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
            <Label htmlFor="camioncino-cost">Costo uscita camioncino (€)</Label>
            <Input
              id="camioncino-cost"
              type="number"
              step="0.01"
              min="0"
              value={camioncino}
              onChange={(e) => setCamioncino(e.target.value)}
              placeholder="es. 50.00"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="furgone-cost">Costo uscita furgone (€)</Label>
            <Input
              id="furgone-cost"
              type="number"
              step="0.01"
              min="0"
              value={furgone}
              onChange={(e) => setFurgone(e.target.value)}
              placeholder="es. 80.00"
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