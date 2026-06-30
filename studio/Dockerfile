# Acelera Studio — build do front (React/Vite) servido pelo Caddy.
FROM node:22-alpine AS build
WORKDIR /app
COPY package.json ./
RUN npm install --no-audit --no-fund
COPY . .
# Variáveis do Vite são embutidas no build (anon key é pública/segura).
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_ANON_KEY
ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL
ENV VITE_SUPABASE_ANON_KEY=$VITE_SUPABASE_ANON_KEY
RUN npm run build

FROM caddy:2-alpine
COPY --from=build /app/dist /srv/studio
