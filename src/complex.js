/**
 * A class for complex number operations, essential for Penrose tiling calculations.
 */
export class Complex {
  /**
   * Create a complex number
   * @param {number} real - Real part of the complex number
   * @param {number} imag - Imaginary part of the complex number (default: 0)
   */
  constructor(real, imag = 0) {
    this.real = real;
    this.imag = imag;
  }
  
  /**
   * Create a complex number from polar coordinates
   * @param {number} r - Radius/magnitude
   * @param {number} theta - Angle in radians
   * @returns {Complex} New complex number
   */
  static fromPolar(r, theta) {
    return new Complex(r * Math.cos(theta), r * Math.sin(theta));
  }
  
  /**
   * Add two complex numbers
   * @param {Complex} other - The complex number to add
   * @returns {Complex} New complex number representing the sum
   */
  add(other) {
    return new Complex(this.real + other.real, this.imag + other.imag);
  }
  
  /**
   * Subtract a complex number from this one
   * @param {Complex} other - The complex number to subtract
   * @returns {Complex} New complex number representing the difference
   */
  subtract(other) {
    return new Complex(this.real - other.real, this.imag - other.imag);
  }
  
  /**
   * Multiply by another complex number
   * @param {Complex} other - The complex number to multiply by
   * @returns {Complex} New complex number representing the product
   */
  multiply(other) {
    return new Complex(
      this.real * other.real - this.imag * other.imag,
      this.real * other.imag + this.imag * other.real
    );
  }
  
  /**
   * Divide by a scalar
   * @param {number} scalar - The scalar to divide by
   * @returns {Complex} New complex number
   */
  divide(scalar) {
    return new Complex(this.real / scalar, this.imag / scalar);
  }
  
  /**
   * Scale by a scalar (multiply)
   * @param {number} scalar - The scalar to multiply by
   * @returns {Complex} New complex number
   */
  scale(scalar) {
    return new Complex(this.real * scalar, this.imag * scalar);
  }
  
  /**
   * Calculate the absolute value (magnitude) of this complex number
   * @returns {number} The magnitude
   */
  abs() {
    return Math.sqrt(this.real * this.real + this.imag * this.imag);
  }
}
