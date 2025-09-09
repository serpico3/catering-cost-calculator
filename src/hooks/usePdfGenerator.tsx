
import jsPDF from 'jspdf';
import { useToast } from '@/hooks/use-toast';
import { SelectedProduct } from './useProducts';
import { FixedCostItem } from './useDynamicFixedCosts';

export const usePdfGenerator = () => {
  const { toast } = useToast();

  const generateQuote = (filename: string, selectedProducts: SelectedProduct[], numberOfPeople: number, fixedCosts: FixedCostItem[], includeFixedCostsInQuote: boolean = true) => {
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
    const totalFixedCosts = fixedCosts.reduce((sum, item) => sum + item.costo, 0);
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
      yPosition = startY;

      // Generate header
      generateHeader();
      
      // Add menu proposal section
      addMenuProposal();
      
      // Add service details
      addServiceDetails();
      
      // Add payment info
      addPaymentInfo();
      
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
      
      // Header box for event details
      doc.setDrawColor(0, 128, 0);
      doc.setFillColor(200, 255, 200);
      doc.rect(120, 15, 70, 25, 'FD');
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('BUFFET INAUGURAZIONE APP.TO', 122, 22);
      doc.text(`Piccola Fraternità Dossobuono`, 122, 28);
      doc.text(`Data: ${currentDate}`, 122, 34);
      
      // Client reference
      yPosition = 50;
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text('Riferimenti Cliente:', 20, yPosition);
      yPosition += 6;
      doc.text('Fond. Piccola Fraternità Dossobuono', 20, yPosition);
      yPosition += 6;
      doc.text('dott. Stefano Manara', 20, yPosition);
      yPosition += 10;
      doc.text('mail: direzione@piccolafraternita.it', 20, yPosition);
      yPosition += 6;
      doc.text('tel. 3407919363', 20, yPosition);
      
      yPosition = 90;
    };

    const addMenuProposal = () => {
      // Menu proposal header
      doc.setDrawColor(255, 165, 0);
      doc.setFillColor(255, 220, 180);
      doc.rect(20, yPosition, 170, 8, 'FD');
      
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Proposta Menù Food Loop', 25, yPosition + 6);
      
      yPosition += 20;
      
      // Cost per person
      const totalPerPerson = selectedItems.reduce((sum, product) => sum + product.prezzo, 0);
      const finalTotal = includeFixedCostsInQuote ? 
        (totalPerPerson * numberOfPeople) + fixedCosts.reduce((sum, item) => sum + item.costo, 0) :
        totalPerPerson * numberOfPeople;
      const costPerPerson = finalTotal / numberOfPeople;
      
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text(`Costo: ${costPerPerson.toFixed(2)} €/persona IVA comp.`, 20, yPosition);
      
      yPosition += 15;
      
      // Menu description
      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      
      const menuItems = selectedItems.map(item => item.nome).join(', ');
      
      // Aperitivo section
      doc.text('Aperitivo misto con personale', 20, yPosition);
      yPosition += 8;
      doc.text(`Finger food: ${menuItems}`, 20, yPosition);
      yPosition += 6;
      doc.text('mortadella cubi con focaccia, voulevant ai', 20, yPosition);
      yPosition += 6;
      doc.text('funghi, patatine, salatini caldi, formaggio', 20, yPosition);
      yPosition += 6;
      doc.text('Grana a scaglie, Monte Vr sg, ecc.', 20, yPosition);
      yPosition += 6;
      doc.text('Cous cous.', 20, yPosition);
      
      yPosition += 10;
      
      // Primo piatto/Dolci
      doc.text('Primo piatto', 20, yPosition);
      doc.text('torta della casa', 80, yPosition);
      yPosition += 6;
      doc.text('Dolci:', 20, yPosition);
      doc.text('Bibite analcoliche, cocktail analcolici e alcolici,', 80, yPosition);
      yPosition += 6;
      doc.text('acqua (naturale e frizzante), vino mosso e', 80, yPosition);
      yPosition += 6;
      doc.text('liscio', 80, yPosition);
      
      yPosition += 10;
      
      // Materiale BIO
      doc.text('Materiale BIO e tovagliato', 20, yPosition);
      doc.text('Piatto Ovale Bio; Forchetta + tov. BIO;', 80, yPosition);
      yPosition += 6;
      doc.text('(piatti, bicchieri, tovaglioli)', 20, yPosition);
      doc.text('Bicchiere Acqua; Tovaglie rettangolari', 80, yPosition);
      yPosition += 6;
      doc.text('Calici di vetro', 80, yPosition);
      yPosition += 6;
      doc.text('Tovagliato', 80, yPosition);
      
      yPosition += 15;
    };

    const addServiceDetails = () => {
      // Previsionale section
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text('Previsionale per minimo di', 20, yPosition);
      doc.text(`${numberOfPeople} persone`, 80, yPosition);
      doc.text('persone', 20, yPosition + 6);
      
      yPosition += 15;
      
      doc.setFont('helvetica', 'normal');
      doc.text('Allestimento due/tre tavoli (Food Loop) con presenza di nostri operatori addetti', 20, yPosition);
      yPosition += 6;
      doc.text('alla somministrazione', 20, yPosition);
      
      yPosition += 10;
      
      doc.text('Sarà presente il food truck, pertanto sarà necessaria una presa di corrente 220V', 20, yPosition);
      
      yPosition += 15;
    };

    const addPaymentInfo = () => {
      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      doc.text('Pagamento tramite bonifico bancario previa FATTURA.', 20, yPosition);
      yPosition += 8;
      doc.setFont('helvetica', 'bold');
      doc.text('Si prega dare conferma entro e non oltre 5gg dal preventivo.', 20, yPosition);
      
      yPosition += 20;
      
      // Total section
      const finalTotal = includeFixedCostsInQuote ? 
        (selectedItems.reduce((sum, product) => sum + product.prezzo, 0) * numberOfPeople) + fixedCosts.reduce((sum, item) => sum + item.costo, 0) :
        selectedItems.reduce((sum, product) => sum + product.prezzo, 0) * numberOfPeople;
      
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text(`TOTALE COMPLESSIVO: €${finalTotal.toFixed(2)}`, 20, yPosition);
      
      yPosition += 15;
      
      // Footer
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text('Grazie per averci scelto per il vostro evento!', 20, yPosition);
      doc.text('Il preventivo è valido per 30 giorni dalla data di emissione.', 20, yPosition + 8);
      doc.text('La cooperativa sociale "i Piosi" si impegna per la qualità e la solidarietà.', 20, yPosition + 16);
    };

    // If logo doesn't load within 2 seconds, proceed anyway
    setTimeout(() => {
      if (!logoImg.complete) {
        generatePdfContent();
      }
    }, 2000);
  };

  const generateInternalQuote = (filename: string, selectedProducts: SelectedProduct[], numberOfPeople: number, fixedCosts: FixedCostItem[]) => {
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
