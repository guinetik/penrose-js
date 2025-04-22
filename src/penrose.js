import { Complex } from './complex.js';
import { 
  hexToRgb, 
  getRandomColor, 
  generatePenroseTriangles, 
  calculateLineWidth, 
  DEFAULT_OPTIONS, 
  PHI 
} from './util.js';

/**
 * Base Penrose class that provides common functionality for Penrose tilings
 */
export class Penrose {
  /**
   * Create a new Penrose tiling generator
   * @param {Object} [defaultOptions] - Custom default options to override the built-in defaults
   */
  constructor(defaultOptions = {}) {
    this.options = { ...DEFAULT_OPTIONS, ...defaultOptions };
  }

  /**
   * Generate a Penrose tiling with the given options
   * @param {Object} options - Options for generating the tiling
   * @param {number} [options.divisions=5] - Number of subdivision iterations
   * @param {string} [options.zoomType='in'] - Zoom type ('in' or 'out')
   * @param {number} [options.width=800] - Width of the output
   * @param {number} [options.height=800] - Height of the output
   * @param {number[]} [options.color1=[1,0,0,1]] - Color for thin rhombi (RGBA, normalized 0-1)
   * @param {number[]} [options.color2=[0,0,1,1]] - Color for thick rhombi (RGBA, normalized 0-1)
   * @param {number[]} [options.color3=[0,0,0,1]] - Color for outlines (RGBA, normalized 0-1)
   * @param {number[]} [options.backgroundColor=[1,1,1,1]] - Background color (RGBA, normalized 0-1)
   * @returns {*} Implementation-specific result
   */
  generatePenroseTiling(options) {
    throw new Error("Not implemented - use a concrete subclass");
  }
  
  /**
   * Process and merge options with defaults
   * @param {Object} options - User-provided options
   * @returns {Object} Processed options with defaults applied
   * @protected
   */
  _processOptions(options) {
    const processedOptions = { ...this.options, ...options };
    
    // Convert hex colors to RGB arrays if strings are provided
    if (typeof processedOptions.color1 === 'string') {
      processedOptions.color1 = hexToRgb(processedOptions.color1);
    }
    if (typeof processedOptions.color2 === 'string') {
      processedOptions.color2 = hexToRgb(processedOptions.color2);
    }
    if (typeof processedOptions.color3 === 'string') {
      processedOptions.color3 = hexToRgb(processedOptions.color3);
    }
    if (typeof processedOptions.backgroundColor === 'string') {
      processedOptions.backgroundColor = hexToRgb(processedOptions.backgroundColor);
    }
    
    return processedOptions;
  }
}

/**
 * PenroseBitmap class that generates Penrose tilings using pixel manipulation
 */
export class PenroseBitmap extends Penrose {
  /**
   * Generate a Penrose tiling with bitmap/pixel approach
   * @param {Object} options - Options for generating the tiling
   * @returns {Uint8ClampedArray} The pixel data array (RGBA format)
   */
  generatePenroseTiling(options) {
    const opts = this._processOptions(options);
    const { 
      divisions, 
      zoomType, 
      width, 
      height, 
      color1,
      color2,
      color3,
      backgroundColor
    } = opts;
    
    // Create pixel data array (RGBA - 4 bytes per pixel)
    const pixels = new Uint8ClampedArray(width * height * 4);
    
    // Fill with background color initially
    for (let i = 0; i < pixels.length; i += 4) {
      pixels[i] = backgroundColor[0] * 255;     // R
      pixels[i + 1] = backgroundColor[1] * 255; // G
      pixels[i + 2] = backgroundColor[2] * 255; // B
      pixels[i + 3] = (backgroundColor[3] || 1) * 255; // A
    }
    
    // Set up scale
    const scale = zoomType === 'in' ? 1 : 2;
    const maxDim = Math.max(width, height);
    const scaleX = maxDim / scale;
    const scaleY = maxDim / scale;
    const translateX = 0.5 * scale;
    const translateY = 0.5 * scale;
    
    // Generate triangles
    const triangles = generatePenroseTriangles(divisions);
    
    // Convert triangle coordinates to screen coordinates
    function worldToScreen(point) {
      const x = Math.floor((point.real * scaleX + translateX * scaleX) * width / maxDim);
      const y = Math.floor((point.imag * scaleY + translateY * scaleY) * height / maxDim);
      return { x, y };
    }
    
    // Draw triangles to pixel array using rasterization
    for (const [shape, v1, v2, v3] of triangles) {
      const p1 = worldToScreen(v1);
      const p2 = worldToScreen(v2);
      const p3 = worldToScreen(v3);
      
      // Get color based on shape
      const color = shape === "thin" ? color1 : color2;
      
      // Rasterize triangle
      this._fillTriangle(pixels, p1, p2, p3, color, width, height);
    }
    
    // Optional: Draw outlines
    if (color3 && color3[3] > 0) {
      for (const [shape, v1, v2, v3] of triangles) {
        const p1 = worldToScreen(v1);
        const p2 = worldToScreen(v2);
        const p3 = worldToScreen(v3);
        
        // Draw outline with 1px width
        this._drawLine(pixels, p1, p2, color3, width, height);
        this._drawLine(pixels, p2, p3, color3, width, height);
        this._drawLine(pixels, p3, p1, color3, width, height);
      }
    }
    
    return pixels;
  }
  
