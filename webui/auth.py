"""
Acelera — login opcional (Supabase Auth) + limpeza de vídeos efêmeros.

Objetivo:
- Restringir o acesso da WebUI aos colaboradores (login por email/senha no
  Supabase Auth).
- NÃO acumular vídeo no servidor nem usar Supabase Storage: o colaborador gera,
  baixa no PC e o arquivo é apagado do disco depois de um tempo curto (custo de
  armazenamento = zero).

Config no config.toml:

    [supabase]
    enabled = true
    url = "https://SEU-PROJETO.supabase.co"
    anon_key = "eyJ..."          # chave ANON (pública/segura), NUNCA a service_role

    [app]
    output_retention_minutes = 60  # apaga vídeos do disco após X min (0 = nunca)

Se [supabase].enabled != true ou faltar url/anon_key, o login fica DESLIGADO e o
app abre direto — assim o uso local continua funcionando sem Supabase.
"""

from __future__ import annotations

import os
import shutil
import time

import streamlit as st
from loguru import logger

from app.config import config

_ROOT_DIR = os.path.dirname(os.path.dirname(os.path.realpath(__file__)))
_TASKS_DIR = os.path.join(_ROOT_DIR, "storage", "tasks")


# --------------------------------------------------------------------------- #
# Configuração
# --------------------------------------------------------------------------- #
def _supabase_conf() -> dict:
    return getattr(config, "supabase", {}) or {}


def auth_enabled() -> bool:
    c = _supabase_conf()
    return bool(c.get("enabled")) and bool(c.get("url")) and bool(c.get("anon_key"))


# --------------------------------------------------------------------------- #
# Limpeza de saídas efêmeras (sem custo de storage)
# --------------------------------------------------------------------------- #
def cleanup_ephemeral_outputs() -> None:
    """Apaga pastas de tarefas antigas para o disco não acumular vídeos."""
    try:
        retention = int(config.app.get("output_retention_minutes", 60) or 0)
    except (TypeError, ValueError):
        retention = 60
    if retention <= 0 or not os.path.isdir(_TASKS_DIR):
        return
    cutoff = time.time() - retention * 60
    for name in os.listdir(_TASKS_DIR):
        path = os.path.join(_TASKS_DIR, name)
        try:
            if os.path.isdir(path) and os.path.getmtime(path) < cutoff:
                shutil.rmtree(path)
                logger.info(f"[cleanup] vídeo efêmero removido: {name}")
        except OSError as e:
            logger.warning(f"[cleanup] falha ao remover {name}: {e}")


# --------------------------------------------------------------------------- #
# Login (Supabase Auth)
# --------------------------------------------------------------------------- #
@st.cache_resource(show_spinner=False)
def _get_client(url: str, anon_key: str):
    # Import tardio: só exige a lib 'supabase' quando o login está ligado.
    from supabase import create_client

    return create_client(url, anon_key)


def _login_form() -> None:
    st.markdown("## 🔒 Gerador Acelera")
    st.caption("Acesso restrito aos colaboradores da Acelera. Faça login para continuar.")
    with st.form("acelera_login", clear_on_submit=False):
        email = st.text_input("Email")
        password = st.text_input("Senha", type="password")
        submitted = st.form_submit_button("Entrar", use_container_width=True)

    if submitted:
        conf = _supabase_conf()
        try:
            client = _get_client(conf["url"], conf["anon_key"])
            res = client.auth.sign_in_with_password(
                {"email": (email or "").strip(), "password": password or ""}
            )
            if res and getattr(res, "session", None):
                st.session_state["_auth_user"] = {
                    "email": getattr(res.user, "email", email),
                    "id": getattr(res.user, "id", None),
                }
                st.rerun()
            else:
                st.error("Email ou senha incorretos.")
        except Exception as e:  # noqa: BLE001 — mensagem genérica por segurança
            logger.warning(f"login Supabase falhou: {e}")
            st.error("Email ou senha incorretos.")
    # Interrompe o resto da página enquanto não estiver autenticado.
    st.stop()


def require_login() -> None:
    """
    Bloqueia a WebUI até o colaborador logar (quando [supabase].enabled).
    Chamar logo após st.set_page_config(), antes de renderizar o app.
    """
    if not auth_enabled():
        return  # login desligado → app aberto (uso local / dev)

    if st.session_state.get("_auth_user"):
        # Já logado: mostra usuário e botão de sair na sidebar.
        with st.sidebar:
            user = st.session_state["_auth_user"]
            st.caption(f"👤 {user.get('email', '')}")
            if st.button("Sair", key="acelera_logout"):
                st.session_state.pop("_auth_user", None)
                st.rerun()
        return

    _login_form()
