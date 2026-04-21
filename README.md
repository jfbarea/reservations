# Toyo Reservations

Automatiza la reserva diaria de hora de golf en [Alborán Golf](https://www.alborangolf.com) para dos usuarios abonados. Cada día a las **22:00 hora de Madrid** se abre la ventana de reservas para 4 días vista; este script se lanza justo en ese momento y reserva el primer fly disponible.

## Cómo funciona

### Flujo general

```
21:55 Madrid
  └─ cron-job.org llama a la GitHub API
       └─ GitHub Actions arranca el workflow
            ├─ Login con Puppeteer (para los dos usuarios en paralelo)
            ├─ Espera hasta las 22:00:00 exactas
            └─ Reserva: intenta fly 5 primero, si no hay busca el primero libre
```

### Paso a paso

1. **Trigger externo (cron-job.org):** A las 21:55 hora de Madrid, cron-job.org hace una llamada POST a la GitHub API para lanzar el workflow via `workflow_dispatch`. Esto evita los retrasos de hasta 90 minutos que introduce el scheduler nativo de GitHub Actions.

2. **Login anticipado:** El script lanza Puppeteer (Chromium headless) y hace login en la web de Alborán Golf para los dos usuarios configurados. Obtiene las cookies de sesión y cierra el navegador. Esto ocurre antes de las 22:00 para que las cookies estén listas en el momento de la reserva.

3. **Espera hasta las 22:00:00:** `waitUntilTarget` calcula el tiempo restante hasta las 22:00 en la zona horaria `Europe/Madrid` y hace un `setTimeout` hasta ese instante exacto.

4. **Reserva:** Para cada usuario (en paralelo):
   - Intenta reservar el fly 5 directamente.
   - Si no está disponible, consulta la lista de flys y reserva el primero con plazas libres.
   - La fecha objetivo es siempre **hoy + 4 días** (`getDateInFourDays`).

### Estructura del código

```
index.ts                  # Punto de entrada y orquestación
settings.ts               # Lee credenciales de variables de entorno
utils/
  login/
    run.ts                # Login con Puppeteer, devuelve cookies de sesión
    index.ts              # Re-exporta login y loginAll
  waitUntilTarget.ts      # Espera hasta las 22:00 Europe/Madrid
  getDateInFourDays.ts    # Devuelve la fecha objetivo en formato YYYY-MM-DD
  getFirstAvailableFly.ts # Consulta la API de Alborán y devuelve el primer fly libre
  reserve.ts              # Llama a la API de Alborán para hacer la reserva
```

## Configuración

### Variables de entorno

Definidas como secrets en GitHub Actions (entorno `production`):

| Variable        | Descripción                        |
|-----------------|------------------------------------|
| `BERNARDO_USER` | Usuario del primer abonado         |
| `BERNARDO_PASS` | Contraseña del primer abonado      |
| `CECILIO_USER`  | Usuario del segundo abonado        |
| `CECILIO_PASS`  | Contraseña del segundo abonado     |

Para desarrollo local, crea un archivo `.env` en la raíz con esas mismas variables.

### Trigger externo (cron-job.org)

El scheduler nativo de GitHub Actions puede retrasarse 30-90 minutos, lo que haría que el script arrancase después de las 22:00 y perdiese la ventana de reserva. Para evitarlo, el workflow solo tiene `workflow_dispatch` y se dispara desde cron-job.org:

| Campo    | Valor                                                                                         |
|----------|-----------------------------------------------------------------------------------------------|
| URL      | `https://api.github.com/repos/jfbarea/reservations/actions/workflows/reserve.yml/dispatches` |
| Método   | `POST`                                                                                        |
| Headers  | `Accept: application/vnd.github+json`<br>`Authorization: Bearer <TOKEN>`<br>`X-GitHub-Api-Version: 2022-11-28` |
| Body     | `{"ref": "main"}`                                                                             |
| Schedule | `55 21 * * *` (timezone: Europe/Madrid)                                                       |

El token de GitHub necesita permiso **Actions: write** sobre este repositorio.

## Ejecución manual

Desde GitHub Actions → *Daily Reservation* → *Run workflow*, o desde la terminal:

```bash
# Reserva real
npm start

# Dry-run: hace login y consulta flys pero no reserva
npm run start:dry
```

## Workflows

### `reserve.yml` — Daily Reservation

El workflow principal. Solo acepta `workflow_dispatch` (el trigger lo gestiona cron-job.org). Instala dependencias y ejecuta `index.ts`.

### `test-dry-run.yml` — Test Dry Run

Workflow auxiliar usado para medir el retraso real del scheduler de GitHub Actions en distintas franjas horarias. No hace reservas.
