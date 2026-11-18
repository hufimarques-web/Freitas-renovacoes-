import {build} from 'esbuild';
import fs from 'node:fs/promises';
import path from 'node:path';
const root=process.cwd();
await fs.mkdir('dist',{recursive:true});
await fs.cp('public','dist',{recursive:true});
await build({entryPoints:['app/client.tsx'],outfile:'dist/app.js',bundle:true,minify:true,jsx:'automatic',format:'esm',target:['es2020'],define:{'process.env.NODE_ENV':'"production"'},logLevel:'warning'});
await build({entryPoints:['app/render.tsx'],outfile:'.sites-runtime/render.mjs',bundle:true,jsx:'automatic',platform:'node',format:'esm',packages:'external',logLevel:'warning'});
const {html}=await import(path.join(root,'.sites-runtime/render.mjs')+'?v='+Date.now());
await fs.copyFile('app/globals.css','dist/style.css');
await fs.writeFile('dist/index.html',`<!doctype html><html lang="pt-PT"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover"><meta name="theme-color" content="#233d33"><title>Freitas Renovações — Obras e remodelações em Aveiro</title><meta name="description" content="Obras e remodelações em Aveiro. Chave na mão, com orçamento fechado, prazo em contrato e garantia escrita."><meta property="og:title" content="Freitas Renovações — Obras e remodelações em Aveiro"><meta property="og:description" content="Descubra a transformação. Cozinhas, casas de banho e interiores em Aveiro."><meta property="og:image" content="/media/hero-poster.jpg"><meta property="og:type" content="website"><meta property="og:locale" content="pt_PT"><link rel="icon" href="/favicon.svg"><link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link rel="stylesheet" href="/style.css"></head><body><div id="root">${html}</div><script type="module" src="/app.js"></script><noscript><style>.journey{height:100svh}.scene-copy:not(.first){display:none}.room-kitchen{opacity:1}.scene-copy.first{opacity:1}.scroll-cue{display:none}</style><p style="padding:20px;text-align:center">Ative JavaScript para ver as animações e usar os comparadores. Para conversar sobre a sua casa, ligue <a href="tel:+351961455997">961 455 997</a>.</p></noscript></body></html>`);
const expected=Array.from({length:192},(_,i)=>i+1);
for(const folder of ['kitchen','passage','bathroom','ceramic-cut','ceramic-lay'])for(const n of expected)await fs.access(`dist/media/${folder}/${String(n).padStart(3,'0')}.jpg`);
for(const folder of ['kitchen-handset','passage-handset','bathroom-handset','ceramic-cut-handset','ceramic-lay-handset'])for(const n of expected)await fs.access(`dist/media/${folder}/${String(n).padStart(3,'0')}.webp`);
for(const n of ['before','after'])await fs.access(`dist/media/bath-${n}.webp`);
for(const name of ['hero-poster.jpg','kitchen-before.webp','kitchen-after.webp'])await fs.access('dist/media/'+name);
for(const name of ['bath-cutaway.webp','bath-cutaway-phone.webp'])await fs.access('dist/media/'+name);
for(const folder of ['kitchen-assembly','kitchen-assembly-handset'])for(const n of expected)await fs.access(`dist/media/${folder}/${String(n).padStart(3,'0')}.webp`);
for(const name of ['assembly-before.webp','assembly-after.webp'])await fs.access('dist/media/'+name);
for(const folder of ['bath-build','bath-build-handset'])for(let n=0;n<8;n++)await fs.access(`dist/media/${folder}/${String(n).padStart(2,'0')}.webp`);
await fs.access('dist/media/freitas-logo-official.svg');
for(const folder of ['projects','projects-handset'])for(let n=1;n<=4;n++)await fs.access(`dist/media/${folder}/${String(n).padStart(2,'0')}.webp`);
console.log('Built static site. Verified 960 hero JPEG frames, 960 lightweight hero frames, 384 kitchen assembly frames and static assets.');

for(const name of ["dm-serif-display-regular.ttf","dm-serif-display-italic.ttf","OFL-DM-Serif-Display.txt"])await fs.access("dist/fonts/"+name);

for(const folder of ["project-scenes","project-scenes-handset"])for(let n=1;n<=4;n++)await fs.access(`dist/media/${folder}/${String(n).padStart(2,"0")}.webp`);

for(const folder of ["kitchen-hd","passage-hd","bathroom-hd","ceramic-cut-hd","ceramic-lay-hd"])for(const n of expected)await fs.access(`dist/media/${folder}/${String(n).padStart(3,"0")}.webp`);
