
import React, { useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Upload, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Product {
  id: string;
  nome: string;
  prezzo: number;
}

interface CsvImportExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  products: Product[];
  onImportProducts: (products: Product[]) => void;
}

const CsvImportExportDialog = ({ open, onOpenChange, products, onImportProducts }: CsvImportExportDialogProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const exportToCsv = () => {
    const csvContent = [
      'nome,prezzo',
      ...products.map(p => `"${p.nome}",${p.prezzo}`)
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'prodotti-catering.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "CSV esportato",
      description: "File prodotti-catering.csv scaricato con successo",
    });
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const lines = text.split('\n').filter(line => line.trim());
        
        // Skip header line
        const dataLines = lines.slice(1);
        
        const importedProducts: Product[] = dataLines.map((line, index) => {
          const [nome, prezzoStr] = line.split(',').map(field => 
            field.replace(/^"|"$/g, '').trim()
          );
          
          const prezzo = parseFloat(prezzoStr);
          
          if (!nome || isNaN(prezzo)) {
            throw new Error(`Riga ${index + 2}: formato non valido`);
          }
          
          return {
            id: Date.now().toString() + index,
            nome,
            prezzo
          };
        });

        onImportProducts(importedProducts);
        onOpenChange(false);
        
        toast({
          title: "CSV importato",
          description: `${importedProducts.length} prodotti importati con successo`,
        });
      } catch (error) {
        toast({
          title: "Errore importazione",
          description: error instanceof Error ? error.message : "Formato file non valido",
          variant: "destructive"
        });
      }
    };
    
    reader.readAsText(file);
    
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Gestione CSV Prodotti</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="text-sm text-gray-600">
            <p className="mb-2">
              <strong>Formato CSV richiesto:</strong>
            </p>
            <code className="block bg-gray-100 p-2 rounded text-xs">
              nome,prezzo<br/>
              "Lasagne della casa",12.50<br/>
              "Risotto ai funghi",10.00
            </code>
          </div>
        </div>

        <DialogFooter className="flex flex-col gap-2 sm:flex-row">
          <input
            type="file"
            accept=".csv"
            onChange={handleFileSelect}
            ref={fileInputRef}
            className="hidden"
          />
          
          <Button
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            className="w-full sm:w-auto"
          >
            <Upload className="h-4 w-4 mr-2" />
            Importa CSV
          </Button>
          
          <Button
            onClick={exportToCsv}
            className="w-full sm:w-auto bg-green-600 hover:bg-green-700"
            disabled={products.length === 0}
          >
            <Download className="h-4 w-4 mr-2" />
            Esporta CSV
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CsvImportExportDialog;
