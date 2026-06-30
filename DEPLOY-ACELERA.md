# Deploy — Gerador Acelera (VPS + domínio + login Supabase)

Guia para hospedar o gerador num servidor e liberar o acesso **só pros colaboradores** via domínio, com login.

## Arquitetura (resumo)

```
Colaborador ──https──>  Cloudflare (DNS)  ──>  VPS
                                                 ├── Caddy   (HTTPS automático, porta 80/443)
                                                 └── WebUI   (Streamlit, porta interna 8501)
                                                       │
                                            login ─────┴────> Supabase Auth (email/senha)

Vídeo gerado → baixado no PC do colaborador → apagado do disco da VPS por TTL
(output_retention_minutes). NADA vai pro Supabase Storage = custo de storage ZERO.
```

**Decisões desta versão:** VPS com Docker · login real por usuário (Supabase Auth) · Supabase só pra login · vídeos efêmeros no disco da VPS.

---

## Pré-requisitos

- Um **domínio** (você já usa Cloudflare). Vamos usar um subdomínio, ex.: `gerador.aceleravaquinha.com.br`.
- Uma **VPS** Linux (Ubuntu 22.04+). Render de vídeo é pesado — recomendo **2–4 vCPU / 4–8 GB RAM / 40 GB disco**. Ex.: Hetzner CX22, DigitalOcean, Contabo.
- As **API keys** já configuradas (Pexels + Gemini) — ver `SETUP-ACELERA.md`.

---

## Passo 1 — Supabase Auth (login dos colaboradores)

1. No [dashboard do Supabase](https://supabase.com/dashboard), escolha um projeto pra hospedar o login. Recomendo um **projeto dedicado** (ex.: o "Time Acelera") pra não misturar com o banco de doações de produção.
2. **Project Settings → API**: copie a **Project URL** e a chave **anon / public** (NÃO a `service_role`).
3. **Authentication → Providers → Email**: deixe **Email** ligado e **desligue "Allow new users to sign up"** (só você cria os usuários — o app não tem tela de cadastro).
4. **Authentication → Users → Add user**: crie um usuário pra cada colaborador (email + senha) e marque **Auto Confirm User**.

> A `anon key` é segura pra ficar no servidor. A `service_role` **nunca** entra aqui.

---

## Passo 2 — Provisionar a VPS e instalar Docker

SSH na VPS e:

```sh
# Docker + Compose plugin
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER   # rodar docker sem sudo (reentre no SSH depois)
sudo systemctl enable --now docker

# Liberar HTTP/HTTPS no firewall (se usar ufw)
sudo ufw allow 80,443/tcp 2>/dev/null || true
```

---

## Passo 3 — Clonar o projeto e configurar

```sh
git clone https://github.com/Luanfslv/Geradordevideos-avelera.git gerador-acelera
cd gerador-acelera

# Cria o config a partir do exemplo
cp config.example.toml config.toml
nano config.toml
```

No `config.toml`, preencha:

```toml
[app]
# ... pexels_api_keys, gemini_api_key (ver SETUP-ACELERA.md)
output_retention_minutes = 60     # apaga vídeos do disco após 60 min

[supabase]
enabled  = true
url      = "https://SEU-PROJETO.supabase.co"
anon_key = "eyJ...sua-anon-key..."
```

> Já vem em português por padrão (voz `pt-BR-AntonioNeural`, roteiro `pt-BR`).

---

## Passo 4 — DNS no Cloudflare

1. No painel do Cloudflare, no domínio, crie um registro **A**:
   - **Name:** `gerador`
   - **IPv4:** o IP público da VPS
   - **Proxy status:** **DNS only** (nuvem **cinza**) — assim o Caddy emite o certificado HTTPS direto pela Let's Encrypt.
2. Aguarde propagar (geralmente segundos a minutos).

---

## Passo 5 — Apontar o Caddy pro seu domínio

Edite o `Caddyfile` e troque o subdomínio:

```caddy
{
	email luan@aceleravaquinha.com
}

gerador.aceleravaquinha.com.br {
	encode gzip
	reverse_proxy webui:8501
}
```

---

## Passo 6 — Subir

```sh
docker compose -f docker-compose.prod.yml up -d --build
docker compose -f docker-compose.prod.yml logs -f   # acompanhar
```

Acesse **https://gerador.aceleravaquinha.com.br** — vai pedir **login** (email/senha que você criou no Supabase). Pronto: cada colaborador entra com a conta dele.

---

## Operação & manutenção

**Vídeos efêmeros:** o colaborador gera, baixa no PC, e o arquivo é apagado do disco após `output_retention_minutes`. Ao atualizar a página, o vídeo some da tela (sessão reinicia). Custo de storage = zero.

**Adicionar/remover colaborador:** Supabase → Authentication → Users (add/delete). Sem mexer no servidor.

**Atualizar o projeto:**
```sh
cd gerador-acelera
git pull
docker compose -f docker-compose.prod.yml up -d --build
```

**Ver logs / reiniciar:**
```sh
docker compose -f docker-compose.prod.yml logs -f webui
docker compose -f docker-compose.prod.yml restart
```

---

## Custos estimados (mensal)

| Item | Custo |
|---|---|
| VPS (2–4 vCPU / 4–8 GB) | ~US$ 6–15 |
| Domínio | você já tem |
| Cloudflare (DNS) | grátis |
| Supabase (só Auth) | grátis (free tier) |
| Storage de vídeo | **R$ 0** (efêmero) |
| Pexels + Gemini | grátis (free tier) |

---

## Segurança (resumo)

- Login por usuário via Supabase Auth; cadastro público **desligado**.
- Só a **anon key** no servidor; `service_role` nunca.
- HTTPS automático (Caddy/Let's Encrypt).
- Sem dados sensíveis persistidos (vídeos são efêmeros).
- Opcional (camada extra): ligar o proxy do Cloudflare (nuvem laranja) depois que o HTTPS estiver funcionando, ou usar Cloudflare Access na frente.

---

## Arquivos deste deploy

- `docker-compose.prod.yml` — WebUI + Caddy
- `Caddyfile` — domínio + HTTPS
- `webui/auth.py` — login (Supabase) + limpeza efêmera
- `config.toml` — suas chaves + `[supabase]` (não versionado)
