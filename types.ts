
export interface Hotspot {
  id: string;
  x: number; // percentage
  y: number; // percentage
  label: string;
  description: string;
}

export interface PromptSet {
  lighting: string;
  composition: string;
  materials: string;
  camera: string;
  negative: string;
}

export interface InteriorCase {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  mainImage: string;
  gallery: string[];
  hotspots: Hotspot[];
  prompts: PromptSet;
}

export enum ViewMode {
  ARCHIVE = 'archive',
  DETAIL = 'detail'
}
