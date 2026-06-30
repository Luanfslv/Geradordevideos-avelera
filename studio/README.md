# Acelera Studio — Front-end (redesign)

Front-end do gerador de vídeos, implementado a partir do handoff **Acelera Studio**
(Vite + React + TypeScript). Dark mode, gradiente rosa→roxo, 100% PT-BR.

## Telas implementadas
- **Login** (split hero) — wired ao **Supabase Auth** (com fallback "modo demo").
- **Navbar** — abas Gerar / Meus vídeos / Configurações, chip do usuário, "Sair".
- **Gerar** — barra de tema, roteiro & palavras-chave, vídeo & áudio (segmented controls), preview do celular (9:16 ⇄ 16:9) e pipeline de geração (6 passos).
- **Meus vídeos** — galeria com filtros e cards por status (Concluído/Gerando/Falhou).
- **Configurações** — chaves de API, TTS, equipe & acesso, preferências.

## Rodar localmente
```sh
cd studio
npm install
cp .env.example .env     # opcional: preencha Supabase p/ login real
npm run dev              # http://localhost:5173
```
Sem `.env`, o login roda em **modo demo** (qualquer usuário não-vazio entra) — bom pra ver a UI.

## Variáveis (.env)
| Var | Para quê |
|---|---|
| `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` | Login real dos colaboradores (mesmo projeto do backend) |
| `VITE_API_TARGET` | Backend FastAPI (proxy `/api` em dev — padrão `127.0.0.1:8080`) |

## Build
```sh
npm run build     # type-check estrito + bundle em dist/
npm run preview   # serve o build
```

## Integração com o backend (LIGADO ✅)
O front fala com o **FastAPI** do MoneyPrinterTurbo (`app/controllers/v1/`), via `src/lib/api.ts`:

- **Gerar roteiro** → `POST /api/v1/scripts` (Gemini) + `POST /api/v1/terms` (palavras-chave).
- **Gerar vídeo** → `POST /api/v1/videos` (cria a task) e **polling** em `GET /api/v1/tasks/{id}` com progresso real.
- **Meus vídeos** → `GET /api/v1/tasks` (lista real); botão **Baixar** aponta pro arquivo em `/tasks/...`.
- **Login** → Supabase Auth (`signInWithPassword`); o token vai no header `Authorization` das chamadas.

Em dev, o Vite faz proxy de `/api` → `http://127.0.0.1:8080` (suba o backend com `uv run python main.py`).

## Deploy em produção (substitui a Streamlit)
Arquivos: `Dockerfile` (build React + Caddy), `docker-compose.studio.yml` (API FastAPI + web Caddy), `Caddyfile.studio` (roteia `/api` e `/tasks` → API, resto = React), `update-studio.sh` (troca automática).

Na VPS, dentro de `/opt/gerador-acelera`:
```sh
bash update-studio.sh
```
Isso puxa o código, gera o `.env` do front a partir do `config.toml`, derruba a Streamlit e sobe **API + UI nova** no mesmo domínio.

> ⚠️ Pendente de **hardening**: os endpoints `/api` ainda não validam o JWT do Supabase no servidor (a UI gateia o login, mas a API fica acessível direto). Verificação do JWT no FastAPI é o próximo passo de segurança.

## Estrutura
```
studio/
├─ index.html              # fontes Google (Space Grotesk, Plus Jakarta, JetBrains Mono)
├─ src/
│  ├─ App.tsx              # estado: login ⇄ app, abas
│  ├─ styles/tokens.css    # design tokens do handoff
│  ├─ styles/global.css    # resets + keyframes
│  ├─ lib/supabase.ts      # auth (com fallback demo)
│  ├─ lib/pipeline.ts      # pipeline de geração (simulado)
│  ├─ data/seed.ts         # dados placeholder
│  ├─ components/          # Logo, Avatar, Navbar, Login, PhonePreview, ui kit
│  └─ tabs/                # Gerar, MeusVideos, Configuracoes
```

> Baseado no handoff `design_handoff_acelera_studio`. Login Design 1 (split hero) foi o escolhido; as variantes 2/3 e o switcher foram descartados, conforme o handoff.
