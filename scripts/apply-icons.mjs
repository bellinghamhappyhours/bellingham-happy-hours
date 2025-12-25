import fs from "node:fs";
import path from "node:path";

const region = process.env.REGION || "default";
console.log("apply-icons.mjs REGION =", region);
console.log("apply-icons.mjs VERCEL_ENV =", process.env.VERCEL_ENV);
const fromDir = path.join(process.cwd(), "public", "icons", region);
const toDir = path.join(process.cwd(), "public");

function copy(srcName, destName) {
  const src = path.join(fromDir, srcName);
  const dest = path.join(toDir, destName);

  if (!fs.existsSync(src)) {
    console.error(`Missing icon file: ${src}`);
    process.exit(1);
  }
  fs.copyFileSync(src, dest);
  console.log(`Copied ${src} -> ${dest}`);
}

copy("favicon.ico", "favicon.ico");
copy("apple-icon.png", "apple-icon.png");
copy("icon.png", "icon.png");
