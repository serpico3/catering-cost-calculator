
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { FileDown, Settings, FileText } from 'lucide-react';
import { SelectedProduct } from '@/hooks/useProducts';
import { FixedCostItem } from '@/hooks/useDynamicFixedCosts';
import ExportDialog from '@/components/ExportDialog';
import DynamicFixedCostsDialog from '@/components/DynamicFixedCostsDialog';

interface QuoteSummaryProps {
  selectedProducts: SelectedProduct[];
  numberOfPeople: number;
  fixedCosts: FixedCostItem[];
  onGenerateQuote: (filename: string, selectedProducts: SelectedProduct[], numberOfPeople: number, fixedCosts: FixedCostItem[]) => void;
  onGenerateInternalQuote: (filename: string, selectedProducts: SelectedProduct[], numberOfPeople: number, fixedCosts: FixedCostItem[]) => void;
  onAddFixedCost: (nome: string, costo: number) => void;
  onUpdateFixedCost: (id: string, nome: string, costo: number) => void;
  onRemoveFixedCost: (id: string) => void;
}

const QuoteSummary = ({ selectedProducts, numberOfPeople, fixedCosts, onGenerateQuote, onGenerateInternalQuote, onAddFixedCost, onUpdateFixedCost, onRemoveFixedCost }: QuoteSummaryProps) => {
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  const [isInternalExportDialogOpen, setIsInternalExportDialogOpen] = useState(false);
  const [isFixedCostsDialogOpen, setIsFixedCostsDialogOpen] = useState(false);
  const [includeFixedCostsInQuote, setIncludeFixedCostsInQuote] = useState(true);

  const calculateTotal = () => {
    const selectedTotal = selectedProducts
      .filter(product => product.selected)
      .reduce((sum, product) => sum + product.prezzo, 0);
    
    const foodTotal = selectedTotal * numberOfPeople;
    const totalFixedCosts = fixedCosts.reduce((sum, item) => sum + item.costo, 0);
    return foodTotal + totalFixedCosts;
  };

  const handleExport = (filename: string) => {
    const costsToInclude = includeFixedCostsInQuote ? fixedCosts : [];
    onGenerateQuote(filename, selectedProducts, numberOfPeople, costsToInclude);
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
                <h4 className="font-medium">Costi Fissi:</h4>
                <div className="space-y-1">
                  {fixedCosts.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm text-gray-600">
                      <span>{item.nome}:</span>
                      <span>€{item.costo.toFixed(2)}</span>
                    </div>
                  ))}
                  <div className="flex justify-between text-sm font-medium pt-1 border-t">
                    <span>Totale costi fissi:</span>
                    <span>€{fixedCosts.reduce((sum, item) => sum + item.costo, 0).toFixed(2)}</span>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setIsFixedCostsDialogOpen(true)}
                  className="w-full"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Gestisci Costi Fissi
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

        <div className="border-t pt-4 mt-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="include-fixed-costs"
              checked={includeFixedCostsInQuote}
              onCheckedChange={setIncludeFixedCostsInQuote}
            />
            <Label htmlFor="include-fixed-costs" className="text-sm font-medium">
              Includi costi fissi nel preventivo cliente
            </Label>
          </div>
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

      <DynamicFixedCostsDialog
        open={isFixedCostsDialogOpen}
        onOpenChange={setIsFixedCostsDialogOpen}
        fixedCosts={fixedCosts}
        onAddFixedCost={onAddFixedCost}
        onUpdateFixedCost={onUpdateFixedCost}
        onRemoveFixedCost={onRemoveFixedCost}
      />
    </Card>
  );
};

export default QuoteSummary;
