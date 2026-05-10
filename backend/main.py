from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import asyncpg
import redis.asyncio as redis
import json

app = FastAPI()
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

DATABASE_URL = "postgresql://user:password@db:5432/arbitrage_db"

@app.get("/api/opportunity")
async def get_opportunity():
    r = await redis.from_url("redis://:devpassword@redis:6379", decode_responses=True)
    data = await r.get("latest_opportunity")
    await r.aclose()
    return json.loads(data) if data else {}

@app.get("/api/history/{symbol}")
async def get_history(symbol: str):
    # Busca os últimos 50 pontos para o gráfico
    conn = await asyncpg.connect(DATABASE_URL)
    rows = await conn.fetch('''
        SELECT spread, created_at FROM spreads 
        WHERE symbol = $1 
        ORDER BY created_at DESC LIMIT 50
    ''', symbol.replace("-", "/")) # Ajuste de formato se necessário
    await conn.close()
    
    # Formata para o Recharts (Inverte a ordem para o gráfico fluir da esquerda pra direita)
    return [{"time": r['created_at'].strftime('%H:%M:%S'), "spread": r['spread']} for r in reversed(rows)]