import puppeteer, { Cookie } from 'puppeteer';
import fs from 'fs';
import os from 'os';
import path from 'path';
import S from '../../settings'

const homeDir = os.homedir();
const filePath = path.join(homeDir, 'cookies.json');

function saveCookies(cookies:Cookie[][]) {
  fs.writeFileSync(filePath, JSON.stringify(cookies, null, 2), 'utf8');
  console.log('Cookies guardadas en cookies.json');
}

async function login({username, password}: {username: string, password: string}) {
  console.log(`Iniciando sesión para el usuario ${username} ${password}...`);
  const browser = await puppeteer.launch({
  headless: true,
  args: ['--no-sandbox', '--disable-setuid-sandbox'],
});
  const page = await browser.newPage();

  await page.goto('https://www.alborangolf.com/app/reservas-abonados/login');
  await page.type('input[name="form-username"]', username);
  await page.type('input[name="form-password"]', password);
  await page.click('button[type="submit"]'); // Ajusta según el botón de tu formulario

  await page.waitForNavigation();
  const cookies = await browser.cookies();
  await browser.close();
  return cookies;
}

( async () => {
  console.log(`Script de LOGIN iniciado a las ${new Date().toISOString()}`)
  const cookies = await Promise.all(S.USERS.map(user => login(user)));
  saveCookies(cookies);
  console.log(`Script de LOGIN finalizado a las ${new Date().toISOString()}`)

})()