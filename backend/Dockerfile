# 1. Usa uma imagem leve do Python
FROM python:3.11-slim

# 2. Define a pasta de trabalho
WORKDIR /app

# 3. Copia a lista de dependências para dentro do container
COPY requirements.txt .

# 4. Instala TODAS as bibliotecas listadas no requirements.txt
# Incluindo o asyncpg que acabamos de adicionar
RUN pip install --no-cache-dir -r requirements.txt

# 5. Copia o resto do código
COPY . .

# Comando padrão (será sobrescrito pelo docker-compose para cada worker)
CMD ["python", "main.py"]