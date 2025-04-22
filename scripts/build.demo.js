import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { execSync } from "child_process";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT = path.join(__dirname, "..");
const DEMOS = path.join(ROOT, "index.html");
const DIST = path.join(ROOT, "dist");
const PUBLIC = path.join(ROOT, "public");
const ESM_FILE = path.join(DIST, "penrose-js.es.min.js");

function cleanPublic() {
  if (fs.existsSync(PUBLIC)) fs.rmSync(PUBLIC, { recursive: true });
  fs.mkdirSync(PUBLIC);
}

function buildAndCopy() {
  console.log("📦 Running build");
  execSync("npm run build", { stdio: "inherit" });

  console.log("📁 Copying demos → public/");
  fs.copyFileSync(DEMOS, path.join(PUBLIC, "index.html"));

  console.log("📁 Copying penrose-js.es.min.js → public/");
  fs.copyFileSync(ESM_FILE, path.join(PUBLIC, "penrose-js.es.min.js"));

  console.log("📁 Copying logo.png  → public/");
  fs.copyFileSync(path.join(ROOT, "logo.png"), path.join(PUBLIC, "logo.png"));

  console.log("🔄 Replacing imports in index.html");
  const pathToReplace = "./src/index.js"
  const replacementPath = "./penrose-js.es.min.js"

  const content = fs.readFileSync(path.join(PUBLIC, "index.html"), "utf-8");
  const updatedContent = content.replace(pathToReplace, replacementPath);
  fs.writeFileSync(path.join(PUBLIC, "index.html"), updatedContent);  

  console.log("✅ build:demo complete");
}

function run() {
  console.log("🧹 Cleaning public/");
  cleanPublic();
  buildAndCopy();
}

run();
