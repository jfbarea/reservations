
import puppeteer from 'puppeteer';
export default async function login({username, password}: {username: string, password: string}) {
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
