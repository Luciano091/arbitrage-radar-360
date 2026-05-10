import asyncio
import redis.asyncio as redis
import json
import asyncpg
from datetime import datetime

SYMBOLS = ['BTC/USDT', 'ETH/USDT', 'SOL/USDT', 'ADA/USDT', 'XRP/USDT']
REDIS_URL = "redis://:devpassword@redis:6379"
DATABASE_URL = "postgresql://user:password@db:5432/arbitrage_db"

async def save_to_db(pool, symbol, spread):
    # Salva o spread com o timestamp atual
    async with pool.acquire() as conn:
        await conn.execute('''
            INSERT INTO spreads(symbol, spread, created_at) 
            VALUES($1, $2, $3)
        ''', symbol, spread, datetime.utcnow())

async def init_db():
    # Cria a tabela se ela não existir
    conn = await asyncpg.connect(DATABASE_URL)
    await conn.execute('''
        CREATE TABLE IF NOT EXISTS spreads (
            id SERIAL PRIMARY KEY,
            symbol TEXT,
            spread FLOAT,
            created_at TIMESTAMP
        )
    ''')
    await conn.close()

async def main():
    await init_db()
    pool = await asyncpg.create_pool(DATABASE_URL)
    r = await redis.from_url(REDIS_URL, decode_responses=True)
    
    print("🧠 [CÉREBRO V3] Analisador com Histórico iniciado!")

    counter = 0
    try:
        while True:
            ranking = []
            btc_data = None
            
            for symbol in SYMBOLS:
                p_binance = await r.get(f"price:binance:{symbol}")
                p_kraken = await r.get(f"price:kraken:{symbol}")
                
                if p_binance and p_kraken:
                    p_binance, p_kraken = float(p_binance), float(p_kraken)
                    diff = abs(p_kraken - p_binance)
                    percent = (diff / min(p_binance, p_kraken)) * 100
                    
                    oportunidade = {"symbol": symbol, "binance": p_binance, "kraken": p_kraken, "spread": diff, "percent": round(percent, 4)}
                    ranking.append(oportunidade)
                    if symbol == 'BTC/USDT': btc_data = oportunidade

                    # A cada 10 ciclos (aprox. 10s), salva no banco de dados
                    if counter % 10 == 0:
                        await save_to_db(pool, symbol, diff)

            ranking.sort(key=lambda x: x['percent'], reverse=True)
            if btc_data:
                payload = {**btc_data, "ranking": ranking}
                await r.set("latest_opportunity", json.dumps(payload))
            
            counter += 1
            await asyncio.sleep(1)
    finally:
        await pool.close()
        await r.aclose()

if __name__ == "__main__":
    asyncio.run(main())