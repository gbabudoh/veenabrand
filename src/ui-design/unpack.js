const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const htmlPath = path.join(__dirname, 'Veena Fashion Prototype.html');
const outDir = path.join(__dirname, 'unpacked');

if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir);
}

const html = fs.readFileSync(htmlPath, 'utf8');

function extractTagContent(html, type) {
  const regex = new RegExp(`<script\\s+type="${type}"[^>]*>([\\s\\S]*?)<\\/script>`, 'i');
  const match = html.match(regex);
  if (!match) {
    console.error(`Could not find script tag for type: ${type}`);
    return null;
  }
  return match[1].trim();
}

const manifestContent = extractTagContent(html, '__bundler/manifest');
const templateContent = extractTagContent(html, '__bundler/template');
const extResourcesContent = extractTagContent(html, '__bundler/ext_resources');

if (!manifestContent) {
  process.exit(1);
}

const manifest = JSON.parse(manifestContent);
const extResources = extResourcesContent ? JSON.parse(extResourcesContent) : [];

console.log(`Unpacking ${Object.keys(manifest).length} assets...`);

const resourceMap = {};
for (const entry of extResources) {
  resourceMap[entry.uuid] = entry.id;
}

// Unpack assets
for (const [uuid, entry] of Object.entries(manifest)) {
  const binaryBuffer = Buffer.from(entry.data, 'base64');
  let finalBuffer = binaryBuffer;

  if (entry.compressed) {
    try {
      finalBuffer = zlib.gunzipSync(binaryBuffer);
    } catch (err) {
      console.error(`Failed to decompress asset ${uuid}:`, err);
      continue;
    }
  }

  // Determine a filename
  let filename = resourceMap[uuid] || uuid;
  const mime = entry.mime;
  let extension = '';

  if (mime.includes('javascript') || mime.includes('babel') || mime.includes('jsx')) {
    extension = '.js';
  } else if (mime.includes('css')) {
    extension = '.css';
  } else if (mime.includes('svg')) {
    extension = '.svg';
  } else if (mime.includes('png')) {
    extension = '.png';
  } else if (mime.includes('jpeg') || mime.includes('jpg')) {
    extension = '.jpg';
  } else if (mime.includes('html')) {
    extension = '.html';
  }

  if (filename.startsWith('http://') || filename.startsWith('https://')) {
    filename = filename.replace(/^https?:\/\//, 'external/');
    filename = filename.replace(/:/g, '_');
  }

  let finalName = filename;
  if (!path.extname(filename) && extension) {
    finalName += extension;
  }

  // Replace backslashes/slashes for cross-platform compatibility
  const safeName = finalName.replace(/\\/g, '/');
  const safePath = path.join(outDir, safeName);
  const safeDirPath = path.dirname(safePath);

  if (!fs.existsSync(safeDirPath)) {
    fs.mkdirSync(safeDirPath, { recursive: true });
  }

  fs.writeFileSync(safePath, finalBuffer);
  console.log(`Unpacked: ${safeName} (${mime})`);
}

// Write the template html as well
if (templateContent) {
  const template = JSON.parse(templateContent);
  fs.writeFileSync(path.join(outDir, 'template.html'), template, 'utf8');
  console.log('Unpacked template.html');
}

console.log('Done unpacking!');
