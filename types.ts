
export enum CellColor {
  NONE = 'none',
  RED = 'red',
  GREEN = 'green',
}

// Extended CellData with optional coordinate properties to support positioning in animation components
export interface CellData {
  id: string;
  row: number;
  col: number;
  text: string;
  color: CellColor;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
}

// Interface for individual cell detection returned by Gemini image analysis
export interface AnalyzedCell {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
}

// Root interface for the Gemini analysis service response
export interface AnalysisResult {
  cells: AnalyzedCell[];
}
