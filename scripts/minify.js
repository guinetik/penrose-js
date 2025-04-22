// Simple minification script
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { minify } from 'terser';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const distDir = path.join(__dirname, '../dist');

async function minifyFiles() {
  try {
    // ES Module
    console.log('Minifying ES module...');
    const esContent = fs.readFileSync(path.join(distDir, 'penrose-js.es.js'), 'utf8');
    const esResult = await minify(esContent, {
      compress: {
        drop_console: true,
        drop_debugger: true
      },
      mangle: true,
      format: {
        comments: false
      }
    });

    fs.writeFileSync(path.join(distDir, 'penrose-js.es.min.js'), esResult.code);
    console.log('ES module minified successfully!');

    // Report file sizes
    const originalEsSize = Buffer.byteLength(esContent, 'utf8');
    const minifiedEsSize = Buffer.byteLength(esResult.code, 'utf8');
    console.log(`ES module: ${originalEsSize} bytes -> ${minifiedEsSize} bytes (${Math.round((minifiedEsSize / originalEsSize) * 100)}%)`);

    // UMD 
    console.log('Minifying UMD module...');
    const umdContent = fs.readFileSync(path.join(distDir, 'penrose-js.umd.js'), 'utf8');
    const umdResult = await minify(umdContent, {
      compress: {
        drop_console: true,
        drop_debugger: true
      },
      mangle: true,
      format: {
        comments: false
      }
    });

    fs.writeFileSync(path.join(distDir, 'penrose-js.umd.min.js'), umdResult.code);
    console.log('UMD module minified successfully!');

    // Report file sizes
    const originalUmdSize = Buffer.byteLength(umdContent, 'utf8');
    const minifiedUmdSize = Buffer.byteLength(umdResult.code, 'utf8');
    console.log(`UMD module: ${originalUmdSize} bytes -> ${minifiedUmdSize} bytes (${Math.round((minifiedUmdSize / originalUmdSize) * 100)}%)`);

  } catch (error) {
    console.error('Error minifying files:', error);
    process.exit(1);
  }
}

minifyFiles(); 