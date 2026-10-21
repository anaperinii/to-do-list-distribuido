from fastapi import FastAPI, Depends, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import httpx

from .database import Base, engine, get_db
from .models import EstatisticaSnapshot
from .auth import get_current_user
from .tasks_client import buscar_tarefas_do_usuario

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Serviço 3 - Analisador de Tarefas")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(HTTPException)
async def http_exception_handler(_request: Request, exc: HTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "success": False,
            "error": {"code": "ERROR", "message": exc.detail},
        },
    )


@app.get("/health")
def health():
    return {"status": "ok", "service": "stats-api"}


@app.get("/api/stats")
async def obter_estatisticas(usuario=Depends(get_current_user), db=Depends(get_db)):
    try:
        tarefas = await buscar_tarefas_do_usuario(usuario["token"])
    except httpx.HTTPStatusError as exc:
        raise HTTPException(status_code=exc.response.status_code, detail="Falha ao consultar tarefas do usuário")
    except httpx.RequestError:
        raise HTTPException(status_code=502, detail="Serviço de tarefas indisponível")

    total = len(tarefas)
    concluidas = sum(1 for t in tarefas if t.get("concluida"))
    pendentes = total - concluidas

    snapshot = EstatisticaSnapshot(
        usuario_id=usuario["id"],
        total=total,
        concluidas=concluidas,
        pendentes=pendentes,
    )
    db.add(snapshot)
    db.commit()

    return {
        "success": True,
        "message": "Estatísticas calculadas com sucesso.",
        "data": {
            "usuarioId": usuario["id"],
            "total": total,
            "concluidas": concluidas,
            "pendentes": pendentes,
        },
    }
