
import path from 'path';
import os from 'os';
import fs from 'fs';

const homeDir = os.homedir();
const filePath = path.join(homeDir, 'cookies.json');


export function loadCookies() {
  if (fs.existsSync(filePath)) {
    const cookies = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    console.log('Cookies cargadas de cookies.json');
    return cookies;
  } else {
    console.log(`No se encontró el archivo ${filePath}`);
    return [];
  }
}




