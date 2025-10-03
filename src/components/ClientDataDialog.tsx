import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

export interface ClientData {
  nomeCliente: string;
  referente: string;
  email: string;
  telefono: string;
  titoloEvento: string;
  dataEvento: string;
  luogo: string;
  noteAggiuntive: string;
}

interface ClientDataDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: ClientData) => void;
}

export const ClientDataDialog = ({ open, onOpenChange, onSubmit }: ClientDataDialogProps) => {
  const [formData, setFormData] = useState<ClientData>({
    nomeCliente: '',
    referente: '',
    email: '',
    telefono: '',
    titoloEvento: '',
    dataEvento: '',
    luogo: '',
    noteAggiuntive: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    onOpenChange(false);
  };

  const handleChange = (field: keyof ClientData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Dati Cliente per Preventivo</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nomeCliente">Nome Cliente/Azienda *</Label>
              <Input
                id="nomeCliente"
                value={formData.nomeCliente}
                onChange={(e) => handleChange('nomeCliente', e.target.value)}
                placeholder="es. CINI - Consorzio"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="referente">Referente *</Label>
              <Input
                id="referente"
                value={formData.referente}
                onChange={(e) => handleChange('referente', e.target.value)}
                placeholder="es. Dott.ssa Cristina Rossi"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                placeholder="email@esempio.it"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="telefono">Telefono</Label>
              <Input
                id="telefono"
                type="tel"
                value={formData.telefono}
                onChange={(e) => handleChange('telefono', e.target.value)}
                placeholder="340 1234567"
              />
            </div>

            <div className="space-y-2 col-span-2">
              <Label htmlFor="titoloEvento">Titolo/Descrizione Evento *</Label>
              <Input
                id="titoloEvento"
                value={formData.titoloEvento}
                onChange={(e) => handleChange('titoloEvento', e.target.value)}
                placeholder="es. Servizio Catering c/o sede 311"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dataEvento">Data Evento *</Label>
              <Input
                id="dataEvento"
                value={formData.dataEvento}
                onChange={(e) => handleChange('dataEvento', e.target.value)}
                placeholder="es. 22-24/04/25 o 17/05/25"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="luogo">Luogo</Label>
              <Input
                id="luogo"
                value={formData.luogo}
                onChange={(e) => handleChange('luogo', e.target.value)}
                placeholder="es. Dossobuono"
              />
            </div>

            <div className="space-y-2 col-span-2">
              <Label htmlFor="noteAggiuntive">Note Aggiuntive</Label>
              <Textarea
                id="noteAggiuntive"
                value={formData.noteAggiuntive}
                onChange={(e) => handleChange('noteAggiuntive', e.target.value)}
                placeholder="Informazioni aggiuntive sull'evento..."
                rows={3}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annulla
            </Button>
            <Button type="submit">
              Genera Preventivo
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
