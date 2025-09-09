import { useState, useEffect } from 'react';

export interface FixedCostItem {
  id: string;
  nome: string;
  costo: number;
}

export const useDynamicFixedCosts = () => {
  const [fixedCosts, setFixedCosts] = useState<FixedCostItem[]>([
    { id: '1', nome: 'Food loop', costo: 100 },
    { id: '2', nome: 'Panche', costo: 50 },
    { id: '3', nome: 'Personale', costo: 120 }
  ]);

  // Load fixed costs from localStorage on mount
  useEffect(() => {
    const savedCosts = localStorage.getItem('catering-dynamic-fixed-costs');
    if (savedCosts) {
      const parsedCosts = JSON.parse(savedCosts);
      setFixedCosts(parsedCosts);
    }
  }, []);

  // Save fixed costs to localStorage when they change
  useEffect(() => {
    localStorage.setItem('catering-dynamic-fixed-costs', JSON.stringify(fixedCosts));
  }, [fixedCosts]);

  const addFixedCost = (nome: string, costo: number) => {
    const newCost = {
      id: Date.now().toString(),
      nome,
      costo
    };
    setFixedCosts(prev => [...prev, newCost]);
  };

  const updateFixedCost = (id: string, nome: string, costo: number) => {
    setFixedCosts(prev => 
      prev.map(item => item.id === id ? { ...item, nome, costo } : item)
    );
  };

  const removeFixedCost = (id: string) => {
    setFixedCosts(prev => prev.filter(item => item.id !== id));
  };

  const getTotalFixedCosts = () => {
    return fixedCosts.reduce((total, item) => total + item.costo, 0);
  };

  return {
    fixedCosts,
    addFixedCost,
    updateFixedCost,
    removeFixedCost,
    getTotalFixedCosts
  };
};