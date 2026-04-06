# Guía: Crear VM en Oracle Cloud Free Tier y desplegar el daemon

## 1. Crear cuenta en Oracle Cloud

1. Ve a https://www.oracle.com/cloud/free/
2. Haz clic en **"Start for free"**
3. Rellena el formulario:
   - Nombre, email, país (selecciona **Spain**)
   - Elige **Home Region: Germany Central (Frankfurt)** o **UK South (London)** — el más cercano a España
   - ⚠️ La Home Region **no se puede cambiar después**
4. Verifica tu email
5. Introduce tarjeta de crédito (solo para verificar identidad, **no te cobran nada**)
6. Completa el registro — puede tardar unos minutos en activarse

---

## 2. Crear la VM (Compute Instance)

1. En el menú principal ve a **Compute → Instances**
2. Haz clic en **"Create instance"**
3. Configura:

### Nombre
- Ponle un nombre, por ejemplo: `reservations`

### Image & Shape
- Haz clic en **"Change image"**
  - Selecciona **Canonical Ubuntu**
  - Versión: **22.04** (LTS)
  - Haz clic en **"Select image"**
- Haz clic en **"Change shape"**
  - Selecciona **Ampere** (ARM, es el más generoso en Free Tier)
  - Shape: **VM.Standard.A1.Flex**
  - OCPUs: **1**
  - Memory: **6 GB**
  - Haz clic en **"Select shape"**

### Networking
- Deja los valores por defecto (crea una VCN nueva automáticamente)
- Asegúrate de que **"Assign a public IPv4 address"** está activado

### SSH Keys
- Selecciona **"Generate a key pair for me"**
- Haz clic en **"Save private key"** — guarda el fichero `.key` en un lugar seguro (lo necesitarás para conectarte)

4. Haz clic en **"Create"**
5. Espera ~2 minutos hasta que el estado sea **"Running"**
6. Copia la **"Public IP address"** que aparece en los detalles de la instancia

---

## 3. Conectarte a la VM por SSH

Desde tu terminal en Mac:

```bash
# Dale los permisos correctos a la clave privada
chmod 400 ~/Downloads/ssh-key-*.key

# Conéctate (sustituye <IP> por la IP pública de tu VM)
ssh -i ~/Downloads/ssh-key-*.key ubuntu@<IP>
```

Si te pregunta "Are you sure you want to continue connecting?" escribe `yes`.

---

## 4. Ejecutar el script de setup

Una vez dentro de la VM, ejecuta:

```bash
curl -s https://raw.githubusercontent.com/jfbarea/reservations/oracle-deploy/setup-oracle.sh | bash
```

El script:
- Actualiza el sistema
- Instala Node.js 20
- Instala Chromium y sus dependencias
- Instala PM2 (gestor de procesos)
- Clona el repositorio
- Te indica los pasos finales

---

## 5. Rellenar las credenciales

```bash
nano ~/reservations/.env
```

Rellena los valores:
```
BERNARDO_USER=bbarearosado@gmail.com
BERNARDO_PASS=tu_password
CECILIO_USER=ceciliothyra@gmail.com
CECILIO_PASS=tu_password
PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser
```

Guarda con `Ctrl+O`, `Enter`, `Ctrl+X`.

---

## 6. Arrancar el daemon

```bash
cd ~/reservations

# Arrancar el proceso
pm2 start ecosystem.config.cjs

# Guardar para que arranque automáticamente si la VM se reinicia
pm2 save

# Ejecuta el comando que te dijo el setup para activar el arranque automático, algo así:
sudo systemctl enable pm2-ubuntu
```

---

## 7. Verificar que funciona

```bash
# Ver estado del proceso
pm2 status

# Ver logs en tiempo real
pm2 logs toyo-reservations
```

Deberías ver:
```
Daemon iniciado. Esperando cron de las 21:50 y 22:00 Europe/Madrid...
```

---

## 8. Comandos útiles del día a día

```bash
# Ver logs
pm2 logs toyo-reservations

# Reiniciar el daemon (tras un cambio de código)
cd ~/reservations && git pull && pm2 restart toyo-reservations

# Parar el daemon
pm2 stop toyo-reservations

# Ver si el proceso está vivo
pm2 status
```

---

## 9. Actualizar el código desde tu Mac

Cuando hagas cambios en el repo, en la VM ejecuta:

```bash
cd ~/reservations && git pull && pm2 restart toyo-reservations
```

---

## Notas importantes

- La VM **siempre está encendida** — no hay que hacer nada para mantenerla activa
- Oracle puede recuperar instancias ARM **inactivas** si hay mucha demanda (muy raro). PM2 la relanza automáticamente si el proceso cae
- Si Oracle te manda un email diciendo que van a reclamar la instancia, simplemente entra a la consola y confírmala como activa
- El `.env` **no está en el repo** (está en `.gitignore`), así que las credenciales solo están en la VM
