# 📈 Arbitrage Radar 360 - Premium Dashboard

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi)
![Redis](https://img.shields.io/badge/redis-%23DD0031.svg?style=for-the-badge&logo=redis&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)

Um terminal institucional para monitoramento de arbitragem de criptomoedas em tempo real. Esta aplicação analisa o fluxo de preços entre a Binance e a Kraken, calculando spreads, ROI estimado e oportunidades de execução direta com baixa latência.

> **Demonstração Visual**
> 
> ![Dashboard Preview](preview.gif.gif)

## 🚀 Arquitetura e Fluxo de Dados

A complexidade deste projeto reside na manipulação híbrida de dados, garantindo velocidade para o painel em tempo real e persistência para a análise de tendências históricas.

1. **Ingestão (Backend):** O `FastAPI` consome dados das exchanges (Binance/Kraken).
2. **Tempo Real (Em-memória):** As oportunidades com os melhores spreads são calculadas e enviadas para o `Redis`, garantindo leitura instantânea (sub-milissegundo) para o cliente.
3. **Persistência (Storage):** As amostras de mercado são gravadas no `PostgreSQL` para alimentar o histórico de 24h (Gráficos de Área) e logs de banco de dados.
4. **Interface (Frontend):** O `React` consome essas duas fontes simultaneamente, atualizando o *Glassmorphism UI*, os *Sparklines* e os gráficos interativos (`Recharts`) sem gargalos de renderização.

## ⚙️ Principais Funcionalidades

- **Cálculo de Spread Dinâmico:** Identificação da diferença de preços (Ask/Bid) com cálculo de percentual de lucro líquido.
- **Sparklines Integrados:** Mini-gráficos de tendência diretamente no ranking de oportunidades.
- **Gráficos Reativos:** Donut Chart e Area Chart atualizados via Polling, sincronizados com a variação do mercado.
- **Interface Nível Institucional:** Design focado em densidade de dados e clareza visual para operadores de mercado.

## 🐳 Como rodar localmente (Docker)

O projeto está totalmente conteinerizado. Certifique-se de ter o Docker e o Docker Compose instalados.

1. Clone o repositório:
```bash
git clone [https://github.com/Luciano091/arbitrage-radar-360.git](https://github.com/Luciano091/arbitrage-radar-360.git)
cd arbitrage-radar-360
