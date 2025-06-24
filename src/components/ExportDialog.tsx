
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FileDown } from 'lucide-react';

interface ExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onExport: (filename: string) => void;
}

const ExportDialog = ({ open, onOpenChange, onExport }: ExportDialogProps) => {
  const [filename, setFilename] = useState('');

  const handleExport = () => {
    const finalFilename = filename.trim() || 'preventivo-catering';
    onExport(finalFilename);
    onOpenChange(false);
    setFilename('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileDown className="h-5 w-5" />
            Esporta Preventivo PDF
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="filename">Nome del file</Label>
            <Input
              id="filename"
              placeholder="preventivo-catering"
              value={filename}
              onChange={(e) => setFilename(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleExport()}
            />
            <p className="text-sm text-gray-500">
              Il file verrà salvato come: {filename.trim() || 'preventivo-catering'}.pdf
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annulla
          </Button>
          <Button onClick={handleExport} className="bg-orange-500 hover:bg-orange-600">
            <FileDown className="h-4 w-4 mr-2" />
            Genera PDF
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ExportDialog;
