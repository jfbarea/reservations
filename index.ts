
import  { Cookie } from 'puppeteer';

import getFirstAvailableFly from './utils/getFirstAvailableFly';
import getDateInFourDays from './utils/getDateInFourDays';
import { loadCookies } from './utils/login';
import reserve from './utils/reserve';
const FIRST_FLY = 5;

async function firstTry(cookies: Cookie[], date: string) {
  console.log('Reservando fly:', {FIRST_FLY, date});
  return await reserve(FIRST_FLY, cookies, date);
}

async function run(cookies: Cookie[]) {
  try { 
    const date = getDateInFourDays();
    const firstTryResponse = await firstTry(cookies, date);
    console.time('TIME getFirstAvailableFly');
    if (firstTryResponse) {
      const firstAvailableFly = await getFirstAvailableFly(cookies, date);
      console.timeEnd('TIME getFirstAvailableFly')
      if (firstAvailableFly) {
        console.log('Reservando fly:', {firstAvailableFly, date});
        await reserve(firstAvailableFly, cookies, date);
      } else {
        console.log('No hay flys disponibles');
      } 
    }
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error en la llamada autenticada:', error.message);
    } else {
      console.error('Error en la llamada autenticada:', error);
    }
  }
}

// Ejecución
(async () => {
  console.log(`Script iniciado a las ${new Date().toISOString()}`)
  const cookies = loadCookies();
  if (cookies?.length>0) {
    for (const cookie of cookies){
      await run(cookie);
    }
  }
  console.log(`Script finalizado a las ${new Date().toISOString()}`)
  return;
})();
