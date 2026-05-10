import ccxt.async_support as ccxt
import asyncio
import redis.asyncio as redis

# A mesma lista exata de moedas do Binance Worker
SYMBOLS = ['BTC/USDT', 'ETH/USDT', 'SOL/USDT', 'ADA/USDT', 'XRP/USDT']

REDIS_URL = "redis://:devpassword@redis:6379"

async def main():
    r = await redis.from_url(REDIS_URL, decode_responses=True)
    
    exchange = ccxt.kraken({
        'enableRateLimit': True,
    })

    print(f"🦑 [KRAKEN] Radar Multi-Ativos iniciado!")

    try:
        while True:
            try:
                # Busca os preços em lote na Kraken
                tickers = await exchange.fetch_tickers(SYMBOLS)
                
                for symbol in SYMBOLS:
                    if symbol in tickers:
                        price = tickers[symbol]['last']
                        if price: # Garante que o preço não veio vazio
                            await r.set(f"price:kraken:{symbol}", price)
                
                print(f"✅ [KRAKEN] {len(SYMBOLS)} preços atualizados.")
                
            except Exception as e:
                print(f"⚠️ [KRAKEN] Erro na captura: {e}")
            
            await asyncio.sleep(1)

    finally:
        await exchange.close()
        await r.aclose()

if __name__ == "__main__":
    asyncio.run(main())