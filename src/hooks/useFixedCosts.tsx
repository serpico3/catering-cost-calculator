import { useState, useEffect } from 'react';

export interface FixedCosts {
  foodLoop: number;
  panche: number;
  personale: number;
}

export const useFixedCosts = () => {
  const [fixedCosts, setFixedCosts] = useState<FixedCosts>({
    foodLoop: 100,
    panche: 50,
    personale: 120
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