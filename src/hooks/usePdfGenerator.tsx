
import jsPDF from 'jspdf';
import { useToast } from '@/hooks/use-toast';
import { SelectedProduct } from './useProducts';
import { FixedCosts } from './useFixedCosts';

export const usePdfGenerator = () => {
  const { toast } = useToast();

  const generateQuote = (filename: string, selectedProducts: SelectedProduct[], numberOfPeople: number, fixedCosts: FixedCosts) => {
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
    const totalFixedCosts = fixedCosts.foodLoop + fixedCosts.panche + fixedCosts.personale;
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
      
      // Add products with pagination
      selectedItems.forEach((item, index) => {
        // Check if new page is needed
        if (yPosition > pageHeight - 40) {
          doc.addPage();
          currentPage++;
          yPosition = 30;
          
          // Add simplified header for subsequent pages
          doc.setFontSize(12);
          doc.setFont('helvetica', 'bold');
          doc.text('PREVENTIVO CATERING - Continua', 20, 20);
          doc.setLineWidth(0.3);
          doc.line(20, 25, 190, 25);
          yPosition = 40;
        }
        
        doc.setFontSize(11);
        doc.setFont('helvetica', 'normal');
        doc.text(`${index + 1}. ${item.nome}`, 25, yPosition);
        yPosition += lineHeight;
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
      
      // Header
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.text('PREVENTIVO CATERING', 70, 30);
      
      // Separator line
      doc.setLineWidth(0.5);
      doc.line(20, 40, 190, 40);
      
      // Cooperative "i Piosi" info - correct data
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text('Coop. Sociale I Piosi', 20, 55);
      doc.text('Via 2 Giugno, 11 – 37066 Sommacampagna (Verona)', 20, 63);
      doc.text('Tel: 045 515882 – Fax: 045 515480', 20, 71);
      doc.text('E-mail: info@ipiosi.it', 20, 79);
      
      // Date and number of people
      doc.text(`Data: ${currentDate}`, 130, 55);
      doc.text(`Numero persone: ${numberOfPeople}`, 130, 63);
      
      // Selected products title
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('PRODOTTI SELEZIONATI:', 20, 100);
    };

    const addSummarySection = () => {
      // Check if there's space for summary
      if (yPosition > pageHeight - 80) {
        doc.addPage();
        yPosition = 30;
      }
      
      yPosition += 10;
      doc.setLineWidth(0.3);
      doc.line(20, yPosition, 190, yPosition);
      yPosition += 15;
      
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text(`Subtotale per persona: €${subtotal.toFixed(2)}`, 20, yPosition);
      yPosition += 8;
      doc.text(`Numero persone: ${numberOfPeople}`, 20, yPosition);
      yPosition += 8;
      doc.text(`Subtotale cibo: €${totalFood.toFixed(2)}`, 20, yPosition);
      yPosition += 8;
      doc.text(`Food Loop: €${fixedCosts.foodLoop.toFixed(2)}`, 20, yPosition);
      yPosition += 8;
      doc.text(`Panche: €${fixedCosts.panche.toFixed(2)}`, 20, yPosition);
      yPosition += 8;
      doc.text(`Personale: €${fixedCosts.personale.toFixed(2)}`, 20, yPosition);
      yPosition += 15;
      
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text(`TOTALE COMPLESSIVO: €${grandTotal.toFixed(2)} (IVA ESCLUSA)`, 20, yPosition);
      
      // Additional notes
      yPosition += 20;
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text('NOTE IMPORTANTI:', 20, yPosition);
      yPosition += 8;
      doc.text('• Il servizio verrà fornito con materiale usa e getta riciclabile', 20, yPosition);
      yPosition += 6;
      doc.text('• Per l\'utilizzo di stoviglie di diverso genere, contattare per', 20, yPosition);
      yPosition += 6;
      doc.text('  una modifica al preventivo', 20, yPosition);
      
      // Footer
      yPosition += 15;
      doc.setFontSize(10);
      doc.setFont('helvetica', 'italic');
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

  const generateInternalQuote = (filename: string, selectedProducts: SelectedProduct[], numberOfPeople: number, fixedCosts: FixedCosts) => {
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
    const totalFixedCosts = fixedCosts.foodLoop + fixedCosts.panche + fixedCosts.personale;
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
      doc.text(`Costi fissi totali: €${totalFixedCosts.toFixed(2)}`, 20, 86);
      
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
      doc.text(`Costi fissi totali: €${totalFixedCosts.toFixed(2)}`, 20, yPosition);
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
