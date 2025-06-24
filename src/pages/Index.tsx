import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Plus, Trash2, FileDown, UtensilsCrossed } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import AddProductDialog from '@/components/AddProductDialog';
import RemoveProductDialog from '@/components/RemoveProductDialog';
import SaveQuoteDialog from '@/components/SaveQuoteDialog';
import { useProducts } from '@/hooks/useProducts';
import jsPDF from 'jspdf';

interface SelectedProduct {
  id: string;
  nome: string;
  prezzo: number;
  selected: boolean;
}

const Index = () => {
  const { products, isLoading, addProduct, removeProduct } = useProducts();
  const [selectedProducts, setSelectedProducts] = useState<SelectedProduct[]>([]);
  const [numberOfPeople, setNumberOfPeople] = useState<number>(1);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isRemoveDialogOpen, setIsRemoveDialogOpen] = useState(false);
  const [isSaveQuoteDialogOpen, setIsSaveQuoteDialogOpen] = useState(false);
  const { toast } = useToast();

  // Aggiorna selectedProducts quando products cambia
  React.useEffect(() => {
    setSelectedProducts(products.map(p => ({ ...p, selected: false })));
  }, [products]);

  const toggleProductSelection = (productId: string) => {
    setSelectedProducts(prev =>
      prev.map(product =>
        product.id === productId
          ? { ...product, selected: !product.selected }
          : product
      )
    );
  };

  const handleAddProduct = (nome: string, prezzo: number) => {
    addProduct({ nome, prezzo });
  };

  const handleRemoveProduct = (productId: string) => {
    removeProduct(productId);
  };

  const calculateTotal = () => {
    const selectedTotal = selectedProducts
      .filter(product => product.selected)
      .reduce((sum, product) => sum + product.prezzo, 0);
    
    return selectedTotal * numberOfPeople;
  };

  const handleGenerateQuote = () => {
    const selectedItems = selectedProducts.filter(p => p.selected);
    
    if (selectedItems.length === 0) {
      toast({
        title: "Nessun prodotto selezionato",
        description: "Seleziona almeno un prodotto per generare il preventivo",
        variant: "destructive"
      });
      return;
    }

    setIsSaveQuoteDialogOpen(true);
  };

  const generateQuote = (filename: string) => {
    const selectedItems = selectedProducts.filter(p => p.selected);
    const currentDate = new Date().toLocaleDateString('it-IT');
    const subtotal = selectedItems.reduce((sum, product) => sum + product.prezzo, 0);
    const total = subtotal * numberOfPeople;

    // Crea PDF
    const doc = new jsPDF();
    
    // Intestazione
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('PREVENTIVO CATERING', 20, 30);
    
    // Linea separatrice
    doc.setLineWidth(0.5);
    doc.line(20, 35, 190, 35);
    
    // Informazioni azienda
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text('Delizie & Sapori Catering', 20, 50);
    doc.text('Via Roma 123, Milano', 20, 58);
    doc.text('Tel: 02-1234567', 20, 66);
    doc.text('Email: info@deliziesapori.it', 20, 74);
    
    // Data e numero persone
    doc.text(`Data: ${currentDate}`, 130, 50);
    doc.text(`Numero persone: ${numberOfPeople}`, 130, 58);
    
    // Prodotti selezionati
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('PRODOTTI SELEZIONATI:', 20, 95);
    
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    let yPosition = 110;
    
    selectedItems.forEach((item, index) => {
      doc.text(`${index + 1}. ${item.nome}`, 25, yPosition);
      doc.text(`€${item.prezzo.toFixed(2)} per persona`, 130, yPosition);
      yPosition += 8;
    });
    
    // Riepilogo
    yPosition += 10;
    doc.setLineWidth(0.3);
    doc.line(20, yPosition, 190, yPosition);
    yPosition += 15;
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(`Subtotale per persona: €${subtotal.toFixed(2)}`, 20, yPosition);
    yPosition += 8;
    doc.text(`Numero persone: ${numberOfPeople}`, 20, yPosition);
    yPosition += 15;
    
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text(`TOTALE COMPLESSIVO: €${total.toFixed(2)}`, 20, yPosition);
    
    // Footer
    yPosition += 25;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'italic');
    doc.text('Grazie per averci scelto!', 20, yPosition);
    doc.text('Il preventivo è valido per 30 giorni.', 20, yPosition + 8);
    
    // Salva il PDF con il nome scelto
    doc.save(`${filename}.pdf`);

    toast({
      title: "Preventivo PDF generato",
      description: "Il file PDF è stato scaricato con successo",
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-yellow-50 flex items-center justify-center">
        <div className="text-center">
          <UtensilsCrossed className="h-12 w-12 text-orange-600 mx-auto mb-4 animate-spin" />
          <p className="text-lg text-gray-600">Caricamento prodotti...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-yellow-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <UtensilsCrossed className="h-8 w-8 text-orange-600" />
            <h1 className="text-4xl font-bold text-gray-800">Catering Calculator</h1>
          </div>
          <p className="text-lg text-gray-600">Crea i tuoi preventivi in modo semplice e professionale</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Lista Prodotti */}
          <div className="lg:col-span-2">
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur">
              <CardHeader className="bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-t-lg">
                <CardTitle className="flex items-center gap-2">
                  <UtensilsCrossed className="h-5 w-5" />
                  Menu Disponibile
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {/* Area di scorrimento condizionale */}
                {selectedProducts.length > 7 ? (
                  <ScrollArea className="h-[400px] pr-4">
                    <div className="grid gap-4">
                      {selectedProducts.map((product) => (
                        <div
                          key={product.id}
                          className={`flex items-center justify-between p-4 rounded-lg border-2 transition-all duration-200 ${
                            product.selected
                              ? 'border-orange-500 bg-orange-50'
                              : 'border-gray-200 bg-white hover:border-orange-300'
                          }`}
                        >
                          <div className="flex items-center space-x-3">
                            <Checkbox
                              id={product.id}
                              checked={product.selected}
                              onCheckedChange={() => toggleProductSelection(product.id)}
                              className="h-5 w-5"
                            />
                            <div>
                              <label
                                htmlFor={product.id}
                                className="text-lg font-medium text-gray-800 cursor-pointer"
                              >
                                {product.nome}
                              </label>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="text-xl font-bold text-orange-600">
                              €{product.prezzo.toFixed(2)}
                            </span>
                            <div className="text-sm text-gray-500">per persona</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                ) : (
                  <div className="grid gap-4">
                    {selectedProducts.map((product) => (
                      <div
                        key={product.id}
                        className={`flex items-center justify-between p-4 rounded-lg border-2 transition-all duration-200 ${
                          product.selected
                            ? 'border-orange-500 bg-orange-50'
                            : 'border-gray-200 bg-white hover:border-orange-300'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <Checkbox
                            id={product.id}
                            checked={product.selected}
                            onCheckedChange={() => toggleProductSelection(product.id)}
                            className="h-5 w-5"
                          />
                          <div>
                            <label
                              htmlFor={product.id}
                              className="text-lg font-medium text-gray-800 cursor-pointer"
                            >
                              {product.nome}
                            </label>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-xl font-bold text-orange-600">
                            €{product.prezzo.toFixed(2)}
                          </span>
                          <div className="text-sm text-gray-500">per persona</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Pulsanti Gestione Prodotti */}
                <div className="flex gap-3 mt-6 pt-6 border-t">
                  <Button
                    onClick={() => setIsAddDialogOpen(true)}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Aggiungi Prodotto
                  </Button>
                  <Button
                    onClick={() => setIsRemoveDialogOpen(true)}
                    variant="outline"
                    className="flex-1 border-red-500 text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Rimuovi Prodotto
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Pannello Calcolo */}
          <div className="space-y-6">
            {/* Numero Persone */}
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur">
              <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-t-lg">
                <CardTitle>Numero Persone</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-3">
                  <Label htmlFor="people-count" className="text-lg font-medium">
                    Quante persone parteciperanno?
                  </Label>
                  <Input
                    id="people-count"
                    type="number"
                    min="1"
                    value={numberOfPeople}
                    onChange={(e) => setNumberOfPeople(Math.max(1, parseInt(e.target.value) || 1))}
                    className="text-xl font-bold text-center border-2 border-blue-300 focus:border-blue-500"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Riepilogo */}
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
                  onClick={handleGenerateQuote}
                  className="w-full mt-6 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-lg py-3"
                  disabled={!selectedProducts.some(p => p.selected)}
                >
                  <FileDown className="h-5 w-5 mr-2" />
                  Genera Preventivo PDF
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Dialogs */}
      <AddProductDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onAddProduct={handleAddProduct}
      />
      
      <RemoveProductDialog
        open={isRemoveDialogOpen}
        onOpenChange={setIsRemoveDialogOpen}
        products={products}
        onRemoveProduct={handleRemoveProduct}
      />

      <SaveQuoteDialog
        open={isSaveQuoteDialogOpen}
        onOpenChange={setIsSaveQuoteDialogOpen}
        onSaveQuote={generateQuote}
      />
    </div>
  );
};

export default Index;
