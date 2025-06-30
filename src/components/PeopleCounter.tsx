
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { X } from 'lucide-react';

interface PeopleCounterProps {
  numberOfPeople: number;
  peopleInput: string;
  onPeopleInputChange: (value: string) => void;
  onClearInput: () => void;
}

const PeopleCounter = ({ 
  numberOfPeople, 
  peopleInput, 
  onPeopleInputChange, 
  onClearInput 
}: PeopleCounterProps) => {
  return (
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
              onChange={(e) => onPeopleInputChange(e.target.value)}
              className="text-xl font-bold text-center border-2 border-blue-300 focus:border-blue-500 flex-1"
            />
            <Button
              onClick={onClearInput}
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
  );
};

export default PeopleCounter;
