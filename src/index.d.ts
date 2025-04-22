/**
 * Penrose-JS TypeScript Definitions
 */

export declare class Complex {
  real: number;
  imag: number;
  
  constructor(real: number, imag?: number);
  static fromPolar(r: number, theta: number): Complex;
  add(other: Complex): Complex;
  subtract(other: Complex): Complex;
  multiply(other: Complex): Complex;
  divide(scalar: number): Complex;
  scale(scalar: number): Complex;
  abs(): number;
}

export interface PenroseOptions {
  divisions?: number;
  zoomType?: 'in' | 'out';
  width?: number;
  height?: number;
  color1?: number[] | string;
  color2?: number[] | string;
  color3?: number[] | string;
  backgroundColor?: number[] | string;
}

export interface PenroseCanvasOptions extends PenroseOptions {
  ctx: CanvasRenderingContext2D;
}

export declare class Penrose {
  constructor(defaultOptions?: PenroseOptions);
  generatePenroseTiling(options: PenroseOptions): any;
}

export declare class PenroseCanvas extends Penrose {
  constructor(defaultOptions?: PenroseOptions);
  generatePenroseTiling(options: PenroseCanvasOptions): CanvasRenderingContext2D;
}

export declare class PenroseBitmap extends Penrose {
  constructor(defaultOptions?: PenroseOptions);
  generatePenroseTiling(options: PenroseOptions): Uint8ClampedArray;
}

export declare const PHI: number;
export declare const DEFAULT_OPTIONS: PenroseOptions;

export declare function hexToRgb(hex: string): number[];
export declare function getRandomColor(): string; 