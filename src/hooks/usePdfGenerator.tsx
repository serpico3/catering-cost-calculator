
import jsPDF from 'jspdf';
import { useToast } from '@/hooks/use-toast';
import { SelectedProduct } from './useProducts';

export const usePdfGenerator = () => {
  const { toast } = useToast();

  const generateQuote = (filename: string, selectedProducts: SelectedProduct[], numberOfPeople: number) => {
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
    const total = subtotal * numberOfPeople;

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
    logoImg.src = '/lovable-uploads/2293249a-bf68-4522-8f20-970b1d6bdf43.png';

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
      doc.save(`${filename}.pdf`);

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
      yPosition += 15;
      
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text(`TOTALE COMPLESSIVO: €${total.toFixed(2)} (IVA ESCLUSA)`, 20, yPosition);
      
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

  return { generateQuote };
};
