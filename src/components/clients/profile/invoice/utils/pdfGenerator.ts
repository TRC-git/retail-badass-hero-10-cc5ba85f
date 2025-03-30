
/**
 * Core PDF generation functionality
 */
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { applyLightThemeStyles, restoreOriginalStyles } from './pdfStyles';

/**
 * Generate a canvas from a DOM element with applied light theme
 * 
 * @param element - The DOM element to capture
 * @returns The generated canvas and a function to restore original styles
 */
export const generateCanvas = async (element: HTMLElement): Promise<{
  canvas: HTMLCanvasElement;
  restoreStyles: () => void;
}> => {
  // Store original styles but don't apply light theme anymore
  const { originalStyles, originalElementStyles } = applyLightThemeStyles(element);
  
  // Get background color from the element
  const computedStyle = window.getComputedStyle(element);
  const backgroundColor = computedStyle.backgroundColor;
  
  // Capture the element with better quality
  const canvas = await html2canvas(element, {
    scale: 3, // Higher scale for better quality
    logging: false,
    useCORS: true,
    backgroundColor: backgroundColor, // Use the actual background color
    allowTaint: true
  });
  
  // Create function to restore original styles
  const restoreStyles = () => {
    restoreOriginalStyles(element, originalStyles, originalElementStyles);
  };
  
  return { canvas, restoreStyles };
};

/**
 * Create a PDF document from an HTML canvas
 * 
 * @param canvas - The canvas element containing the rendered content
 * @param options - Optional PDF configuration
 * @returns The generated PDF document
 */
export const createPdfFromCanvas = (
  canvas: HTMLCanvasElement,
  options?: {
    filename?: string;
    addMetadata?: boolean;
  }
): typeof jsPDF.prototype => {
  const imgData = canvas.toDataURL('image/png', 1.0); // Use maximum quality
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });
  
  // Calculate dimensions for proper aspect ratio
  const imgWidth = 210; // A4 width in mm
  const pageHeight = 297; // A4 height in mm
  const imgHeight = (canvas.height * imgWidth) / canvas.width;
  
  // Add image with margins for better appearance
  const margin = 10; // 10mm margin
  pdf.addImage(imgData, 'PNG', margin, margin, imgWidth - (margin * 2), imgHeight - (margin * 2));
  
  // Add metadata if requested
  if (options?.addMetadata && options.filename) {
    pdf.setProperties({
      title: options.filename,
      subject: 'Invoice',
      author: 'NextPOS',
      creator: 'NextPOS'
    });
  }
  
  return pdf;
};

/**
 * Convert a PDF to base64 string
 * 
 * @param pdf - The PDF document to convert
 * @returns Base64 encoded PDF data (without the data URI prefix)
 */
export const pdfToBase64 = (pdf: typeof jsPDF.prototype): string => {
  return pdf.output('datauristring').split(',')[1];
};
