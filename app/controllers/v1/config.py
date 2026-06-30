"""
Acelera — endpoint de configuração gerenciada pela UI (Acelera Studio).

CRUD das chaves de API (Pexels/Pixabay/Coverr) e do provedor de IA (LLM),
persistindo no config.toml. Protegido por verificação do token do Supabase:
só quem está logado consegue ler/alterar (a anon key é pública, mas o token
de sessão prova que o colaborador autenticou).
"""

import json
import urllib.error
import urllib.request
from typing import List, Optional

from fastapi import Depends, Header, HTTPException, Request
from pydantic import BaseModel

from app.config import config
from app.controllers.v1.base import new_router
from app.utils import utils


def fetch_supabase_user(authorization: Optional[str]):
    """Valida o token e retorna o usuário do Supabase (dict com email).
    Retorna None se o login não estiver configurado (uso local/dev)."""
    sb = getattr(config, "supabase", {}) or {}
    url, anon, enabled = sb.get("url"), sb.get("anon_key"), sb.get("enabled")
    if not (enabled and url and anon):
        return None  # Supabase desligado → acesso liberado (dev/local)

    if not authorization or not authorization.lower().startswith("bearer "):
        raise HTTPException(status_code=401, detail="login obrigatório")
    token = authorization.split(" ", 1)[1].strip()
    req = urllib.request.Request(
        f"{url.rstrip('/')}/auth/v1/user",
        headers={"Authorization": f"Bearer {token}", "apikey": anon},
    )
    try:
        with urllib.request.urlopen(req, timeout=8) as resp:
            if resp.status != 200:
                raise HTTPException(status_code=401, detail="token inválido")
            return json.loads(resp.read().decode("utf-8"))
    except urllib.error.HTTPError:
        raise HTTPException(status_code=401, detail="token inválido")
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(status_code=503, detail="falha ao validar login")


def verify_supabase_token(authorization: Optional[str] = Header(default=None)):
    """Exige um colaborador logado (qualquer um)."""
    fetch_supabase_user(authorization)
    return True


def verify_admin(authorization: Optional[str] = Header(default=None)):
    """Exige que o usuário logado seja o admin (config [supabase] admin_email)."""
    user = fetch_supabase_user(authorization)
    if user is None:
        return True  # login desligado (dev)
    sb = getattr(config, "supabase", {}) or {}
    admin = (sb.get("admin_email") or "").strip().lower()
    email = (user.get("email") or "").strip().lower()
    if not admin:
        raise HTTPException(status_code=403, detail="admin_email não configurado no config.toml")
    if email != admin:
        raise HTTPException(status_code=403, detail="apenas o admin pode gerenciar o acervo")
    return True


# Todas as rotas deste router exigem token válido.
router = new_router(dependencies=[Depends(verify_supabase_token)])

_LIST_KEYS = ["pexels_api_keys", "pixabay_api_keys", "coverr_api_keys"]
_SCALAR_KEYS = ["llm_provider", "gemini_api_key", "openai_api_key"]


class ConfigUpdate(BaseModel):
    llm_provider: Optional[str] = None
    gemini_api_key: Optional[str] = None
    openai_api_key: Optional[str] = None
    pexels_api_keys: Optional[List[str]] = None
    pixabay_api_keys: Optional[List[str]] = None
    coverr_api_keys: Optional[List[str]] = None


@router.get("/config", summary="Read managed config (keys, provider)")
def read_config(request: Request):
    app = config.app
    data = {k: app.get(k, "") for k in _SCALAR_KEYS}
    for k in _LIST_KEYS:
        data[k] = app.get(k, []) or []
    return utils.get_response(200, data)


@router.post("/config", summary="Update managed config")
def write_config(request: Request, body: ConfigUpdate):
    app = config.app
    payload = body.model_dump(exclude_none=True)
    for k, v in payload.items():
        app[k] = v
    config.save_config()
    return utils.get_response(200, {"saved": True})
