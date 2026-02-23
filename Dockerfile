FROM node:20-bookworm-slim

RUN apt-get update && apt-get install -y \
    python3 \
    python-is-python3 \
    python3-pip \
    ffmpeg \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

ENV NODE_ENV=production

ENV BOT_TOKEN="" 

# Запускаємо бота
CMD ["npm", "run", "start"]