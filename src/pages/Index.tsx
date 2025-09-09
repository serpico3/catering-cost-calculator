
import React, { useState } from 'react';
import { UtensilsCrossed } from 'lucide-react';
import { useProducts } from '@/hooks/useProducts';
import { usePdfGenerator } from '@/hooks/usePdfGenerator';
import { useDynamicFixedCosts } from '@/hooks/useDynamicFixedCosts';
import ProductList from '@/components/ProductList';
import PeopleCounter from '@/components/PeopleCounter';
import QuoteSummary from '@/components/QuoteSummary';

const Index = () => {
  const [numberOfPeople, setNumberOfPeople] = useState<number>(1);
  const [peopleInput, setPeopleInput] = useState<string>('1');
  
  const {
    products,
    selectedProducts,
    toggleProductSelection,
    deselectAllProducts,
    addProduct,
    editProduct,
    removeProduct,
    importProducts
  } = useProducts();

  const { generateQuote, generateInternalQuote } = usePdfGenerator();
  const { fixedCosts, addFixedCost, updateFixedCost, removeFixedCost } = useDynamicFixedCosts();

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
          {/* Product List */}
          <div className="lg:col-span-2">
            <ProductList
              selectedProducts={selectedProducts}
              products={products}
              onToggleSelection={toggleProductSelection}
              onDeselectAll={deselectAllProducts}
              onAddProduct={addProduct}
              onEditProduct={editProduct}
              onRemoveProduct={removeProduct}
              onImportProducts={importProducts}
            />
          </div>

          {/* Calculation Panel */}
          <div className="space-y-6">
            {/* People Counter */}
            <PeopleCounter
              numberOfPeople={numberOfPeople}
              peopleInput={peopleInput}
              onPeopleInputChange={handlePeopleInputChange}
              onClearInput={clearPeopleInput}
            />

            {/* Quote Summary */}
            <QuoteSummary
              selectedProducts={selectedProducts}
              numberOfPeople={numberOfPeople}
              fixedCosts={fixedCosts}
              onGenerateQuote={generateQuote}
              onGenerateInternalQuote={generateInternalQuote}
              onAddFixedCost={addFixedCost}
              onUpdateFixedCost={updateFixedCost}
              onRemoveFixedCost={removeFixedCost}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
