
import  { Cookie } from 'puppeteer';

import getFirstAvailableFly from './utils/getFirstAvailableFly';
import getDateInFourDays from './utils/getDateInFourDays';
import { loginAll } from './utils/login';
import reserve from './utils/reserve';
import waitUntilTarget from './utils/waitUntilTarget';
import { notify } from './utils/notify';
import S from './settings';

const FIRST_FLY = 5;
const FIRST_FLY_HORA = '8:02';
const DRY_RUN = process.argv.includes('--dry-run');

async function run(cookies: Cookie[], email: string) {
  const date = getDateInFourDays();

  if (DRY_RUN) {
    console.log('[DRY-RUN] Login OK. Consultando flys disponibles...');
    const result = await getFirstAvailableFly(cookies, date);
    if (result) {
      console.log(`[DRY-RUN] Reservaría fly ${result.fly} a las ${result.hora} para ${date}`);
    } else {
      console.log(`[DRY-RUN] No hay flys disponibles para ${date}`);
    }
    return;
  }

  try {
    const firstResult = await reserve(FIRST_FLY, cookies, date, FIRST_FLY_HORA);

    if (firstResult.ok) return; // Reservado en el horario preferido, todo bien

    // Fly 5 (8:02) no disponible — buscar alternativa
    const fallback = await getFirstAvailableFly(cookies, date);

    if (!fallback) {
      await notify(
        email,
        `[Golf] ${firstResult.nombre}: sin reserva para ${date}`,
        `No se ha podido reservar para ${date}.\n\nMotivo: ${firstResult.errores}\n\nNo había ningún fly disponible como alternativa.`
      );
      return;
    }

    const fallbackResult = await reserve(fallback.fly, cookies, date, fallback.hora);

    if (fallbackResult.ok) {
      await notify(
        email,
        `[Golf] ${fallbackResult.nombre}: reservado a las ${fallbackResult.hora} (no a las ${FIRST_FLY_HORA})`,
        `Reserva realizada para ${date}, pero NO en el horario preferido.\n\nHorario reservado: ${fallbackResult.hora}\nMotivo por el que falló ${FIRST_FLY_HORA}: ${firstResult.errores}`
      );
    } else {
      await notify(
        email,
        `[Golf] ${fallbackResult.nombre}: sin reserva para ${date}`,
        `No se ha podido reservar para ${date}.\n\nIntento 1 (${FIRST_FLY_HORA}): ${firstResult.errores}\nIntento 2 (${fallback.hora}): ${fallbackResult.errores}`
      );
    }
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error('Error en la reserva:', msg);
    await notify(
      email,
      `[Golf] Error inesperado en la reserva para ${date}`,
      `Se produjo un error inesperado al intentar reservar para ${date}.\n\nError: ${msg}`
    );
  }
}

// Ejecución
(async () => {
  console.log(`Script iniciado a las ${new Date().toISOString()}`);

  if (DRY_RUN) {
    console.log('[DRY-RUN] Modo dry-run activado. No se realizarán reservas.');
  } else {
    // Comprobar si merece la pena ejecutar (descarta el cron de la temporada equivocada)
    await waitUntilTarget({ checkOnly: true });
  }

  // Login anticipado: se hace antes de las 22:00 para que las cookies estén listas
  const cookies: Cookie[][] = await loginAll();

  if (!DRY_RUN) {
    // Esperar hasta las 22:00:00 exactas para lanzar la reserva
    await waitUntilTarget({ checkOnly: false });
  }

  if (cookies?.length > 0) {
    await Promise.all(cookies.map((cookie, i) => run(cookie, S.USERS[i].username)));
  }
  console.log(`Script finalizado a las ${new Date().toISOString()}`);
  return;
})();
