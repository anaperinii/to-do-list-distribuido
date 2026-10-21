import os
import httpx
from dotenv import load_dotenv

load_dotenv()

TASKS_SERVICE_URL = os.getenv("TASKS_SERVICE_URL", "http://localhost:3000")


async def buscar_tarefas_do_usuario(token: str):
    async with httpx.AsyncClient(timeout=5.0) as client:
        response = await client.get(
            f"{TASKS_SERVICE_URL}/api/tasks",
            headers={"Authorization": f"Bearer {token}"},
        )
        response.raise_for_status()
        return response.json()["data"]
