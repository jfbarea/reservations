import cron from 'node-cron';
import { Cookie } from 'puppeteer';
import getFirstAvailableFly from './utils/getFirstAvailableFly';
import getDateInFourDays from './utils/getDateInFourDays';
import { loginAll } from './utils/login';
import reserve from './utils/reserve';

const FIRST_FLY = 5;

async function firstTry(cookies: Cookie[], date: string) {
  console.log('Reservando fly:', { FIRST_FLY, date });
  return await reserve(FIRST_FLY, cookies, date);
}

async function run(cookies: Cookie[]) {
  try {
    const date = getDateInFourDays();
    const firstTryResponse = await firstTry(cookies, date);
    console.time('TIME getFirstAvailableFly');
    if (!firstTryResponse) {
      const firstAvailableFly = await getFirstAvailableFly(cookies, date);
      console.timeEnd('TIME getFirstAvailableFly');
      if (firstAvailableFly) {
        console.log('Reservando fly:', { firstAvailableFly, date });
        await reserve(firstAvailableFly, cookies, date);
      } else {
        console.log('No hay flys disponibles');
      }
    }
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error en la reserva:', error.message);
    } else {
      console.error('Error en la reserva:', error);
    }
  }
}

// Login a las 21:50 Europe/Madrid para tener cookies listas antes de las 22:00
let cachedCookies: Cookie[][] = [];

cron.schedule('50 21 * * *', async () => {
  console.log(`[${new Date().toISOString()}] Haciendo login anticipado...`);
  cachedCookies = await loginAll();
  console.log(`[${new Date().toISOString()}] Login completado. Cookies listas para las 22:00.`);
}, { timezone: 'Europe/Madrid' });

// Reserva exacta a las 22:00:00 Europe/Madrid
cron.schedule('0 22 * * *', async () => {
  console.log(`[${new Date().toISOString()}] Lanzando reservas...`);
  if (cachedCookies.length === 0) {
    console.log('No hay cookies cacheadas, haciendo login ahora...');
    cachedCookies = await loginAll();
  }
  await Promise.all(cachedCookies.map((cookie) => run(cookie)));
  cachedCookies = []; // limpiar para el día siguiente
  console.log(`[${new Date().toISOString()}] Reservas finalizadas.`);
}, { timezone: 'Europe/Madrid' });

console.log('Daemon iniciado. Esperando cron de las 21:50 y 22:00 Europe/Madrid...');
