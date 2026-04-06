#!/bin/bash
# Script de setup para Oracle Cloud Free Tier (Ubuntu 22.04 ARM)
# Ejecutar como: bash setup-oracle.sh

set -e

echo "=== Actualizando sistema ==="
sudo apt-get update && sudo apt-get upgrade -y

echo "=== Instalando Node.js 20 ==="
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

echo "=== Instalando Chromium y dependencias de Puppeteer ==="
sudo apt-get install -y \
  chromium-browser \
  libatk-bridge2.0-0 \
  libdrm2 \
  libxkbcommon0 \
  libxcomposite1 \
  libxdamage1 \
  libxrandr2 \
  libgbm1 \
  libasound2 \
  fonts-liberation \
  libappindicator3-1 \
  xdg-utils

echo "=== Instalando PM2 (gestor de procesos) ==="
sudo npm install -g pm2

echo "=== Clonando repositorio ==="
git clone git@github.com:jfbarea/reservations.git ~/reservations
cd ~/reservations
git checkout oracle-deploy

echo "=== Instalando dependencias ==="
npm install

echo "=== Creando .env ==="
cat > .env << 'EOF'
BERNARDO_USER=
BERNARDO_PASS=
CECILIO_USER=
CECILIO_PASS=
PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser
EOF
echo ">>> IMPORTANTE: rellena el fichero .env con las credenciales <<<"

echo "=== Configurando PM2 para arrancar con el sistema ==="
pm2 startup systemd -u ubuntu --hp /home/ubuntu
echo ">>> Ejecuta el comando 'sudo ...' que aparece arriba <<<"

echo ""
echo "=== Setup completado ==="
echo "Próximos pasos:"
echo "  1. Edita ~/reservations/.env con las credenciales reales"
echo "  2. cd ~/reservations && pm2 start ecosystem.config.cjs"
echo "  3. pm2 save  (para que arranque al reiniciar)"
echo "  4. pm2 logs toyo-reservations  (para ver logs en tiempo real)"
