# Gerador Acelera — Setup & Como Rodar

Gerador de vídeos curtos em massa (base **MoneyPrinterTurbo**) para aquecer contas de TikTok da Acelera.
Projeto no Linear: **gerador-acelera** (time Acelera) → https://linear.app/luan-marques/project/gerador-acelera-7c8a9b0b7c4b

---

## ✅ O que já foi feito

- **`config.toml` criado** a partir do `config.example.toml`, com `llm_provider = "gemini"` (LLM gratuita) e `video_source = "pexels"`.
- **`uv.lock` corrigido** — estava desatualizado por causa do rename do projeto para `geradordevideos-acelera`; agora `uv sync` roda limpo.
- **WebUI validada**: subiu e respondeu `HTTP 200` (`/_stcore/health = ok`), com todos os módulos de `app/services` importando corretamente.
- **Interface 100% em Português (BR)**: completei o `webui/i18n/pt.json` (faltavam 24 dos 168 textos, que apareciam em inglês) e defini `language = "pt"` no `config.toml` como idioma padrão. Dá pra trocar no seletor "Language / 语言" no topo da UI.
- **Geração padrão em Português (BR)**: roteiro, narração e legenda já saem em PT por padrão.

## 🇧🇷 Geração em Português (BR) — o que foi configurado

| Item | Valor padrão | Onde |
|---|---|---|
| Idioma do roteiro (IA) | `pt-BR` | `config.toml` → `[ui] script_language` + opção adicionada no `webui/Main.py` |
| Voz (TTS) | `pt-BR-AntonioNeural-Male` (voz brasileira, grátis via edge-tts) | `config.toml` → `[ui] voice_name` |
| Fonte da legenda | `BeVietnamPro-Bold.ttf` (suporta acentos: ã, ç, é, õ) | `config.toml` → `[ui] font_name` |
| Legenda | gerada a partir do roteiro/áudio em PT | automático |

**Por que o vídeo saiu em inglês antes:** o "Script Language" estava em *Auto Detect* e o projeto **nem listava português** — então temas em inglês (ex.: "Minecraft") geravam roteiro em inglês, e a voz lia aquilo. Agora o roteiro é forçado para PT-BR.

**Trocar a voz** (3 opções brasileiras): no seletor "Speech Synthesis" da UI, ou em `config.toml`:
- `pt-BR-AntonioNeural-Male` (masculina) ← atual
- `pt-BR-FranciscaNeural-Female` (feminina)
- `pt-BR-ThalitaMultilingualNeural-Female` (feminina, multilíngue)

> ⚠️ Pra valer, **reinicie a WebUI** (`Ctrl+C` e `sh webui.sh` de novo) e gere um vídeo novo.

> ⚠️ Sobrou uma pasta `.venv` quebrada (~928 MB) que eu não consegui apagar daqui (limitação de permissão). **No seu Mac, apague antes de rodar** (passo 2 abaixo). Ela está no `.gitignore`, então não vai pro Git.

---

## 🚀 Rodar no Mac (passo a passo)

### Pré-requisitos
- **uv** (gerenciador Python). Se não tiver:
  ```sh
  curl -LsSf https://astral.sh/uv/install.sh | sh
  ```
- **ffmpeg** (recomendado, mas o projeto baixa um automático se faltar):
  ```sh
  brew install ffmpeg
  ```

### Comandos
```sh
cd ~/Documents/GitHub/MoneyPrinterTurbo

# 1) Apagar o .venv quebrado que ficou (importante!)
rm -rf .venv

# 2) Instalar dependências (cria um .venv limpo)
uv sync

# 3) Subir a interface
sh webui.sh
```

Vai abrir em **http://127.0.0.1:8501**

> A WebUI **sobe sem API keys** — você já consegue ver a interface funcionando. Para **gerar vídeo de verdade**, configure as chaves abaixo.

### (Opcional) Subir a API FastAPI também
Em outro terminal:
```sh
cd ~/Documents/GitHub/MoneyPrinterTurbo
uv run python main.py      # docs em http://127.0.0.1:8080/docs
```

---

## 🔑 API Keys — só precisa de 2, ambas GRÁTIS

O fluxo mínimo de geração usa 4 peças. Narração e legenda já são grátis por padrão (edge-tts da Microsoft, sem chave). Você só precisa de **duas chaves gratuitas**:

| Função | Serviço | Custo | Onde pegar |
|---|---|---|---|
| Vídeos de fundo | **Pexels** | Grátis | https://www.pexels.com/api/ (cria conta → chave na hora) |
| Roteiro (LLM) | **Google Gemini** | Free tier | https://aistudio.google.com/apikey (login Google → "Create API key") |
| Narração (TTS) | edge-tts | Grátis | já é o padrão, **sem chave** |
| Legendas | edge | Grátis | já é o padrão, **sem chave** |

### Onde colar (no `config.toml`)
```toml
# fonte de vídeos
pexels_api_keys = ["COLE_SUA_CHAVE_PEXELS_AQUI"]

# roteiro (já está llm_provider = "gemini")
gemini_api_key = "COLE_SUA_CHAVE_GEMINI_AQUI"
```

> 💡 Use **aspas retas** `"` (aspas "curvas" coladas de outro lugar quebram o TOML).
> 💡 Dá pra colocar várias chaves Pexels pra driblar limite: `pexels_api_keys = ["k1","k2"]`.

Alternativas gratuitas, se quiser: **Pixabay** (vídeos, https://pixabay.com/api/docs/) e **Groq** (LLM rápido e grátis, https://console.groq.com/keys → trocar `llm_provider = "groq"`).

---

## 🗺️ Roadmap (issues no Linear)

| # | Issue | Prioridade |
|---|---|---|
| ACE-100 | Rodar o gerador localmente (WebUI) | 🔴 Urgent · *In Progress* |
| ACE-101 | Configurar API keys gratuitas (Pexels + Gemini) | 🟠 High · *Todo* |
| ACE-102 | Aplicar branding Acelera na WebUI | 🟡 Medium |
| ACE-103 | Geração em lote (batch) de vídeos | 🟠 High |
| ACE-104 | Automatizar cross-post p/ TikTok (Upload-Post) | 🟠 High |
| ACE-105 | Biblioteca de temas/roteiros p/ aquecimento | 🟡 Medium |
| ACE-109 | Acesso multiusuário / colaboradores | 🟡 Medium |
| ACE-106 | Deploy / hospedagem usável | 🟡 Medium |
| ACE-107 | Fila e concorrência com Redis | 🔵 Low |
| ACE-108 | Spike: reaproveitar a UI do RedditVideoMakerBot | 🔵 Low |

---

## 🧩 Arquitetura (resumo)

- **Python 3.11 + uv** — deps em `pyproject.toml` / `uv.lock`
- **WebUI**: `webui/Main.py` (Streamlit, porta 8501)
- **API**: `main.py` → `app/asgi.py` (FastAPI, porta 8080) · endpoints em `app/controllers/v1/`
- **Serviços**: `app/services/` (roteiro, voz, vídeo, material, legenda, upload_post)
- **Integração TikTok**: `app/services/upload_post.py` (cross-post automático — núcleo do aquecimento)
