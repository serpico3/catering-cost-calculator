
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

export interface Product {
  id: string;
  nome: string;
  prezzo: number;
}

export interface SelectedProduct extends Product {
  selected: boolean;
}

export const useProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<SelectedProduct[]>([]);
  const { toast } = useToast();

  // Load products from localStorage on mount
  useEffect(() => {
    const savedProducts = localStorage.getItem('catering-products');
    if (savedProducts) {
      const parsedProducts = JSON.parse(savedProducts);
      setProducts(parsedProducts);
      setSelectedProducts(parsedProducts.map((p: Product) => ({ ...p, selected: false })));
    } else {
      // Default products
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

  // Save products to localStorage when they change
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

  const editProduct = (id: string, nome: string, prezzo: number) => {
    setProducts(prev => 
      prev.map(p => p.id === id ? { ...p, nome, prezzo } : p)
    );
    setSelectedProducts(prev => 
      prev.map(p => p.id === id ? { ...p, nome, prezzo } : p)
    );
    
    toast({
      title: "Prodotto modificato",
      description: `${nome} è stato modificato con successo`,
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

  return {
    products,
    selectedProducts,
    toggleProductSelection,
    deselectAllProducts,
    addProduct,
    editProduct,
    removeProduct,
    importProducts
  };
};