  /**
   * Helper function to fill a triangle
   * @private
   */
  _fillTriangle(pixels, p1, p2, p3, color, width, height) {
    // Sort vertices by y-coordinate
    if (p1.y > p2.y) [p1, p2] = [p2, p1];
    if (p1.y > p3.y) [p1, p3] = [p3, p1];
    if (p2.y > p3.y) [p2, p3] = [p3, p2];
    
    // Calculate RGB values as 0-255
    const r = Math.round(color[0] * 255);
    const g = Math.round(color[1] * 255);
    const b = Math.round(color[2] * 255);
    const a = Math.round((color[3] || 1) * 255); // Default alpha to 1 if not provided
    
    // Flat bottom triangle
    if (p2.y === p3.y) {
      this._fillFlatBottomTriangle(pixels, p1, p2, p3, r, g, b, a, width, height);
    }
    // Flat top triangle
    else if (p1.y === p2.y) {
      this._fillFlatTopTriangle(pixels, p1, p2, p3, r, g, b, a, width, height);
    }
    // General triangle - split into flat-bottom and flat-top triangles
    else {
      // Calculate the new vertex
      const p4 = {
        x: Math.floor(p1.x + ((p2.y - p1.y) / (p3.y - p1.y)) * (p3.x - p1.x)),
        y: p2.y
      };
      
      this._fillFlatBottomTriangle(pixels, p1, p2, p4, r, g, b, a, width, height);
      this._fillFlatTopTriangle(pixels, p2, p4, p3, r, g, b, a, width, height);
    }
  }
  
  /**
   * Helper to fill a flat-bottom triangle
   * @private
   */
  _fillFlatBottomTriangle(pixels, p1, p2, p3, r, g, b, a, width, height) {
    const invSlope1 = (p2.x - p1.x) / (p2.y - p1.y || 1); // Avoid division by zero
    const invSlope2 = (p3.x - p1.x) / (p3.y - p1.y || 1);
    
    let curx1 = p1.x;
    let curx2 = p1.x;
    
    for (let scanlineY = p1.y; scanlineY <= p2.y; scanlineY++) {
      if (scanlineY >= 0 && scanlineY < height) {
        const startX = Math.max(0, Math.min(Math.floor(curx1), width - 1));
        const endX = Math.max(0, Math.min(Math.floor(curx2), width - 1));
        
        for (let x = Math.min(startX, endX); x <= Math.max(startX, endX); x++) {
          const index = (scanlineY * width + x) * 4;
          if (index >= 0 && index < pixels.length - 3) {
            pixels[index] = r;
            pixels[index + 1] = g;
            pixels[index + 2] = b;
            pixels[index + 3] = a;
          }
        }
      }
      
      curx1 += invSlope1;
      curx2 += invSlope2;
    }
  }
  
  /**
   * Helper to fill a flat-top triangle
   * @private
   */
  _fillFlatTopTriangle(pixels, p1, p2, p3, r, g, b, a, width, height) {
    const invSlope1 = (p3.x - p1.x) / (p3.y - p1.y || 1);
    const invSlope2 = (p3.x - p2.x) / (p3.y - p2.y || 1);
    
    let curx1 = p3.x;
    let curx2 = p3.x;
    
    for (let scanlineY = p3.y; scanlineY > p1.y; scanlineY--) {
      if (scanlineY >= 0 && scanlineY < height) {
        curx1 -= invSlope1;
        curx2 -= invSlope2;
        
        const startX = Math.max(0, Math.min(Math.floor(curx1), width - 1));
        const endX = Math.max(0, Math.min(Math.floor(curx2), width - 1));
        
        for (let x = Math.min(startX, endX); x <= Math.max(startX, endX); x++) {
          const index = (scanlineY * width + x) * 4;
          if (index >= 0 && index < pixels.length - 3) {
            pixels[index] = r;
            pixels[index + 1] = g;
            pixels[index + 2] = b;
            pixels[index + 3] = a;
          }
        }
      }
    }
  }
  
