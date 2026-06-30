#!/usr/bin/env bash
#
# Troca a VPS da WebUI Streamlit para a UI nova (Acelera Studio = React + API).
# Rodar na VPS, dentro de /opt/gerador-acelera:
#   bash update-studio.sh
#
set -euo pipefail
cd "$(dirname "$0")"

echo "==> Atualizando código (git pull)..."
git pull --ff-only || echo "   (git pull falhou — repo privado? deixe público p/ atualizar ou configure deploy key)"

echo "==> Gerando .env do front a partir do config.toml..."
URL=$(awk -F'"' '/^\[supabase\]/{f=1} f&&/^url *=/{print $2; exit}' config.toml)
KEY=$(awk -F'"' '/^\[supabase\]/{f=1} f&&/^anon_key *=/{print $2; exit}' config.toml)
cat > .env <<EOF
VITE_SUPABASE_URL=$URL
VITE_SUPABASE_ANON_KEY=$KEY
EOF
echo "   VITE_SUPABASE_URL=$URL"
[ -z "$URL" ] && echo "   ⚠️  Supabase URL vazio no config.toml — o login do front não vai funcionar."

# A instalação usa Gemini (chave perguntada no install). Garante o provedor de IA.
if grep -q '^llm_provider = "openai"' config.toml 2>/dev/null; then
  sed -i 's/^llm_provider = "openai"/llm_provider = "gemini"/' config.toml
  echo "==> Ajustado llm_provider para gemini no config.toml."
fi

# Acelera: define o admin do acervo de vídeos (se ainda não definido).
if ! grep -q '^admin_email' config.toml 2>/dev/null; then
  sed -i '/^\[supabase\]/a admin_email = "luanfellipe123@gmail.com"' config.toml
  echo "==> admin_email do acervo = luanfellipe123@gmail.com (edite no config.toml se precisar)."
fi

echo "==> Parando a versão Streamlit..."
docker compose -f docker-compose.prod.yml down || true

echo "==> Subindo API + front Acelera Studio (build pode demorar)..."
docker compose -f docker-compose.studio.yml up -d --build

echo ""
echo "==> Pronto! Abra https://acelera-studio.com — agora com a UI nova."
echo "   Logs:  docker compose -f docker-compose.studio.yml logs -f"
echo "   Voltar p/ Streamlit:  docker compose -f docker-compose.studio.yml down && docker compose -f docker-compose.prod.yml up -d"
