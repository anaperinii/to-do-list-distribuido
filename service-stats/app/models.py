from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime
from .database import Base


class EstatisticaSnapshot(Base):
    __tablename__ = "estatisticas_snapshot"

    id = Column(Integer, primary_key=True, index=True)
    usuario_id = Column(String, nullable=False, index=True)
    total = Column(Integer, nullable=False)
    concluidas = Column(Integer, nullable=False)
    pendentes = Column(Integer, nullable=False)
    criado_em = Column(DateTime, default=datetime.utcnow)
