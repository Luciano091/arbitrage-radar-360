import ccxt.async_support as ccxt
import asyncio
import redis.asyncio as redis

# Configurações de Ativos (Você pode adicionar quantos quiser aqui)
SYMBOLS = ['BTC/USDT', 'ETH/USDT', 'SOL/USDT', 'ADA/USDT', 'XRP/USDT']


# Configurações do Redis
REDIS_URL = "redis://:devpassword@redis:6379"

async def main():
    # Conexão com o nosso banco de dados em tempo real
    r = await redis.from_url(REDIS_URL, decode_responses=True)
    
    # Inicializa o motor da Binance (CCXT)
    exchange = ccxt.binance({
        'enableRateLimit': True,
        'options': {'defaultType': 'spot'}
    })

    print(f"🚀 [BINANCE] Radar Multi-Ativos iniciado!")
    print(f"📡 Monitorando: {', '.join(SYMBOLS)}")

    try:
        while True:
            try:
                # Busca o preço de todos os ativos da lista de uma só vez
                # Isso é muito mais rápido e evita ser banido pela Binance
                tickers = await exchange.fetch_tickers(SYMBOLS)
                
                for symbol in SYMBOLS:
                    if symbol in tickers:
                        price = tickers[symbol]['last']
                        
                        # Salvamos com uma chave única para cada moeda: price:binance:BTC/USDT
                        # Isso permite que o Cérebro saiba exatamente de quem é o preço
                        await r.set(f"price:binance:{symbol}", price)
                
                # Log discreto para sabermos que o motor está roncando
                print(f"✅ [BINANCE] {len(SYMBOLS)} preços atualizados.")
                
            except Exception as e:
                print(f"⚠️ [BINANCE] Erro na captura: {e}")
            
            # Espera 1 segundo para a próxima varredura
            await asyncio.sleep(1)

    finally:
        # Garante que as conexões sejam fechadas se o sistema parar
        await exchange.close()
        await r.aclose()

if __name__ == "__main__":
    asyncio.run(main())