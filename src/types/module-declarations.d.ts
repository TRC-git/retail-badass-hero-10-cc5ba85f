
// Type declarations for modules that are missing TypeScript definitions
declare module 'html2canvas' {
  interface Options {
    scale?: number;
    logging?: boolean;
    useCORS?: boolean;
    backgroundColor?: string;
    allowTaint?: boolean;
    [key: string]: any;
  }
  
  export default function html2canvas(element: HTMLElement, options?: Options): Promise<HTMLCanvasElement>;
}

declare module 'jspdf' {
  interface JsPDFOptions {
    orientation?: 'portrait' | 'landscape';
    unit?: string;
    format?: string;
    [key: string]: any;
  }
  
  class JsPDF {
    constructor(options?: JsPDFOptions);
    addImage: (imageData: string, format: string, x: number, y: number, width: number, height: number) => JsPDF;
    output: (type: string) => string;
    setProperties: (properties: Record<string, string>) => JsPDF;
    save: (filename: string) => JsPDF;
    [key: string]: any;
  }
  
  export default JsPDF;
}
