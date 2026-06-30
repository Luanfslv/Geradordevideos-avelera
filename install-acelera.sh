#!/usr/bin/env bash
#
# Gerador Acelera — instalador para VPS (Ubuntu).
# Instala Docker, clona o projeto, pergunta suas chaves/domínio, gera os
# arquivos de config e sobe tudo com HTTPS automático.
#
# Uso na VPS (como root):
#   curl -fsSL https://raw.githubusercontent.com/Luanfslv/Geradordevideos-avelera/main/install-acelera.sh -o install-acelera.sh && bash install-acelera.sh
#
set -euo pipefail

REPO="https://github.com/Luanfslv/Geradordevideos-avelera.git"
DIR="${INSTALL_DIR:-/opt/gerador-acelera}"

# sudo só se não for root
if [ "$(id -u)" -ne 0 ]; then SUDO="sudo"; else SUDO=""; fi

say() { printf "\n\033[1;36m==> %s\033[0m\n" "$1"; }
ask() { local p="$1" d="${2:-}" v; if [ -n "$d" ]; then read -rp "$p [$d]: " v; echo "${v:-$d}"; else read -rp "$p: " v; echo "$v"; fi; }

say "Gerador Acelera — instalador VPS"

# 1) Dependências base
if ! command -v git >/dev/null 2>&1; then
  say "Instalando git..."
  $SUDO apt-get update -y && $SUDO apt-get install -y git
fi

# 2) Docker + Compose
if ! command -v docker >/dev/null 2>&1; then
  say "Instalando Docker..."
  curl -fsSL https://get.docker.com | $SUDO sh
  $SUDO systemctl enable --now docker
else
  say "Docker já instalado, pulando."
fi

# 3) Clonar (ou atualizar) o projeto
if [ -d "$DIR/.git" ]; then
  say "Projeto já existe em $DIR, atualizando..."
  $SUDO git -C "$DIR" pull --ff-only || true
else
  say "Clonando o projeto em $DIR..."
  $SUDO git clone "$REPO" "$DIR"
fi
cd "$DIR"

# 4) Coletar dados
say "Configuração (deixe em branco para usar o padrão entre colchetes)"
DOMAIN="$(ask 'Domínio (ex.: gerador.aceleravaquinha.com.br)')"
PEXELS="$(ask 'Pexels API key (vídeos)')"
GEMINI="$(ask 'Gemini API key (roteiro)')"
echo "--- Login dos colaboradores (Supabase Auth). Enter em branco = roda SEM login ---"
SBURL="$(ask 'Supabase URL (ex.: https://xxx.supabase.co)' '')"
SBKEY="$(ask 'Supabase anon key' '')"
EMAIL="$(ask 'Seu email (avisos do certificado HTTPS)' 'luan@aceleravaquinha.com')"

# 5) Gerar config.toml a partir do exemplo (já vem em PT-BR)
say "Gerando config.toml..."
$SUDO cp -f config.example.toml config.toml
# delimitador | para não conflitar com / das URLs
$SUDO sed -i "s|^pexels_api_keys = \[\]|pexels_api_keys = [\"${PEXELS}\"]|" config.toml
$SUDO sed -i "s|^gemini_api_key = \"\"|gemini_api_key = \"${GEMINI}\"|" config.toml
if [ -n "$SBURL" ] && [ -n "$SBKEY" ]; then
  $SUDO sed -i "s|^enabled = false|enabled = true|"        config.toml
  $SUDO sed -i "s|^url = \"\"|url = \"${SBURL}\"|"          config.toml
  $SUDO sed -i "s|^anon_key = \"\"|anon_key = \"${SBKEY}\"|" config.toml
  say "Login Supabase ATIVADO."
else
  say "Sem Supabase: o app vai abrir SEM login (qualquer um com o link acessa)."
fi

# 6) Caddyfile com o domínio
say "Gerando Caddyfile para $DOMAIN..."
$SUDO tee Caddyfile >/dev/null <<EOF
{
	email ${EMAIL}
}

${DOMAIN} {
	encode gzip
	reverse_proxy webui:8501
}
EOF

# 7) Checagem de DNS antes de subir (Caddy precisa do DNS apontado p/ emitir HTTPS)
say "IMPORTANTE: aponte o DNS (registro A) de ${DOMAIN} para o IP desta VPS."
echo "   No Cloudflare use 'DNS only' (nuvem cinza) para o HTTPS funcionar."
read -rp "Pressione Enter quando o DNS estiver apontado (ou Ctrl+C p/ sair)... " _

# 8) Subir
say "Subindo os containers (build pode demorar alguns minutos)..."
$SUDO docker compose -f docker-compose.prod.yml up -d --build

say "Pronto!"
echo "   Acesse: https://${DOMAIN}"
if [ -n "$SBURL" ] && [ -n "$SBKEY" ]; then
  echo "   Crie os colaboradores no Supabase: Authentication > Users > Add user (Auto Confirm)."
fi
echo "   Logs:    $SUDO docker compose -f docker-compose.prod.yml logs -f"
echo "   Parar:   $SUDO docker compose -f docker-compose.prod.yml down"
