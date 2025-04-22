/**
 * Utility functions for Penrose tiling.
 */
import { Complex } from './complex.js';

/**
 * The golden ratio, a key constant for Penrose tiling.
 */
export const PHI = (Math.sqrt(5) + 1) / 2;

/**
 * Converts hex color string to RGB array
 * @param {string} hex - The hex color string (e.g. "#ff0000")
 * @returns {number[]} RGBA values as array of normalized values (0-1)
 */
export function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? [
    parseInt(result[1], 16) / 255,
    parseInt(result[2], 16) / 255,
    parseInt(result[3], 16) / 255,
    1 // Add alpha
  ] : [0, 0, 0, 1];
}

/**
 * Generates a random hex color
 * @returns {string} Random hex color
 */
export function getRandomColor() {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

/**
 * Generate the triangles for Penrose tiling
 * @param {number} divisions - Number of subdivision iterations
 * @returns {Array} Array of triangles with shape and vertices
 */
export function generatePenroseTriangles(divisions) {
  // Base for the tiling pattern
  const base = 5;
  
  // Create initial triangles
  let triangles = [];
  for (let i = 0; i < base * 2; i++) {
    const v2 = Complex.fromPolar(1, (2 * i - 1) * Math.PI / (base * 2));
    const v3 = Complex.fromPolar(1, (2 * i + 1) * Math.PI / (base * 2));
    
    if (i % 2 === 0) {
      // Mirror every other triangle
      triangles.push(["thin", new Complex(0), v3, v2]);
    } else {
      triangles.push(["thin", new Complex(0), v2, v3]);
    }
  }
  
  // Subdivide triangles
  for (let i = 0; i < divisions; i++) {
    const newTriangles = [];
    
    for (const [shape, v1, v2, v3] of triangles) {
      if (shape === "thin") {
        // Divide thin rhombus
        const p1 = v1.add(v2.subtract(v1).scale(1 / PHI));
        newTriangles.push(["thin", v3, p1, v2]);
        newTriangles.push(["thicc", p1, v3, v1]);
      } else {
        // Divide thicc rhombus
        const p2 = v2.add(v1.subtract(v2).scale(1 / PHI));
        const p3 = v2.add(v3.subtract(v2).scale(1 / PHI));
        newTriangles.push(["thicc", p3, v3, v1]);
        newTriangles.push(["thicc", p2, p3, v2]);
        newTriangles.push(["thin", p3, p2, v1]);
      }
    }
    
    triangles = newTriangles;
  }
  
  return triangles;
}

/**
 * Determines linewidth based on divisions 
 * @param {number} divisions - Number of subdivision iterations
 * @returns {number} Appropriate line width
 */
export function calculateLineWidth(divisions) {
  return divisions > 3 ? Math.pow(divisions, -3) : Math.pow(divisions, -5);
}

/**
 * Default options for Penrose tiling generation
 */
export const DEFAULT_OPTIONS = {
  divisions: 5,
  zoomType: 'in',
  width: 800,
  height: 800,
  color1: [1, 0, 0, 1],     // Red for thin rhombi
  color2: [0, 0, 1, 1],     // Blue for thick rhombi
  color3: [0, 0, 0, 1],     // Black for outlines
  backgroundColor: [1, 1, 1, 1] // White background
};
