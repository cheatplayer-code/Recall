import { createWriteStream, mkdirSync, existsSync } from 'fs';
import { join } from 'path';
import { pipeline } from 'stream/promises';
import https from 'https';
import http from 'http';
import { URL } from 'url';
import { basename } from 'path';

const ROOT = new URL('../', import.meta.url).pathname.replace(/^\/([A-Z]:)/, '$1');
const PUBLIC_DIR = join(ROOT, 'public');

const ALL_IMAGES = [
  "https://framerusercontent.com/images/wtiAfgOy1jMohgG7xJaoOaT3UyE.png",
  "https://framerusercontent.com/images/QdN871iP96EN35UHZiKqUb4abPM.png",
  "https://framerusercontent.com/images/UEQLPZ3DXqnE2u4l9xi6Re3KJUA.png",
  "https://framerusercontent.com/images/4qUnQAJJAK1PxcI61JJeP2FyQM.png",
  "https://framerusercontent.com/images/eEdoc8HfpJ6bhMN4sJHwvggeNVo.png",
  "https://framerusercontent.com/images/thZhAPhdQTabbADsxTeUORql4.png",
  "https://framerusercontent.com/images/v5ede4D1lgnhIqMVHDeijVxvks.png",
  "https://framerusercontent.com/images/bLX1rGq6mVta0dWZccdND2ps.png",
  "https://framerusercontent.com/images/YGfo2nJ7T6ryAPukIpHvL6t8zPs.png",
  "https://framerusercontent.com/images/MY6eadrZvyaW2bgOMyLHRcQQ.png",
  "https://framerusercontent.com/images/cES0iJ9BNmZjFFnhIYu4ithkfho.png",
  "https://framerusercontent.com/images/pfSO34tXPcWvXjLwmyhs4y103c.png",
  "https://framerusercontent.com/images/XhRgPDiL0Z31WGxLgTSSWfuhXo.png",
  "https://framerusercontent.com/images/JAiT3LlagYS7Ovk3fqFSxtypo.png",
  "https://framerusercontent.com/images/OItbL3ySDQh3h1l7nM4GBf8J10o.png",
  "https://framerusercontent.com/images/jEF8FbMUTOrx44shbSGr0s6wLCo.png",
  "https://framerusercontent.com/images/UiIgIwGvZBSpC99BzWPhWqSX8.png",
  "https://framerusercontent.com/images/3matbM3hFnMuVpLfntXiY2AvTRs.png",
  "https://framerusercontent.com/images/yZWeKgRc9KD9BdM4lqxbYAknus.png",
  "https://framerusercontent.com/images/KslqjTkhNgtySml2bBAXJ5tSuq4.svg",
  "https://framerusercontent.com/images/8B5CgLIlCSgsc2DPXcMo5Udt8Y.svg",
  "https://framerusercontent.com/images/jvNPUckE3UlAbOrXMKCJWu0W4.svg",
  "https://framerusercontent.com/images/MNVQialRKUsmYoxDnX3j5T5r08U.svg",
  "https://framerusercontent.com/images/SqUNmEz4xPm8sGGyFXitVXkBc.png",
  "https://framerusercontent.com/images/yaeSG5tkIoK5Hdd1758IOs2x4.png",
  "https://framerusercontent.com/images/hLuDSlwriuxQwgy8MDOtEu87uk.png",
  "https://framerusercontent.com/images/RltalDWHPVeFdVlC741amM9w6Y.png",
  "https://framerusercontent.com/images/IY57ago0ItxOBVGQEe3F3oqDlYg.png",
  "https://framerusercontent.com/images/6RkNqCiXPM3MoO9EobFMvzXN0.png",
  "https://framerusercontent.com/images/Hy9vFQ3p4PEQ6CZVwQidKoirM.png",
  "https://framerusercontent.com/images/7j46H8hSm1pcfHFImGrpOiLSwSs.png",
  "https://framerusercontent.com/images/ZAQjbU9DeLPOi8y8dluoO0w8sk.png",
  "https://framerusercontent.com/images/OeyHO7JKrGk09EzXcUX5fSZVwJw.png",
  "https://framerusercontent.com/images/rdGXLVPdqJXuC3JJoLIXJsAGnM.png",
  "https://framerusercontent.com/images/dXbSZc6lJ5DxVWXuREfx0RsM2X4.png",
  "https://framerusercontent.com/images/kRJE6k7K9Fj1L2L7VbS7P5lFfQ.png",
  "https://framerusercontent.com/images/uTj1HXF7xqHX3v9j4Q3lP1Jbbc.png",
  "https://framerusercontent.com/images/Fzf4bWOE0zO0FXJUQD3CmkWoF4U.png",
  "https://framerusercontent.com/images/TjH9sB5Z6yk1Gv8J7K3NpQ1Xr8.png",
  "https://framerusercontent.com/images/n7OQz8m2oBtiSfg0H1vGPuDkH8E.png",
];

const SEO_IMAGES = [
  "https://framerusercontent.com/images/xZVHSFo3pv5mN9ewJpNn4UlHKcU.png",
  "https://framerusercontent.com/images/T7YRHwXka5lty9DPsHt6fbzEctc.png",
];

function download(url, dest) {
  return new Promise((resolve, reject) => {
    const file = createWriteStream(dest);
    const proto = url.startsWith('https') ? https : http;
    proto.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Referer': 'https://fabric.so/',
        'Accept': 'image/*,*/*;q=0.9',
      }
    }, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        file.close();
        download(res.headers.location, dest).then(resolve).catch(reject);
        return;
      }
      if (res.statusCode !== 200) {
        file.close();
        reject(new Error(`HTTP ${res.statusCode}`));
        return;
      }
      pipeline(res, file).then(resolve).catch(reject);
    }).on('error', reject);
  });
}

async function downloadBatch(urls, dir, batchSize = 5) {
  mkdirSync(dir, { recursive: true });
  let ok = 0, fail = 0;
  for (let i = 0; i < urls.length; i += batchSize) {
    const batch = urls.slice(i, i + batchSize);
    await Promise.allSettled(batch.map(async (url) => {
      const filename = basename(new URL(url).pathname);
      const dest = join(dir, filename);
      if (existsSync(dest)) { ok++; return; }
      try {
        await download(url, dest);
        ok++;
        console.log(`✓ ${filename}`);
      } catch (e) {
        fail++;
        console.error(`✗ ${filename}: ${e.message}`);
      }
    }));
  }
  return { ok, fail };
}

async function main() {
  console.log('Downloading Fabric.so assets...\n');
  const imagesDir = join(PUBLIC_DIR, 'images');
  const seoDir = join(PUBLIC_DIR, 'seo');
  const r1 = await downloadBatch(ALL_IMAGES, imagesDir);
  const r2 = await downloadBatch(SEO_IMAGES, seoDir);
  console.log(`\nDone! Images: ${r1.ok} ok / ${r1.fail} failed. SEO: ${r2.ok} ok / ${r2.fail} failed.`);
}

main().catch(console.error);
