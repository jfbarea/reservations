
import { Cookie } from "puppeteer";
export default async function reserve(fly: number, cookies: Cookie[], date: string) {
  const response = await fetch("https://www.alborangolf.com/app/reservas-abonados/api/reservas/reserva-nueva?dato=3939393", {
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
  console.log('Respuesta:', await response.json());
  console.log('Reserva realizada con éxito:', {fly, date});
}