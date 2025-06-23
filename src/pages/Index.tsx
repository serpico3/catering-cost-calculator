
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Trash2, FileDown, UtensilsCrossed } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import AddProductDialog from '@/components/AddProductDialog';
import RemoveProductDialog from '@/components/RemoveProductDialog';

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
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isRemoveDialogOpen, setIsRemoveDialogOpen] = useState(false);
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

  const calculateTotal = () => {
    const selectedTotal = selectedProducts
      .filter(product => product.selected)
      .reduce((sum, product) => sum + product.prezzo, 0);
    
    return selectedTotal * numberOfPeople;
  };

  const generateQuote = () => {
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

    const quoteContent = `
PREVENTIVO CATERING
==================

Azienda: Delizie & Sapori Catering
Indirizzo: Via Roma 123, Milano
Telefono: 02-1234567
Email: info@deliziesapori.it

Data: ${currentDate}
Numero persone: ${numberOfPeople}

PRODOTTI SELEZIONATI:
${selectedItems.map(item => 
  `- ${item.nome}: €${item.prezzo.toFixed(2)} per persona`
).join('\n')}

RIEPILOGO:
Subtotale per persona: €${subtotal.toFixed(2)}
Numero persone: ${numberOfPeople}
TOTALE COMPLESSIVO: €${total.toFixed(2)}

Grazie per averci scelto!
Il preventivo è valido per 30 giorni.
    `.trim();

    // Scarica il file
    const blob = new Blob([quoteContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `preventivo-catering-${currentDate.replace(/\//g, '-')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Preventivo generato",
      description: "Il file è stato scaricato con successo",
    });
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
                  onClick={generateQuote}
                  className="w-full mt-6 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-lg py-3"
                  disabled={!selectedProducts.some(p => p.selected)}
                >
                  <FileDown className="h-5 w-5 mr-2" />
                  Genera Preventivo
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
    </div>
  );
};

export default Index;
