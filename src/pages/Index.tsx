import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Plus, Trash2, FileDown, UtensilsCrossed, FileText, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import AddProductDialog from '@/components/AddProductDialog';
import RemoveProductDialog from '@/components/RemoveProductDialog';
import ExportDialog from '@/components/ExportDialog';
import CsvImportExportDialog from '@/components/CsvImportExportDialog';
import jsPDF from 'jspdf';

interface Product {
  id: string;
  nome: string;
  prezzo: number;
}

interface SelectedProduct extends Product {
  selected: boolean;
}

const Index = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<SelectedProduct[]>([]);
  const [numberOfPeople, setNumberOfPeople] = useState<number>(1);
  const [peopleInput, setPeopleInput] = useState<string>('1');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isRemoveDialogOpen, setIsRemoveDialogOpen] = useState(false);
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  const [isCsvDialogOpen, setIsCsvDialogOpen] = useState(false);
  const { toast } = useToast();

  // Carica i prodotti dal localStorage al mount
  useEffect(() => {
    const savedProducts = localStorage.getItem('catering-products');
    if (savedProducts) {
      const parsedProducts = JSON.parse(savedProducts);
      setProducts(parsedProducts);
      setSelectedProducts(parsedProducts.map((p: Product) => ({ ...p, selected: false })));
    } else {
      // Prodotti di default
      const defaultProducts = [
        { id: '1', nome: 'Lasagne della casa', prezzo: 12.50 },
        { id: '2', nome: 'Risotto ai funghi porcini', prezzo: 10.00 },
        { id: '3', nome: 'Scaloppine al limone', prezzo: 15.00 },
        { id: '4', nome: 'Tiramisù fatto in casa', prezzo: 6.00 },
        { id: '5', nome: 'Panna cotta ai frutti di bosco', prezzo: 5.50 }
      ];
      setProducts(defaultProducts);
      setSelectedProducts(defaultProducts.map(p => ({ ...p, selected: false })));
      localStorage.setItem('catering-products', JSON.stringify(defaultProducts));
    }
  }, []);

  // Salva i prodotti nel localStorage quando cambiano
  useEffect(() => {
    if (products.length > 0) {
      localStorage.setItem('catering-products', JSON.stringify(products));
    }
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

  const deselectAllProducts = () => {
    setSelectedProducts(prev =>
      prev.map(product => ({ ...product, selected: false }))
    );
    toast({
      title: "Selezione rimossa",
      description: "Tutti gli alimenti sono stati deselezionati",
    });
  };

  const handlePeopleInputChange = (value: string) => {
    setPeopleInput(value);
    const num = parseInt(value) || 0;
    if (num > 0) {
      setNumberOfPeople(num);
    }
  };

  const clearPeopleInput = () => {
    setPeopleInput('');
    setNumberOfPeople(1);
  };

  const addProduct = (nome: string, prezzo: number) => {
    const newProduct = {
      id: Date.now().toString(),
      nome,
      prezzo
    };
    
    setProducts(prev => [...prev, newProduct]);
    setSelectedProducts(prev => [...prev, { ...newProduct, selected: false }]);
    
    toast({
      title: "Prodotto aggiunto",
      description: `${nome} è stato aggiunto al menu`,
    });
  };

  const removeProduct = (productId: string) => {
    setProducts(prev => prev.filter(p => p.id !== productId));
    setSelectedProducts(prev => prev.filter(p => p.id !== productId));
    
    toast({
      title: "Prodotto rimosso",
      description: "Il prodotto è stato rimosso dal menu",
    });
  };

  const importProducts = (importedProducts: Product[]) => {
    setProducts(importedProducts);
    setSelectedProducts(importedProducts.map(p => ({ ...p, selected: false })));
    
    toast({
      title: "Prodotti importati",
      description: `${importedProducts.length} prodotti caricati dal CSV`,
    });
  };

  const calculateTotal = () => {
    const selectedTotal = selectedProducts
      .filter(product => product.selected)
      .reduce((sum, product) => sum + product.prezzo, 0);
    
    return selectedTotal * numberOfPeople;
  };

  const generateQuote = (filename: string) => {
    const selectedItems = selectedProducts.filter(p => p.selected);
    
    if (selectedItems.length === 0) {
      toast({
        title: "Nessun prodotto selezionato",
        description: "Seleziona almeno un prodotto per generare il preventivo",
        variant: "destructive"
      });
      return;
    }

    const currentDate = new Date().toLocaleDateString('it-IT');
    const subtotal = selectedItems.reduce((sum, product) => sum + product.prezzo, 0);
    const total = subtotal * numberOfPeople;

    // Crea PDF con paginazione dinamica
    const doc = new jsPDF();
    const pageHeight = 280; // Altezza utilizzabile della pagina
    const lineHeight = 8;
    const startY = 115; // Posizione Y iniziale per i prodotti
    
    const logoImg = new Image();
    logoImg.onload = function() {
      generatePdfContent();
    };
    logoImg.onerror = function() {
      generatePdfContent();
    };
    logoImg.src = '/lovable-uploads/2293249a-bf68-4522-8f20-970b1d6bdf43.png';

    const generatePdfContent = () => {
      let currentPage = 1;
      let yPosition = startY;

      // Genera la prima pagina con intestazione
      generateHeader();
      
      // Aggiungi prodotti con paginazione
      selectedItems.forEach((item, index) => {
        // Controlla se serve una nuova pagina
        if (yPosition > pageHeight - 40) { // Lascia spazio per il footer
          doc.addPage();
          currentPage++;
          yPosition = 30; // Reset Y position per la nuova pagina
          
          // Aggiungi header semplificato per le pagine successive
          doc.setFontSize(12);
          doc.setFont('helvetica', 'bold');
          doc.text('PREVENTIVO CATERING - Continua', 20, 20);
          doc.setLineWidth(0.3);
          doc.line(20, 25, 190, 25);
          yPosition = 40;
        }
        
        doc.setFontSize(11);
        doc.setFont('helvetica', 'normal');
        doc.text(`${index + 1}. ${item.nome}`, 25, yPosition);
        doc.text(`€${item.prezzo.toFixed(2)} per persona`, 130, yPosition);
        yPosition += lineHeight;
      });
      
      // Aggiungi riepilogo finale
      addSummarySection();
      
      // Salva il PDF
      doc.save(`${filename}.pdf`);

      toast({
        title: "Preventivo PDF generato",
        description: "Il file PDF è stato scaricato con successo",
      });
    };

    const generateHeader = () => {
      // Logo in alto a sinistra (se disponibile)
      if (logoImg.complete) {
        doc.addImage(logoImg, 'PNG', 20, 15, 40, 20);
      }
      
      // Intestazione
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.text('PREVENTIVO CATERING', 70, 30);
      
      // Linea separatrice
      doc.setLineWidth(0.5);
      doc.line(20, 40, 190, 40);
      
      // Informazioni cooperativa "i Piosi" - dati corretti
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text('Coop. Sociale I Piosi', 20, 55);
      doc.text('Via 2 Giugno, 11 – 37066 Sommacampagna (Verona)', 20, 63);
      doc.text('Tel: 045 515882 – Fax: 045 515480', 20, 71);
      doc.text('E-mail: info@ipiosi.it', 20, 79);
      
      // Data e numero persone
      doc.text(`Data: ${currentDate}`, 130, 55);
      doc.text(`Numero persone: ${numberOfPeople}`, 130, 63);
      
      // Titolo prodotti selezionati
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('PRODOTTI SELEZIONATI:', 20, 100);
    };

    const addSummarySection = () => {
      // Controlla se c'è spazio per il riepilogo
      if (yPosition > pageHeight - 60) {
        doc.addPage();
        yPosition = 30;
      }
      
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
      doc.text('Grazie per averci scelto per il vostro evento!', 20, yPosition);
      doc.text('Il preventivo è valido per 30 giorni dalla data di emissione.', 20, yPosition + 8);
      doc.text('La cooperativa sociale "i Piosi" si impegna per la qualità e la solidarietà.', 20, yPosition + 16);
    };

    // Se il logo non si carica entro 2 secondi, procedi comunque
    setTimeout(() => {
      if (!logoImg.complete) {
        generatePdfContent();
      }
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-yellow-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <UtensilsCrossed className="h-8 w-8 text-orange-600" />
            <h1 className="text-4xl font-bold text-gray-800">Catering Calculator</h1>
          </div>
          <p className="text-lg text-gray-600">Cooperativa Sociale "i Piosi" - Sommacampagna</p>
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
                {/* Pulsante Deseleziona Tutto */}
                {selectedProducts.some(p => p.selected) && (
                  <div className="mb-4 pb-4 border-b">
                    <Button
                      onClick={deselectAllProducts}
                      variant="outline"
                      className="border-orange-500 text-orange-600 hover:bg-orange-50"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Deseleziona Tutto
                    </Button>
                  </div>
                )}

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
                <div className="grid grid-cols-2 gap-3 mt-6 pt-6 border-t">
                  <Button
                    onClick={() => setIsAddDialogOpen(true)}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Aggiungi
                  </Button>
                  <Button
                    onClick={() => setIsRemoveDialogOpen(true)}
                    variant="outline"
                    className="border-red-500 text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Rimuovi
                  </Button>
                  <Button
                    onClick={() => setIsCsvDialogOpen(true)}
                    variant="outline"
                    className="col-span-2 border-blue-500 text-blue-600 hover:bg-blue-50"
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Gestione CSV
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
                  <div className="flex items-center space-x-2">
                    <Input
                      id="people-count"
                      type="number"
                      min="1"
                      placeholder="Inserisci numero"
                      value={peopleInput}
                      onChange={(e) => handlePeopleInputChange(e.target.value)}
                      className="text-xl font-bold text-center border-2 border-blue-300 focus:border-blue-500 flex-1"
                    />
                    <Button
                      onClick={clearPeopleInput}
                      variant="outline"
                      size="icon"
                      className="border-blue-300 text-blue-600 hover:bg-blue-50"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-sm text-gray-600">
                    Partecipanti confermati: <span className="font-semibold">{numberOfPeople}</span>
                  </p>
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
                  onClick={() => setIsExportDialogOpen(true)}
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
        onAddProduct={addProduct}
      />
      
      <RemoveProductDialog
        open={isRemoveDialogOpen}
        onOpenChange={setIsRemoveDialogOpen}
        products={products}
        onRemoveProduct={removeProduct}
      />

      <ExportDialog
        open={isExportDialogOpen}
        onOpenChange={setIsExportDialogOpen}
        onExport={generateQuote}
      />

      <CsvImportExportDialog
        open={isCsvDialogOpen}
        onOpenChange={setIsCsvDialogOpen}
        products={products}
        onImportProducts={importProducts}
      />
    </div>
  );
};

export default Index;
