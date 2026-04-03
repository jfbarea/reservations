const TARGET_HOUR = 22;
const TARGET_MINUTE = 0;
const TIMEZONE = 'Europe/Madrid';

function getMadridTime(): Date {
  const now = new Date();
  const madridStr = now.toLocaleString('en-US', { timeZone: TIMEZONE });
  return new Date(madridStr);
}

export default async function waitUntilTarget(): Promise<void> {
  const madridNow = getMadridTime();
  const target = new Date(madridNow);
  target.setHours(TARGET_HOUR, TARGET_MINUTE, 0, 0);

  const diff = target.getTime() - madridNow.getTime();

  if (diff <= 0) {
    console.log(`Ya son las ${TARGET_HOUR}:${String(TARGET_MINUTE).padStart(2, '0')} o más tarde en Madrid. Ejecutando inmediatamente.`);
    return;
  }

  const minutes = Math.floor(diff / 60000);
  const seconds = Math.floor((diff % 60000) / 1000);
  console.log(`Esperando ${minutes}m ${seconds}s hasta las ${TARGET_HOUR}:${String(TARGET_MINUTE).padStart(2, '0')} Europe/Madrid...`);

  await new Promise(resolve => setTimeout(resolve, diff));
  console.log(`Son las ${TARGET_HOUR}:${String(TARGET_MINUTE).padStart(2, '0')} Europe/Madrid. Ejecutando.`);
}
