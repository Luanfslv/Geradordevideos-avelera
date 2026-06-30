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

## Integração com o backend (TODO)
A UI está completa e funcional de forma autônoma (pipeline e dados são simulados).
Pontos para ligar no backend real do MoneyPrinterTurbo (FastAPI em `app/controllers/v1/`):

- `src/lib/pipeline.ts` — trocar o timer simulado pelo progresso real do job (polling/websocket de `/api/v1/...`).
- `src/data/seed.ts` — substituir TEAM e VIDEOS por dados reais (roster do Supabase + lista de vídeos da API).
- **Gerar** — `POST` do tema/roteiro/opções para criar a task de vídeo.
- **Meus vídeos** — `GET` da lista + ações Baixar/Postar (download efêmero + Upload-Post p/ TikTok).
- **Login** — já usa `signInWithPassword`; criar os usuários no Supabase Auth.

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
