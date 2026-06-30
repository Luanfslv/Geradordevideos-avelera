"""
Acervo de vídeos padrão da Acelera (admin).

Materiais compartilhados que qualquer colaborador pode usar como fonte de clipes
— sem precisar do Pexels nem subir arquivo próprio. Só o admin
(config [supabase] admin_email) pode subir/remover; qualquer logado pode listar.
"""

import glob
import os
import re

from fastapi import Depends, File, HTTPException, Request, UploadFile

from app.controllers.v1.base import new_router
from app.controllers.v1.config import verify_admin, verify_supabase_token
from app.utils import utils

# Todas as rotas exigem login; upload/remoção exigem admin (por rota).
router = new_router(dependencies=[Depends(verify_supabase_token)])

_ALLOWED = ("mp4", "mov", "avi", "flv", "mkv", "webm", "jpg", "jpeg", "png")
_CHUNK = 1024 * 1024  # 1 MB — streaming p/ vídeos grandes (1h+)


def _safe_name(filename: str) -> str:
    base = os.path.basename(filename or "")
    base = re.sub(r"[^A-Za-z0-9._-]+", "_", base).strip("._")
    return base or "arquivo"


@router.get("/library", summary="Listar vídeos do acervo")
def list_library(request: Request):
    lib = utils.storage_dir("library", create=True)
    files = []
    for suf in _ALLOWED:
        files.extend(glob.glob(os.path.join(lib, f"*.{suf}")))
    files.sort(key=lambda p: os.path.basename(p).lower())
    items = [
        {"name": os.path.basename(f), "size": os.path.getsize(f), "file": os.path.basename(f)}
        for f in files
    ]
    return utils.get_response(200, {"files": items})


@router.post(
    "/library",
    summary="Subir vídeo ao acervo (admin)",
    dependencies=[Depends(verify_admin)],
)
def upload_library(request: Request, file: UploadFile = File(...)):
    name = _safe_name(file.filename)
    if not name.lower().endswith(_ALLOWED):
        raise HTTPException(
            status_code=400, detail=f"Extensões aceitas: {', '.join(_ALLOWED)}"
        )
    lib = utils.storage_dir("library", create=True)
    path = os.path.join(lib, name)
    file.file.seek(0)
    with open(path, "wb") as buf:
        while True:
            chunk = file.file.read(_CHUNK)
            if not chunk:
                break
            buf.write(chunk)
    return utils.get_response(200, {"file": name})


@router.delete(
    "/library/{filename}",
    summary="Remover vídeo do acervo (admin)",
    dependencies=[Depends(verify_admin)],
)
def delete_library(request: Request, filename: str):
    name = _safe_name(filename)
    lib = utils.storage_dir("library", create=True)
    path = os.path.join(lib, name)
    if os.path.isfile(path):
        os.remove(path)
        return utils.get_response(200, {"deleted": name})
    raise HTTPException(status_code=404, detail="arquivo não encontrado")
