
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
import { FileDown } from 'lucide-react';

interface SaveQuoteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaveQuote: (filename: string) => void;
}

const SaveQuoteDialog = ({ open, onOpenChange, onSaveQuote }: SaveQuoteDialogProps) => {
  const [filename, setFilename] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!filename.trim()) {
      return;
    }

    onSaveQuote(filename.trim());
    setFilename('');
    onOpenChange(false);
  };

  const handleClose = () => {
    setFilename('');
    onOpenChange(false);
  };

  // Genera un nome file di default basato sulla data
  const defaultFilename = `preventivo-catering-${new Date().toLocaleDateString('it-IT').replace(/\//g, '-')}`;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileDown className="h-5 w-5 text-blue-600" />
            Salva Preventivo PDF
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="filename">Nome del file</Label>
            <Input
              id="filename"
              value={filename}
              onChange={(e) => setFilename(e.target.value)}
              placeholder={defaultFilename}
              required
            />
            <p className="text-sm text-gray-500">
              L'estensione .pdf verrà aggiunta automaticamente
            </p>
          </div>
          
          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={handleClose}>
              Annulla
            </Button>
            <Button 
              type="submit" 
              className="bg-blue-600 hover:bg-blue-700"
              disabled={!filename.trim()}
            >
              <FileDown className="h-4 w-4 mr-2" />
              Salva PDF
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default SaveQuoteDialog;
