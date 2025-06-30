
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileDown } from 'lucide-react';
import { SelectedProduct } from '@/hooks/useProducts';
import ExportDialog from '@/components/ExportDialog';

interface QuoteSummaryProps {
  selectedProducts: SelectedProduct[];
  numberOfPeople: number;
  onGenerateQuote: (filename: string, selectedProducts: SelectedProduct[], numberOfPeople: number) => void;
}

const QuoteSummary = ({ selectedProducts, numberOfPeople, onGenerateQuote }: QuoteSummaryProps) => {
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);

  const calculateTotal = () => {
    const selectedTotal = selectedProducts
      .filter(product => product.selected)
      .reduce((sum, product) => sum + product.prezzo, 0);
    
    return selectedTotal * numberOfPeople;
  };

  const handleExport = (filename: string) => {
    onGenerateQuote(filename, selectedProducts, numberOfPeople);
  };

  return (
    <Card className="shadow-lg border-0 bg-white/80 backdrop-blur">
      <CardHeader className="bg-gradient-to-r from-green-500 to-teal-500 text-white rounded-t-lg">
        <CardTitle>Riepilogo Preventivo</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="space-y-2">
            {selectedProducts
              .filter(p => p.selected)
              .map(product => (
                <div key={product.id} className="flex justify-between text-sm">
                  <span>{product.nome}</span>
                  <span>€{product.prezzo.toFixed(2)}</span>
                </div>
              ))}
          </div>
          
          {selectedProducts.some(p => p.selected) && (
            <>
              <div className="border-t pt-3 space-y-2">
                <div className="flex justify-between font-medium">
                  <span>Subtotale per persona:</span>
                  <span>€{(calculateTotal() / numberOfPeople).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Persone: {numberOfPeople}</span>
                </div>
              </div>
              
              <div className="border-t pt-3">
                <div className="flex justify-between text-2xl font-bold text-green-600">
                  <span>TOTALE:</span>
                  <span>€{calculateTotal().toFixed(2)}</span>
                </div>
              </div>
            </>
          )}
        </div>

        <Button
          onClick={() => setIsExportDialogOpen(true)}
          className="w-full mt-6 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-lg py-3"
          disabled={!selectedProducts.some(p => p.selected)}
        >
          <FileDown className="h-5 w-5 mr-2" />
          Genera Preventivo PDF
        </Button>
      </CardContent>

      <ExportDialog
        open={isExportDialogOpen}
        onOpenChange={setIsExportDialogOpen}
        onExport={handleExport}
      />
    </Card>
  );
};

export default QuoteSummary;
