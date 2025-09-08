
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileDown, Truck, FileText } from 'lucide-react';
import { SelectedProduct } from '@/hooks/useProducts';
import { FixedCosts } from '@/hooks/useFixedCosts';
import ExportDialog from '@/components/ExportDialog';
import FixedCostsDialog from '@/components/FixedCostsDialog';

interface QuoteSummaryProps {
  selectedProducts: SelectedProduct[];
  numberOfPeople: number;
  fixedCosts: FixedCosts;
  onGenerateQuote: (filename: string, selectedProducts: SelectedProduct[], numberOfPeople: number, fixedCosts: FixedCosts) => void;
  onGenerateInternalQuote: (filename: string, selectedProducts: SelectedProduct[], numberOfPeople: number, fixedCosts: FixedCosts) => void;
  onUpdateFixedCosts: (costs: FixedCosts) => void;
}

const QuoteSummary = ({ selectedProducts, numberOfPeople, fixedCosts, onGenerateQuote, onGenerateInternalQuote, onUpdateFixedCosts }: QuoteSummaryProps) => {
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  const [isInternalExportDialogOpen, setIsInternalExportDialogOpen] = useState(false);
  const [isFixedCostsDialogOpen, setIsFixedCostsDialogOpen] = useState(false);

  const calculateTotal = () => {
    const selectedTotal = selectedProducts
      .filter(product => product.selected)
      .reduce((sum, product) => sum + product.prezzo, 0);
    
    const foodTotal = selectedTotal * numberOfPeople;
    const totalFixedCosts = fixedCosts.foodLoop + fixedCosts.panche + fixedCosts.personale;
    return foodTotal + totalFixedCosts;
  };

  const handleExport = (filename: string) => {
    onGenerateQuote(filename, selectedProducts, numberOfPeople, fixedCosts);
  };

  const handleInternalExport = (filename: string) => {
    onGenerateInternalQuote(filename, selectedProducts, numberOfPeople, fixedCosts);
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
                  <span>€{(selectedProducts.filter(p => p.selected).reduce((sum, product) => sum + product.prezzo, 0)).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Persone: {numberOfPeople}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Subtotale cibo: €{(selectedProducts.filter(p => p.selected).reduce((sum, product) => sum + product.prezzo, 0) * numberOfPeople).toFixed(2)}</span>
                </div>
              </div>

              {/* Fixed Costs Section */}
              <div className="border-t pt-3 space-y-2">
                <h4 className="font-medium">Costi fissi:</h4>
                <div className="text-sm space-y-1">
                  <div className="flex justify-between">
                    <span>Food Loop:</span>
                    <span>€{fixedCosts.foodLoop.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Panche:</span>
                    <span>€{fixedCosts.panche.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Personale:</span>
                    <span>€{fixedCosts.personale.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-medium border-t pt-1">
                    <span>Totale costi fissi:</span>
                    <span>€{(fixedCosts.foodLoop + fixedCosts.panche + fixedCosts.personale).toFixed(2)}</span>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setIsFixedCostsDialogOpen(true)}
                  className="w-full"
                >
                  <Truck className="h-4 w-4 mr-2" />
                  Modifica Costi Fissi
                </Button>
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

        <div className="grid grid-cols-1 gap-3 mt-6">
          <Button
            onClick={() => setIsExportDialogOpen(true)}
            className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-lg py-3"
            disabled={!selectedProducts.some(p => p.selected)}
          >
            <FileDown className="h-5 w-5 mr-2" />
            Genera Preventivo Cliente
          </Button>
          
          <Button
            onClick={() => setIsInternalExportDialogOpen(true)}
            variant="outline"
            className="w-full border-blue-500 text-blue-600 hover:bg-blue-50 py-3"
            disabled={!selectedProducts.some(p => p.selected)}
          >
            <FileText className="h-5 w-5 mr-2" />
            Analisi Profitto (Interno)
          </Button>
        </div>
      </CardContent>

      <ExportDialog
        open={isExportDialogOpen}
        onOpenChange={setIsExportDialogOpen}
        onExport={handleExport}
      />
      
      <ExportDialog
        open={isInternalExportDialogOpen}
        onOpenChange={setIsInternalExportDialogOpen}
        onExport={handleInternalExport}
      />

      <FixedCostsDialog
        open={isFixedCostsDialogOpen}
        onOpenChange={setIsFixedCostsDialogOpen}
        fixedCosts={fixedCosts}
        onUpdateFixedCosts={onUpdateFixedCosts}
      />
    </Card>
  );
};

export default QuoteSummary;
