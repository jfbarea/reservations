import puppeteer, { Cookie } from 'puppeteer';
import S from '../../settings'

// Si se define PUPPETEER_EXECUTABLE_PATH se usa ese binario (ej: /usr/bin/chromium en Linux).
// Si no, Puppeteer usa su Chromium bundled (comportamiento por defecto en GitHub Actions).
const executablePath = process.env.PUPPETEER_EXECUTABLE_PATH || undefined;

export async function login({username, password}: {username: string, password: string}) {
  console.log(`Iniciando sesión para el usuario ${username}...`);
  const browser = await puppeteer.launch({
    ...(executablePath ? { executablePath } : {}),
    headless: true,
  args: [
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--disable-dev-shm-usage',
    '--disable-gpu'
  ],
});
  const page = await browser.newPage();

  await page.goto('https://www.alborangolf.com/app/reservas-abonados/login');
  await page.type('input[name="form-username"]', username);
  await page.type('input[name="form-password"]', password);
  await page.click('button[type="submit"]');

  await page.waitForNetworkIdle({ idleTime: 1000, timeout: 30000 });
  const cookies = await browser.cookies();
  await browser.close();
  return cookies;
}

export async function loginAll(): Promise<Cookie[][]> {
  console.log(`Login iniciado a las ${new Date().toISOString()}`);
  const cookies = await Promise.all(S.USERS.map(user => login(user)));
  console.log(`Login finalizado a las ${new Date().toISOString()}`);
  return cookies;
}
