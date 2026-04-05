const TARGET_HOUR = 22;
const TARGET_MINUTE = 0;
const TIMEZONE = 'Europe/Madrid';

function getMadridTime(): Date {
  const now = new Date();
  const madridStr = now.toLocaleString('en-US', { timeZone: TIMEZONE });
  return new Date(madridStr);
}

const MAX_WAIT_MS = 35 * 60 * 1000; // 35 minutos — descarta el cron de la temporada equivocada
const TARGET_STR = `${TARGET_HOUR}:${String(TARGET_MINUTE).padStart(2, '0')}`;

// checkOnly: solo comprueba si merece ejecutar (sale si la espera es >20 min), sin esperar
// !checkOnly: espera hasta la hora objetivo
export default async function waitUntilTarget({ checkOnly = false } = {}): Promise<void> {
  const madridNow = getMadridTime();
  const target = new Date(madridNow);
  target.setHours(TARGET_HOUR, TARGET_MINUTE, 0, 0);

  const diff = target.getTime() - madridNow.getTime();

  if (diff <= 0) {
    if (!checkOnly) console.log(`Ya son las ${TARGET_STR} o más tarde en Madrid. Ejecutando inmediatamente.`);
    return;
  }

  if (diff > MAX_WAIT_MS) {
    console.log(`Faltan más de 35 minutos (${Math.floor(diff / 60000)}m). Saltando ejecución para no gastar minutos de CI.`);
    process.exit(0);
  }

  if (checkOnly) return; // Espera dentro del margen: continuamos con el login anticipado

  const minutes = Math.floor(diff / 60000);
  const seconds = Math.floor((diff % 60000) / 1000);
  console.log(`Esperando ${minutes}m ${seconds}s hasta las ${TARGET_STR} Europe/Madrid...`);

  await new Promise(resolve => setTimeout(resolve, diff));
  console.log(`Son las ${TARGET_STR} Europe/Madrid. Lanzando reserva.`);
}
