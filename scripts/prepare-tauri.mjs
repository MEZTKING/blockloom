/* Build the static asset folder consumed by Tauri. Keeps the web/PWA build canonical. */
import { cp, mkdir, rm, stat } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const out = join(root, 'dist');

await rm(out, { recursive: true, force: true });
await mkdir(out, { recursive: true });

for (const directory of ['js', 'assets']) {
  await cp(join(root, directory), join(out, directory), { recursive: true });
}
for (const file of ['index.html', 'styles.css', 'manifest.webmanifest']) {
  await cp(join(root, file), join(out, file));
}

const files = ['index.html', 'styles.css', 'js/app.js', 'assets/icon-512.png'];
for (const file of files) {
  if (!(await stat(join(out, file))).isFile()) throw new Error(`Missing native asset: ${file}`);
}
console.log(`Tauri frontend prepared at ${out}`);
