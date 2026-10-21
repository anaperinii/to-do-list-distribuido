import os
from fastapi import Header, HTTPException
from jose import jwt, JWTError
from dotenv import load_dotenv

load_dotenv()

JWT_SECRET = os.getenv("JWT_SECRET")
ALGORITHM = "HS256"


def get_current_user(authorization: str = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Token não informado")

    token = authorization[7:]

    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[ALGORITHM], issuer="tasks.service")
    except JWTError:
        raise HTTPException(status_code=401, detail="Token inválido ou expirado")

    return {"id": payload["sub"], "nome": payload.get("nome"), "email": payload.get("email"), "token": token}
