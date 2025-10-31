// scripts/generate_icons.js
// Node script that generates PNG icons from SVG source files using sharp.
// Usage:
//   npm install sharp
//   node scripts/generate_icons.js

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const root = path.resolve(__dirname, '..');
const assetsDir = path.join(root, 'assets');

const sources = {
  logo: path.join(assetsDir, 'logo.svg'),
  og: path.join(assetsDir, 'og-image.svg')
};

async function ensureExists(file){
  try{ await fs.promises.access(file); return true }catch(e){ return false }
}

async function gen(){
  if(!await ensureExists(sources.logo)){
    console.error('Missing', sources.logo, '\nPlease ensure logo.svg exists in assets/');
    process.exit(1);
  }
  if(!await ensureExists(sources.og)){
    console.error('Missing', sources.og, '\nPlease ensure og-image.svg exists in assets/');
    process.exit(1);
  }

  const out192 = path.join(assetsDir, 'logo-192.png');
  const out512 = path.join(assetsDir, 'logo-512.png');
  const outOg = path.join(assetsDir, 'og-image.png');

  try{
    console.log('Generating', out192);
    await sharp(sources.logo)
      .resize(192, 192, {fit: 'cover'})
      .png({quality: 90})
      .toFile(out192);

    console.log('Generating', out512);
    await sharp(sources.logo)
      .resize(512, 512, {fit: 'cover'})
      .png({quality: 90})
      .toFile(out512);

    console.log('Generating', outOg);
    await sharp(sources.og)
      .resize(1200, 630, {fit: 'cover'})
      .png({quality: 90})
      .toFile(outOg);

    console.log('Done. Files written to assets/:', ['logo-192.png','logo-512.png','og-image.png'].join(', '));
  }catch(err){
    console.error('Error generating icons:', err);
    process.exit(2);
  }
}

if(require.main === module) gen();
