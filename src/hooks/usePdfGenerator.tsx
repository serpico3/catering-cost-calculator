
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
    const filteredFixedCosts = includeFixedCostsInQuote ? fixedCosts : [];

    // Create PDF with dynamic pagination
    const doc = new jsPDF();
    const pageHeight = 280;
    const lineHeight = 8;
    const startY = 115;
    let yPosition = startY;
    
    // Convert image to base64 to avoid loading issues
    const logoImg = new Image();
    logoImg.crossOrigin = 'anonymous';
    
    const generatePdfContent = (logoLoaded: boolean = false) => {
      let currentPage = 1;
      yPosition = startY;

      // Generate first page with header
      generateHeader(logoLoaded);
      
      // Menu proposal section with better styling
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Proposta Menù Food Loop', 20, yPosition);
      yPosition += 12;
      
      // Price box with border
      doc.setDrawColor(0, 0, 0);
      doc.setLineWidth(0.5);
      const priceText = `Costo: € ${subtotal.toFixed(2)} /persona IVA esclusa`;
      doc.setFontSize(12);
      const textWidth = doc.getTextWidth(priceText);
      doc.rect(18, yPosition - 6, textWidth + 4, 10);
      doc.text(priceText, 20, yPosition);
      yPosition += 15;
      
      // Products list with better spacing
      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      selectedItems.forEach((item, index) => {
        // Check if new page is needed
        if (yPosition > pageHeight - 40) {
          doc.addPage();
          currentPage++;
          yPosition = 30;
        }
        
        doc.text(`• ${item.nome}`, 25, yPosition);
        yPosition += 7;
      });
      
      // Add final summary - ensure it's always visible
      addSummarySection();
      
      // Save PDF
      doc.save(`preventivo-${filename}.pdf`);

      toast({
        title: "Preventivo PDF generato",
        description: "Il file PDF è stato scaricato con successo",
      });
    };
    
    // Try to load logo with proper error handling
    logoImg.onload = function() {
      generatePdfContent(true);
    };
    logoImg.onerror = function() {
      console.warn('Logo could not be loaded, generating PDF without logo');
      generatePdfContent(false);
    };
    logoImg.src = '/lovable-uploads/1f82fa2a-8709-4f33-b544-f2e8f1eeec61.png';

    const generateHeader = (logoLoaded: boolean = false) => {
      // Logo at top left (only if loaded successfully) - ALWAYS DRAWN FIRST
      if (logoLoaded && logoImg.complete && logoImg.naturalWidth > 0) {
        try {
          doc.addImage(logoImg, 'PNG', 20, 15, 40, 20);
        } catch (e) {
          console.warn('Error adding logo to PDF:', e);
        }
      }
      
      // Title on the right with better styling
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.text('LO STREET FOOD. CIRCOLARE!', 105, 25);
      
      // Date on the right
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Data: ${currentDate}`, 190, 32, { align: 'right' });
      
      // Decorative line
      doc.setLineWidth(0.5);
      doc.line(20, 40, 190, 40);
      
      // Event title with text wrapping for long titles
      doc.setFontSize(15);
      doc.setFont('helvetica', 'bold');
      const eventTitleLines = doc.splitTextToSize(clientData.titoloEvento.toUpperCase(), 170);
      doc.text(eventTitleLines, 20, 52);
      
      // Client references section with better layout and text wrapping
      let yPos = 52 + (eventTitleLines.length * 7) + 8;
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text('Riferimenti Cliente:', 20, yPos);
      yPos += 8;
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      
      // Wrap long client name
      const clientNameLines = doc.splitTextToSize(clientData.nomeCliente, 170);
      doc.text(clientNameLines, 20, yPos);
      yPos += clientNameLines.length * 5 + 2;
      
      // Wrap long referente
      const referenteLines = doc.splitTextToSize(clientData.referente, 170);
      doc.text(referenteLines, 20, yPos);
      yPos += referenteLines.length * 5 + 2;
      
      // Wrap long email
      const emailLines = doc.splitTextToSize(`mail: ${clientData.email}`, 170);
      doc.text(emailLines, 20, yPos);
      yPos += emailLines.length * 5 + 2;
      
      if (clientData.telefono) {
        doc.text(`tel: ${clientData.telefono}`, 20, yPos);
        yPos += 6;
      }
      
      // Add event date
      if (clientData.dataEvento) {
        doc.text(`Data evento: ${clientData.dataEvento}`, 20, yPos);
        yPos += 6;
      }
      
      // Add location
      if (clientData.luogo) {
        const luogoLines = doc.splitTextToSize(`Luogo: ${clientData.luogo}`, 170);
        doc.text(luogoLines, 20, yPos);
        yPos += luogoLines.length * 5 + 2;
      }
      
      // Separator line
      yPos += 5;
      doc.setLineWidth(0.3);
      doc.line(20, yPos, 190, yPos);
      
      yPosition = yPos + 10;
    };

    const addSummarySection = () => {
      // Ensure space for summary - always add new page if needed
      const requiredSpace = 120;
      if (yPosition > pageHeight - requiredSpace) {
        doc.addPage();
        yPosition = 30;
      }
      
      yPosition += 15;
      
      // Separator line
      doc.setLineWidth(0.5);
      doc.line(20, yPosition, 190, yPosition);
      yPosition += 12;
      
      // Fixed costs details if included
      if (filteredFixedCosts.length > 0) {
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('Costi Fissi:', 20, yPosition);
        yPosition += 8;
        
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        filteredFixedCosts.forEach((cost) => {
          if (yPosition > pageHeight - 25) {
            doc.addPage();
            yPosition = 30;
          }
          doc.text(`• ${cost.nome}: € ${cost.costo.toFixed(2)}`, 25, yPosition);
          yPosition += 6;
        });
        yPosition += 8;
      }
      
      // Additional notes with better styling
      if (clientData.noteAggiuntive) {
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.text('Note:', 20, yPosition);
        yPosition += 7;
        
        doc.setFontSize(10);
        doc.setFont('helvetica', 'italic');
        const lines = doc.splitTextToSize(clientData.noteAggiuntive, 170);
        doc.text(lines, 20, yPosition);
        yPosition += (lines.length * 5) + 12;
      }
      
      // Total persons info - highlighted
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text(`Previsionale per minimo di ${numberOfPeople} persone`, 20, yPosition);
      yPosition += 12;
      
      // Service details with better formatting
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      
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
        // Always ensure space for content
        if (yPosition > pageHeight - 25) {
          doc.addPage();
          yPosition = 30;
        }
        if (detail) {
          const lines = doc.splitTextToSize(detail, 170);
          doc.text(lines, 20, yPosition);
          yPosition += (lines.length * 5) + 3;
        } else {
          yPosition += 4;
        }
      });
      
      // Total summary box - ensure it's always visible
      if (yPosition > pageHeight - 40) {
        doc.addPage();
        yPosition = 30;
      }
      
      yPosition += 10;
      doc.setLineWidth(0.8);
      doc.setDrawColor(0, 0, 0);
      doc.rect(15, yPosition - 5, 180, 18);
      
      doc.setFontSize(13);
      doc.setFont('helvetica', 'bold');
      doc.text(`TOTALE PREVENTIVO: € ${grandTotal.toFixed(2)} IVA esclusa`, 20, yPosition + 5);
      yPosition += 25;
      
      // Footer with company info - always at bottom or new page
      if (yPosition > pageHeight - 20) {
        doc.addPage();
        yPosition = 250;
      } else {
        yPosition = 265;
      }
      
      doc.setFontSize(7);
      doc.setFont('helvetica', 'normal');
      const footerText = 'I PIOSI Società Cooperativa Sociale - 37066 SOMMACAMPAGNA (VR) - Via 2 Giugno, 11 - Telefono 045 515882 / Fax 045 515480 - e-mail: info@ipiosi.it';
      const footerText2 = 'Codice Fiscale / Partita IVA 02198320232 – Iscrizione Tribunale VR n° 30159 - R.e.a. N° 222968 – Albo Società Cooperative A104500';
      
      doc.text(footerText, 105, yPosition, { align: 'center' });
      yPosition += 4;
      doc.text(footerText2, 105, yPosition, { align: 'center' });
    };

    // If logo doesn't load within 3 seconds, proceed without it
    setTimeout(() => {
      if (!logoImg.complete || logoImg.naturalWidth === 0) {
        console.warn('Logo loading timeout, generating PDF without logo');
        generatePdfContent(false);
      }
    }, 3000);
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

  const generateMenuPdf = (products: SelectedProduct[]) => {
    if (products.length === 0) {
      toast({
        title: "Nessun prodotto disponibile",
        description: "Non ci sono prodotti da esportare nel menù",
        variant: "destructive"
      });
      return;
    }

    const currentDate = new Date().toLocaleDateString('it-IT');
    const doc = new jsPDF();
    const pageHeight = 280;
    let yPosition = 115;
    
    const logoImg = new Image();
    logoImg.crossOrigin = 'anonymous';
    
    const generateMenuContent = (logoLoaded: boolean = false) => {
      // Header with logo
      if (logoLoaded && logoImg.complete && logoImg.naturalWidth > 0) {
        try {
          doc.addImage(logoImg, 'PNG', 20, 15, 40, 20);
        } catch (e) {
          console.warn('Error adding logo to PDF:', e);
        }
      }
      
      // Title
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.text('MENÙ FOOD LOOP', 105, 25, { align: 'center' });
      
      // Date
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Data: ${currentDate}`, 190, 32, { align: 'right' });
      
      // Decorative line
      doc.setLineWidth(0.5);
      doc.line(20, 40, 190, 40);
      
      // Subtitle
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('LO STREET FOOD. CIRCOLARE!', 20, 55);
      
      yPosition = 70;
      doc.setLineWidth(0.3);
      doc.line(20, yPosition, 190, yPosition);
      yPosition += 15;
      
      // Products list
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Lista Prodotti:', 20, yPosition);
      yPosition += 10;
      
      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      
      products.forEach((product, index) => {
        // Check if new page is needed
        if (yPosition > pageHeight - 30) {
          doc.addPage();
          yPosition = 30;
        }
        
        // Product name
        doc.setFont('helvetica', 'bold');
        doc.text(`${index + 1}. ${product.nome}`, 25, yPosition);
        yPosition += 6;
        
        // Product price
        doc.setFont('helvetica', 'normal');
        doc.text(`Prezzo: € ${product.prezzo.toFixed(2)} /persona`, 30, yPosition);
        yPosition += 10;
      });
      
      // Footer info
      if (yPosition > pageHeight - 40) {
        doc.addPage();
        yPosition = 30;
      }
      
      yPosition += 15;
      doc.setLineWidth(0.3);
      doc.line(20, yPosition, 190, yPosition);
      yPosition += 10;
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'italic');
      doc.text('Tutti i prezzi sono IVA esclusa', 20, yPosition);
      yPosition += 6;
      doc.text('Per informazioni e prenotazioni: info@ipiosi.it - Tel. 045 515882', 20, yPosition);
      
      // Footer at bottom
      yPosition = 265;
      doc.setFontSize(7);
      doc.setFont('helvetica', 'normal');
      const footerText = 'I PIOSI Società Cooperativa Sociale - 37066 SOMMACAMPAGNA (VR) - Via 2 Giugno, 11 - Telefono 045 515882 / Fax 045 515480 - e-mail: info@ipiosi.it';
      const footerText2 = 'Codice Fiscale / Partita IVA 02198320232 – Iscrizione Tribunale VR n° 30159 - R.e.a. N° 222968 – Albo Società Cooperative A104500';
      
      doc.text(footerText, 105, yPosition, { align: 'center' });
      yPosition += 4;
      doc.text(footerText2, 105, yPosition, { align: 'center' });
      
      // Save PDF
      doc.save(`menu-food-loop-${currentDate.replace(/\//g, '-')}.pdf`);

      toast({
        title: "Menù scaricato",
        description: "Il menù cliente è stato scaricato con successo",
      });
    };
    
    // Try to load logo
    logoImg.onload = function() {
      generateMenuContent(true);
    };
    logoImg.onerror = function() {
      console.warn('Logo could not be loaded, generating menu PDF without logo');
      generateMenuContent(false);
    };
    logoImg.src = '/lovable-uploads/1f82fa2a-8709-4f33-b544-f2e8f1eeec61.png';
    
    // Timeout fallback
    setTimeout(() => {
      if (!logoImg.complete || logoImg.naturalWidth === 0) {
        console.warn('Logo loading timeout, generating menu PDF without logo');
        generateMenuContent(false);
      }
    }, 3000);
  };

  return { generateQuote, generateInternalQuote, generateMenuPdf };
};
