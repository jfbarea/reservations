import { Cookie } from 'puppeteer'; 

export default async function getFirstAvailableFly(cookies: Cookie[], date: string) {
  console.log('Realizando llamada autenticada...', {cookies, date});
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
  console.log('Respuesta:', response);
  const flyList = response.recorrido1;

  for (const fly of flyList) {
    if (fly.jugadoreslibres > 0) {
      console.log('Fly disponible:', fly);
      return fly.fly;
    }
  }
  return null;
}