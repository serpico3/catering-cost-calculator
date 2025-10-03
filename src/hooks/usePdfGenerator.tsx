
import jsPDF from 'jspdf';
import { useToast } from '@/hooks/use-toast';
import { SelectedProduct } from './useProducts';
import { FixedCostItem } from './useDynamicFixedCosts';
import { ClientData } from '@/components/ClientDataDialog';

export const usePdfGenerator = () => {
  const { toast } = useToast();

  const generateQuote = (
    filename: string, 
    selectedProducts: SelectedProduct[], 
    numberOfPeople: number, 
    fixedCosts: FixedCostItem[], 
    includeFixedCostsInQuote: boolean,
    clientData: ClientData
  ) => {
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
    const totalFood = subtotal * numberOfPeople;
    const totalFixedCosts = includeFixedCostsInQuote ? fixedCosts.reduce((sum, item) => sum + item.costo, 0) : 0;
    const grandTotal = totalFood + totalFixedCosts;

    // Create PDF with dynamic pagination
    const doc = new jsPDF();
    const pageHeight = 280;
    const lineHeight = 8;
    const startY = 115;
    let yPosition = startY;
    
    const logoImg = new Image();
    logoImg.onload = function() {
      generatePdfContent();
    };
    logoImg.onerror = function() {
      generatePdfContent();
    };
    logoImg.src = '/lovable-uploads/1f82fa2a-8709-4f33-b544-f2e8f1eeec61.png';

    const generatePdfContent = () => {
      let currentPage = 1;
      yPosition = startY;

      // Generate first page with header
      generateHeader();
      
      // Menu proposal section
      doc.setFontSize(13);
      doc.setFont('helvetica', 'bold');
      doc.text('Proposta Menù Food Loop', 20, yPosition);
      yPosition += 10;
      
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text(`Costo: ${subtotal.toFixed(2)} €/persona IVA comp.`, 20, yPosition);
      yPosition += 10;
      
      // Add products
      doc.setFont('helvetica', 'normal');
      selectedItems.forEach((item, index) => {
        // Check if new page is needed
        if (yPosition > pageHeight - 40) {
          doc.addPage();
          currentPage++;
          yPosition = 30;
        }
        
        doc.text(`• ${item.nome}`, 25, yPosition);
        yPosition += 6;
      });
      
      // Add final summary
      addSummarySection();
      
      // Save PDF
      doc.save(`preventivo-${filename}.pdf`);

      toast({
        title: "Preventivo PDF generato",
        description: "Il file PDF è stato scaricato con successo",
      });
    };

    const generateHeader = () => {
      // Logo at top left (if available)
      if (logoImg.complete) {
        doc.addImage(logoImg, 'PNG', 20, 15, 40, 20);
      }
      
      // Title on the right
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('LO STREET FOOD. CIRCOLARE!', 105, 25);
      
      // Event title
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text(clientData.titoloEvento.toUpperCase(), 20, 50);
      
      // Client references section
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text('Riferimenti Cliente:', 20, 62);
      
      doc.setFont('helvetica', 'normal');
      let yPos = 70;
      doc.text(clientData.nomeCliente, 20, yPos);
      yPos += 6;
      doc.text(clientData.referente, 20, yPos);
      yPos += 6;
      doc.text(`mail: ${clientData.email}`, 20, yPos);
      if (clientData.telefono) {
        yPos += 6;
        doc.text(`tel: ${clientData.telefono}`, 20, yPos);
      }
      
      yPosition = yPos + 15;
    };

    const addSummarySection = () => {
      // Check if there's space for summary
      if (yPosition > pageHeight - 100) {
        doc.addPage();
        yPosition = 30;
      }
      
      yPosition += 10;
      
      // Additional notes
      if (clientData.noteAggiuntive) {
        doc.setFontSize(10);
        doc.setFont('helvetica', 'italic');
        const lines = doc.splitTextToSize(clientData.noteAggiuntive, 170);
        doc.text(lines, 20, yPosition);
        yPosition += (lines.length * 5) + 10;
      }
      
      // Total persons info
      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      doc.text(`Previsionale per minimo di ${numberOfPeople} persone`, 20, yPosition);
      yPosition += 10;
      
      // Service details
      const serviceDetails = [
        'Allestimento due/tre tavoli (Food Loop) con presenza di nostri operatori addetti alla somministrazione',
        '',
        'Sarà presente il food truck, pertanto sarà necessaria una presa di corrente 220V',
        '',
        'Pagamento tramite bonifico bancario previa FATTURA.',
        '',
        'Si prega dare conferma entro e non oltre 5gg dal preventivo.'
      ];
      
      serviceDetails.forEach(detail => {
        if (yPosition > pageHeight - 20) {
          doc.addPage();
          yPosition = 30;
        }
        if (detail) {
          const lines = doc.splitTextToSize(detail, 170);
          doc.text(lines, 20, yPosition);
          yPosition += (lines.length * 5) + 2;
        } else {
          yPosition += 5;
        }
      });
      
      // Footer with company info
      yPosition += 10;
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      const footerText = 'I PIOSI Società Cooperativa Sociale - 37066 SOMMACAMPAGNA (VR) - Via 2 Giugno, 11 - Telefono 045 515882 / Fax 045 515480 - e-mail: info@ipiosi.it';
      const footerText2 = 'Codice Fiscale / Partita IVA 02198320232 – Iscrizione Tribunale VR n° 30159 - R.e.a. N° 222968 – Albo Società Cooperative A104500';
      
      doc.text(footerText, 105, yPosition, { align: 'center' });
      yPosition += 4;
      doc.text(footerText2, 105, yPosition, { align: 'center' });
    };

    // If logo doesn't load within 2 seconds, proceed anyway
    setTimeout(() => {
      if (!logoImg.complete) {
        generatePdfContent();
      }
    }, 2000);
  };

  const generateInternalQuote = (filename: string, selectedProducts: SelectedProduct[], numberOfPeople: number, fixedCosts: FixedCostItem[], clientData: ClientData) => {
    const selectedItems = selectedProducts.filter(p => p.selected);
    
    if (selectedItems.length === 0) {
      toast({
        title: "Nessun prodotto selezionato",
        description: "Seleziona almeno un prodotto per generare il preventivo interno",
        variant: "destructive"
      });
      return;
    }

    const currentDate = new Date().toLocaleDateString('it-IT');
    const subtotalSelling = selectedItems.reduce((sum, product) => sum + product.prezzo, 0);
    const subtotalProduction = selectedItems.reduce((sum, product) => sum + (product.costoProduzione || 0), 0);
    const totalFoodSelling = subtotalSelling * numberOfPeople;
    const totalFoodProduction = subtotalProduction * numberOfPeople;
    const totalFixedCosts = fixedCosts.reduce((sum, item) => sum + item.costo, 0);
    const grandTotalSelling = totalFoodSelling + totalFixedCosts;
    const totalCosts = totalFoodProduction + totalFixedCosts;
    const profit = grandTotalSelling - totalCosts;

    // Create PDF
    const doc = new jsPDF();
    const pageHeight = 280;
    const lineHeight = 8;
    const startY = 115;
    let yPosition = startY;
    
    const logoImg = new Image();
    logoImg.onload = function() {
      generateInternalPdfContent();
    };
    logoImg.onerror = function() {
      generateInternalPdfContent();
    };
    logoImg.src = '/lovable-uploads/1f82fa2a-8709-4f33-b544-f2e8f1eeec61.png';

    const generateInternalPdfContent = () => {
      let currentPage = 1;
      yPosition = startY;

      // Generate first page with header
      generateInternalHeader();
      
      // Add products with costs
      selectedItems.forEach((item, index) => {
        // Check if new page is needed
        if (yPosition > pageHeight - 60) {
          doc.addPage();
          currentPage++;
          yPosition = 30;
          
          // Add simplified header for subsequent pages
          doc.setFontSize(12);
          doc.setFont('helvetica', 'bold');
          doc.text('ANALISI PROFITTO CATERING - Continua', 20, 20);
          doc.setLineWidth(0.3);
          doc.line(20, 25, 190, 25);
          yPosition = 40;
        }
        
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text(`${index + 1}. ${item.nome}`, 25, yPosition);
        yPosition += 5;
        doc.text(`   Prezzo vendita: €${item.prezzo.toFixed(2)}`, 30, yPosition);
        yPosition += 5;
        doc.text(`   Costo produzione: €${(item.costoProduzione || 0).toFixed(2)}`, 30, yPosition);
        yPosition += 5;
        doc.text(`   Margine unitario: €${(item.prezzo - (item.costoProduzione || 0)).toFixed(2)}`, 30, yPosition);
        yPosition += 8;
      });
      
      // Add final analysis
      addInternalSummary();
      
      // Save PDF
      doc.save(`analisi-profitto-${filename}.pdf`);

      toast({
        title: "Analisi profitto generata",
        description: "Il file di analisi interna è stato scaricato con successo",
      });
    };

    const generateInternalHeader = () => {
      // Logo at top left (if available)
      if (logoImg.complete) {
        doc.addImage(logoImg, 'PNG', 20, 15, 40, 20);
      }
      
      // Header
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.text('ANALISI PROFITTO CATERING', 70, 30);
      
      // Separator line
      doc.setLineWidth(0.5);
      doc.line(20, 40, 190, 40);
      
      // Internal use warning
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(200, 0, 0);
      doc.text('*** DOCUMENTO AD USO INTERNO ***', 20, 55);
      doc.setTextColor(0, 0, 0);
      
      // Date and number of people
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text(`Data: ${currentDate}`, 20, 70);
      doc.text(`Numero persone: ${numberOfPeople}`, 20, 78);
      
      // Products title
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('DETTAGLIO COSTI E RICAVI:', 20, 100);
    };

    const addInternalSummary = () => {
      // Check if there's space for summary
      if (yPosition > pageHeight - 120) {
        doc.addPage();
        yPosition = 30;
      }
      
      yPosition += 10;
      doc.setLineWidth(0.3);
      doc.line(20, yPosition, 190, yPosition);
      yPosition += 15;
      
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('RIEPILOGO ECONOMICO:', 20, yPosition);
      yPosition += 10;
      
      doc.setFont('helvetica', 'normal');
      doc.text(`Ricavi cibo (${numberOfPeople} persone): €${totalFoodSelling.toFixed(2)}`, 20, yPosition);
      yPosition += 8;
      doc.text(`Costi produzione cibo: €${totalFoodProduction.toFixed(2)}`, 20, yPosition);
      yPosition += 8;
      
      // Fixed costs breakdown
      doc.text('Costi fissi:', 20, yPosition);
      yPosition += 6;
      fixedCosts.forEach((cost) => {
        doc.text(`  • ${cost.nome}: €${cost.costo.toFixed(2)}`, 25, yPosition);
        yPosition += 6;
      });
      doc.text(`Totale costi fissi: €${totalFixedCosts.toFixed(2)}`, 20, yPosition);
      yPosition += 8;
      doc.text(`Costi totali: €${totalCosts.toFixed(2)}`, 20, yPosition);
      yPosition += 15;
      
      // Profit/Loss
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      if (profit >= 0) {
        doc.setTextColor(0, 150, 0);
        doc.text(`PROFITTO: €${profit.toFixed(2)}`, 20, yPosition);
      } else {
        doc.setTextColor(200, 0, 0);
        doc.text(`PERDITA: €${Math.abs(profit).toFixed(2)}`, 20, yPosition);
      }
      doc.setTextColor(0, 0, 0);
      
      yPosition += 15;
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Margine di profitto: ${((profit / grandTotalSelling) * 100).toFixed(1)}%`, 20, yPosition);
    };

    // If logo doesn't load within 2 seconds, proceed anyway
    setTimeout(() => {
      if (!logoImg.complete) {
        generateInternalPdfContent();
      }
    }, 2000);
  };

  return { generateQuote, generateInternalQuote };
};
