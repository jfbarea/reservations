
import puppeteer, { Cookie } from 'puppeteer'; 

const { BERNARDO_PASS, BERNARDO_USER } = process.env
const DATE = '2024-12-29';
const USERS = [
  {
    password: BERNARDO_PASS || '',
    username: BERNARDO_USER || '',
  },
];

async function login({username, password}: {username: string, password: string}) {

  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  await page.goto('https://www.alborangolf.com/app/reservas-abonados/login');
  await page.type('input[name="form-username"]', username);
  await page.type('input[name="form-password"]', password);
  await page.click('button[type="submit"]'); // Ajusta según el botón de tu formulario

  await page.waitForNavigation();
  const cookies = await browser.cookies();
  console.log('Cookies:', cookies);

  await browser.close();
  return cookies;
}


async function run(cookies: Cookie[]) {
  try { 
    console.log('Realizando llamada autenticada...');
    console.log('Cookies:', cookies?.map(({ name, value }) => `${name}=${value}`).join('; '));
    const firstAvailableFly = await getFirstAvailableFly(cookies, DATE);
    if (firstAvailableFly) {
      console.log('Fly disponible:', firstAvailableFly);
      await reserve(firstAvailableFly, cookies, DATE);
    } else {
      console.log('No hay flys disponibles');
    }
    return
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error en la llamada autenticada:', error.message);
    } else {
      console.error('Error en la llamada autenticada:', error);
    }
  }
}

async function getFirstAvailableFly(cookies: Cookie[], date: string) {
  const response = await (await fetch("https://www.alborangolf.com/app/reservas-abonados/api/versalidas", {
    "headers": {
      "accept": "application/json, text/plain, */*",
      "accept-language": "es-ES,es;q=0.9",
      "cache-control": "no-cache",
      "content-type": "application/x-www-form-urlencoded",
      "priority": "u=1, i",
      "sec-ch-ua": "\"Chromium\";v=\"131\", \"Not_A Brand\";v=\"24\"",
      "sec-ch-ua-mobile": "?0",
      "sec-ch-ua-platform": "\"macOS\"",
      "sec-fetch-dest": "empty",
      "sec-fetch-mode": "cors",
      "sec-fetch-site": "same-origin",
      "cookie": cookies?.map(({ name, value }) => `${name}=${value}`).join('; '),
      "Referer": "https://www.alborangolf.com/app/reservas-abonados/",
      "Referrer-Policy": "no-referrer-when-downgrade"
    },
    "body": `admin=0&fecha=${date}&idreserva=`,
    "method": "POST"
  })).json();
  const flyList = response.recorrido1;
  for (const fly of flyList) {
    if (fly.jugadoreslibres > 0) {
      return fly.fly;
    }
  }
  return null;
}

async function reserve(fly: number, cookies: Cookie[], date: string) {
  await fetch("https://www.alborangolf.com/app/reservas-abonados/api/reservas/reserva-nueva?dato=3939393", {
    "headers": {
      "accept": "application/json, text/plain, */*",
      "accept-enconding": "utf8",
      "accept-language": "es-ES,es;q=0.9",
      "content-type": "application/json",
      "priority": "u=1, i",
      "sec-ch-ua": "\"Chromium\";v=\"131\", \"Not_A Brand\";v=\"24\"",
      "sec-ch-ua-mobile": "?0",
      "sec-ch-ua-platform": "\"macOS\"",
      "sec-fetch-dest": "empty",
      "sec-fetch-mode": "cors",
      "sec-fetch-site": "same-origin",
      "cookie": cookies?.map(({ name, value }) => `${name}=${value}`).join('; '),
      "Referer": "https://www.alborangolf.com/app/reservas-abonados/",
      "Referrer-Policy": "no-referrer-when-downgrade"
    },
    "body": `{\"tarifa_id\":0,\"pais\":\"ES\",\"fecha\":\"${date}\",\"recorrido\":1,\"jugadores\":0,\"buggies\":0,\"fly\":${fly},\"nombre_jugador\":\"BERNARDO BAREA ROSADO\",\"datos_greenfees\":[]}`,
    "method": "POST"
  });
}
// Ejecución
(async () => {
  const cookies = await Promise.all(USERS.map(user => login(user)));
  if (cookies?.length>0) {
    for (const cookie of cookies){
      await run(cookie);
    }
  }
})();