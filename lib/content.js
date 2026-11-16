import fs from 'node:fs';
import path from 'node:path';

// Page markup lives in /content/*.html so text can be edited without touching code.
export function readContent(name) {
  return fs.readFileSync(path.join(process.cwd(), 'content', `${name}.html`), 'utf8');
}
