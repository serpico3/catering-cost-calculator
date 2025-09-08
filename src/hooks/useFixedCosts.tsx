import { useState, useEffect } from 'react';

export interface FixedCosts {
  camioncino: number;
  furgone: number;
}

export const useFixedCosts = () => {
  const [fixedCosts, setFixedCosts] = useState<FixedCosts>({
    camioncino: 50,
    furgone: 80
  });

  // Load fixed costs from localStorage on mount
  useEffect(() => {
    const savedCosts = localStorage.getItem('catering-fixed-costs');
    if (savedCosts) {
      const parsedCosts = JSON.parse(savedCosts);
      setFixedCosts(parsedCosts);
    }
  }, []);

  // Save fixed costs to localStorage when they change
  useEffect(() => {
    localStorage.setItem('catering-fixed-costs', JSON.stringify(fixedCosts));
  }, [fixedCosts]);

  const updateFixedCosts = (newCosts: FixedCosts) => {
    setFixedCosts(newCosts);
  };

  return {
    fixedCosts,
    updateFixedCosts
  };
};