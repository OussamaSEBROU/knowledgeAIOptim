
export interface Axiom {
  title: string;
  definition: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

export enum Language {
  EN = 'EN',
  AR = 'AR'
}

export type ViewState = 'main' | 'pdf' | 'about' | 'help';

export interface PDFData {
  name: string;
  base64: string;
  mimeType: string;
  blobUrl?: string;
}
