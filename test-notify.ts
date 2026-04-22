import { notify } from './utils/notify';
import S from './settings';
import getDateInFourDays from './utils/getDateInFourDays';

const date = getDateInFourDays();
const FIRST_FLY_HORA = '8:02';
const TEST_PREFIX = '[TEST - IGNORAR] ';

async function testNotify(email: string, subject: string, body: string) {
  await notify(
    email,
    `${TEST_PREFIX}${subject}`,
    `⚠️ Email de prueba generado automáticamente. Por favor ignóralo.\n\n---\n\n${body}`
  );
}

// Escenario 1: fly 5 (8:02) fallido, reserva conseguida en horario alternativo
async function escenario1(email: string) {
  const nombre = 'JUGADOR MOCK';
  const fallbackHora = '16:18';
  await testNotify(
    email,
    `[Golf] ${nombre}: reservado a las ${fallbackHora} (no a las ${FIRST_FLY_HORA})`,
    `Reserva realizada para ${date}, pero NO en el horario preferido.\n\nHorario reservado: ${fallbackHora}\nMotivo por el que falló ${FIRST_FLY_HORA}: Abono caducado en esta fecha (mock)`
  );
}

// Escenario 2: fly 5 fallido, sin alternativas disponibles
async function escenario2(email: string) {
  const nombre = 'JUGADOR MOCK';
  await testNotify(
    email,
    `[Golf] ${nombre}: sin reserva para ${date}`,
    `No se ha podido reservar para ${date}.\n\nMotivo: Abono caducado en esta fecha (mock)\n\nNo había ningún fly disponible como alternativa.`
  );
}

// Escenario 3: error inesperado durante la reserva
async function escenario3(email: string) {
  const nombre = 'JUGADOR MOCK';
  await testNotify(
    email,
    `[Golf] ${nombre}: sin reserva para ${date}`,
    `No se ha podido reservar para ${date}.\n\nIntento 1 (${FIRST_FLY_HORA}): Abono caducado en esta fecha (mock)\nIntento 2 (16:18): fetch failed - connection timeout (mock)`
  );
}

(async () => {
  const { username } = S.USERS[0];
  console.log(`Enviando emails de test a ${username}...`);
  console.log(`\n[${username}] Escenario 1: fallback a otro horario`);
  await escenario1(username);
  console.log(`[${username}] Escenario 2: sin reserva, sin alternativas`);
  await escenario2(username);
  console.log(`[${username}] Escenario 3: sin reserva, dos intentos fallidos`);
  await escenario3(username);
  console.log('\nTest de notificaciones completado.');
})();
