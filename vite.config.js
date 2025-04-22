import { defineConfig } from "vite";
import path from "path";

const libEntry = path.resolve(__dirname, "src/index.js");

export default defineConfig(({ mode }) => {
  const isDebug = mode === "debug";

  // Setup the format and filename based on the build mode
  const formats = isDebug ? ["umd"] : ["es", "umd"];
  const fileName = (format) => isDebug 
    ? "penrose-js.debug.js" 
    : `penrose-js.${format}.js`;

  return {
    build: {
      lib: {
        entry: libEntry,
        name: "penrosejs",
        formats,
        fileName,
      },
      minify: false, // Don't minify - we'll do this separately
      outDir: "dist",
      emptyOutDir: true,
    },
    server: {
      open: true,
      port: 3000
    }
  };
});