  /**
   * Helper to draw a line using Bresenham's algorithm
   * @private
   */
  _drawLine(pixels, p1, p2, color, width, height) {
    // Calculate RGB values as 0-255
    const r = Math.round(color[0] * 255);
    const g = Math.round(color[1] * 255);
    const b = Math.round(color[2] * 255);
    const a = Math.round((color[3] || 1) * 255);
    
    let x0 = p1.x;
    let y0 = p1.y;
    let x1 = p2.x;
    let y1 = p2.y;
    
    const dx = Math.abs(x1 - x0);
    const dy = Math.abs(y1 - y0);
    const sx = x0 < x1 ? 1 : -1;
    const sy = y0 < y1 ? 1 : -1;
    let err = dx - dy;
    
    while (true) {
      if (x0 >= 0 && x0 < width && y0 >= 0 && y0 < height) {
        const index = (y0 * width + x0) * 4;
        if (index >= 0 && index < pixels.length - 3) {
          // Simple alpha blending
          const alpha = a / 255;
          pixels[index] = Math.round(pixels[index] * (1 - alpha) + r * alpha);
          pixels[index + 1] = Math.round(pixels[index + 1] * (1 - alpha) + g * alpha);
          pixels[index + 2] = Math.round(pixels[index + 2] * (1 - alpha) + b * alpha);
          pixels[index + 3] = 255; // Full opacity for the line
        }
      }
      
      if (x0 === x1 && y0 === y1) break;
      const e2 = 2 * err;
      if (e2 > -dy) { err -= dy; x0 += sx; }
      if (e2 < dx) { err += dx; y0 += sy; }
    }
  }
}

/**
 * PenroseCanvas class that generates Penrose tilings using the Canvas API
 */
export class PenroseCanvas extends Penrose {
  /**
   * Generate a Penrose tiling on a canvas context
   * @param {Object} options - Options for generating the tiling
   * @param {CanvasRenderingContext2D} options.ctx - The canvas context to draw on
   * @returns {CanvasRenderingContext2D} The canvas context
   */
  generatePenroseTiling(options) {
    if (!options.ctx) {
      throw new Error("Canvas context (ctx) is required for PenroseCanvas");
    }
    
    const opts = this._processOptions(options);
    const {
      ctx,
      divisions,
      zoomType,
      width,
      height,
      color1,
      color2,
      color3,
      backgroundColor
    } = opts;
    
    // Reset transformations and clear canvas
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, width, height);
    
    // Apply background color if specified
    if (backgroundColor) {
      ctx.fillStyle = `rgba(${Math.round(backgroundColor[0]*255)}, ${Math.round(backgroundColor[1]*255)}, ${Math.round(backgroundColor[2]*255)}, ${backgroundColor[3] || 1})`;
      ctx.fillRect(0, 0, width, height);
    }
    
    // Set up scale
    const scale = zoomType === 'in' ? 1 : 2;
    const maxDim = Math.max(width, height);
    ctx.scale(maxDim / scale, maxDim / scale);
    ctx.translate(0.5 * scale, 0.5 * scale);
    
    // Generate triangles
    const triangles = generatePenroseTriangles(divisions);
    
    // Draw thin rhombi
    ctx.beginPath();
    for (const [shape, v1, v2, v3] of triangles) {
      if (shape === "thin") {
        ctx.moveTo(v1.real, v1.imag);
        ctx.lineTo(v2.real, v2.imag);
        ctx.lineTo(v3.real, v3.imag);
        ctx.closePath();
      }
    }
    ctx.fillStyle = `rgba(${Math.round(color1[0]*255)}, ${Math.round(color1[1]*255)}, ${Math.round(color1[2]*255)}, ${color1[3] || 1})`;
    ctx.fill();
    
    // Draw thick rhombi
    ctx.beginPath();
    for (const [shape, v1, v2, v3] of triangles) {
      if (shape === "thicc") {
        ctx.moveTo(v1.real, v1.imag);
        ctx.lineTo(v2.real, v2.imag);
        ctx.lineTo(v3.real, v3.imag);
        ctx.closePath();
      }
    }
    ctx.fillStyle = `rgba(${Math.round(color2[0]*255)}, ${Math.round(color2[1]*255)}, ${Math.round(color2[2]*255)}, ${color2[3] || 1})`;
    ctx.fill();
    
    // Draw outlines
    ctx.beginPath();
    for (const [shape, v1, v2, v3] of triangles) {
      ctx.moveTo(v2.real, v2.imag);
      ctx.lineTo(v1.real, v1.imag);
      ctx.lineTo(v3.real, v3.imag);
    }
    ctx.strokeStyle = `rgba(${Math.round(color3[0]*255)}, ${Math.round(color3[1]*255)}, ${Math.round(color3[2]*255)}, ${color3[3] || 1})`;
    
    const lineWidth = calculateLineWidth(divisions);
    ctx.lineWidth = lineWidth;
    ctx.lineJoin = 'round';
    ctx.stroke();
    
    // Reset transformations after drawing is complete
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    
    return ctx;
  }
}

