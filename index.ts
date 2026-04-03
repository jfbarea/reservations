
import  { Cookie } from 'puppeteer';

import getFirstAvailableFly from './utils/getFirstAvailableFly';
import getDateInFourDays from './utils/getDateInFourDays';
import { loginAll } from './utils/login';
import reserve from './utils/reserve';
import waitUntilTarget from './utils/waitUntilTarget';

const FIRST_FLY = 5;
const DRY_RUN = process.argv.includes('--dry-run');

async function firstTry(cookies: Cookie[], date: string) {
  console.log('Reservando fly:', {FIRST_FLY, date});
  return await reserve(FIRST_FLY, cookies, date);
}

async function run(cookies: Cookie[]) {
  try {
    const date = getDateInFourDays();

    if (DRY_RUN) {
      console.log('[DRY-RUN] Login OK. Consultando flys disponibles...');
      const firstAvailableFly = await getFirstAvailableFly(cookies, date);
      if (firstAvailableFly) {
        console.log(`[DRY-RUN] Reservaría fly ${firstAvailableFly} para ${date}`);
      } else {
        console.log(`[DRY-RUN] No hay flys disponibles para ${date}`);
      }
      return;
    }

    const firstTryResponse = await firstTry(cookies, date);
    console.time('TIME getFirstAvailableFly');
    if (!firstTryResponse) {
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
  console.log(`Script iniciado a las ${new Date().toISOString()}`);

  if (DRY_RUN) {
    console.log('[DRY-RUN] Modo dry-run activado. No se realizarán reservas.');
  } else {
    await waitUntilTarget();
  }

  const cookies: Cookie[][] = await loginAll();
  if (cookies?.length > 0) {
    await Promise.all(cookies.map((cookie) => run(cookie)));
  }
  console.log(`Script finalizado a las ${new Date().toISOString()}`);
  return;
})();
