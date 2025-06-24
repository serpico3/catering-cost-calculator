
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

export interface Product {
  id: string;
  nome: string;
  prezzo: number;
  created_at?: string;
}

// Simulate API calls with localStorage
const mockApi = {
  getProducts: async (): Promise<Product[]> => {
    const stored = localStorage.getItem('catering-products');
    if (stored) {
      return JSON.parse(stored);
    }
    return [];
  },
  
  addProduct: async (product: { nome: string; prezzo: number }): Promise<Product> => {
    const stored = localStorage.getItem('catering-products');
    const products: Product[] = stored ? JSON.parse(stored) : [];
    
    const newProduct: Product = {
      id: crypto.randomUUID(),
      nome: product.nome,
      prezzo: product.prezzo,
      created_at: new Date().toISOString()
    };
    
    products.push(newProduct);
    localStorage.setItem('catering-products', JSON.stringify(products));
    
    return newProduct;
  },
  
  removeProduct: async (productId: string): Promise<void> => {
    const stored = localStorage.getItem('catering-products');
    const products: Product[] = stored ? JSON.parse(stored) : [];
    
    const filteredProducts = products.filter(p => p.id !== productId);
    localStorage.setItem('catering-products', JSON.stringify(filteredProducts));
  }
};

export const useProducts = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Query per ottenere tutti i prodotti
  const { data: products = [], isLoading, error } = useQuery({
    queryKey: ['products'],
    queryFn: mockApi.getProducts,
  });

  // Mutation per aggiungere un prodotto
  const addProductMutation = useMutation({
    mutationFn: mockApi.addProduct,
    onSuccess: (newProduct) => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast({
        title: "Prodotto aggiunto",
        description: `${newProduct.nome} è stato aggiunto al menu`,
      });
    },
    onError: (error) => {
      console.error('Errore nell\'aggiunta del prodotto:', error);
      toast({
        title: "Errore",
        description: "Impossibile aggiungere il prodotto",
        variant: "destructive"
      });
    }
  });

  // Mutation per rimuovere un prodotto
  const removeProductMutation = useMutation({
    mutationFn: mockApi.removeProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast({
        title: "Prodotto rimosso",
        description: "Il prodotto è stato rimosso dal menu",
      });
    },
    onError: (error) => {
      console.error('Errore nella rimozione del prodotto:', error);
      toast({
        title: "Errore",
        description: "Impossibile rimuovere il prodotto",
        variant: "destructive"
      });
    }
  });

  // Inizializza i prodotti di default se non ce ne sono
  const initializeDefaultProducts = async () => {
    if (products.length === 0 && !isLoading) {
      const defaultProducts = [
        { nome: 'Lasagne della casa', prezzo: 12.50 },
        { nome: 'Risotto ai funghi porcini', prezzo: 10.00 },
        { nome: 'Scaloppine al limone', prezzo: 15.00 },
        { nome: 'Tiramisù fatto in casa', prezzo: 6.00 },
        { nome: 'Panna cotta ai frutti di bosco', prezzo: 5.50 }
      ];

      for (const product of defaultProducts) {
        addProductMutation.mutate(product);
      }
    }
  };

  useEffect(() => {
    if (!isLoading && products.length === 0) {
      initializeDefaultProducts();
    }
  }, [isLoading, products.length]);

  return {
    products,
    isLoading,
    error,
    addProduct: addProductMutation.mutate,
    removeProduct: removeProductMutation.mutate,
    isAddingProduct: addProductMutation.isPending,
    isRemovingProduct: removeProductMutation.isPending,
  };
};
