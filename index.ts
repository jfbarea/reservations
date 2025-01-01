
import dotenv from 'dotenv';
import cron from 'node-cron';
import  { Cookie } from 'puppeteer';

import getFirstAvailableFly from './utils/getFirstAvailableFly';
import getDateInFourDays from './utils/getDateInFourDays';
import login from './utils/login';
import reserve from './utils/reserve';
dotenv.config();
const { BERNARDO_PASS, BERNARDO_USER } = process.env
const TEST_DATE = '2024-12-30';
const USERS = [
  {
    password: BERNARDO_PASS || '',
    username: BERNARDO_USER || '',
  },
];

async function run(cookies: Cookie[]) {
  try { 
    const date = getDateInFourDays();
    console.log('Realizando llamada autenticada...');
    console.log('Cookies:', cookies?.map(({ name, value }) => `${name}=${value}`).join('; '));
    const firstAvailableFly = await getFirstAvailableFly(cookies, date);
    if (firstAvailableFly) {
      console.log('Reservando fly:', {firstAvailableFly, date});
      await reserve(firstAvailableFly, cookies, date);
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
cron.schedule('40 12 * * *', async () => {
  const cookies = await Promise.all(USERS.map(user => login(user)));
  if (cookies?.length>0) {
    for (const cookie of cookies){
      await run(cookie);
    }
  }
});
// Ejecución
(async () => {
  const cookies = await Promise.all(USERS.map(user => login(user)));
  if (cookies?.length>0) {
    for (const cookie of cookies){
      await run(cookie);
    }
  }
  console.log(`Script finalizado a las ${new Date().toISOString()}`)
})();
