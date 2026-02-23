# Використовуємо офіційний образ Node.js як базовий
FROM node:20-bullseye-slim

# Встановлюємо залежності ОС (yt-dlp-exec вимагає наявність команди python)
RUN apt-get update && apt-get install -y \
    python3 \
    python-is-python3 \
    python3-pip \
    ffmpeg \
    && rm -rf /var/lib/apt/lists/*

# Робоча директорія контейнера
WORKDIR /app

# Копіюємо файли пакетів
COPY package*.json ./

# Встановлюємо залежності проекту
RUN npm ci

# Копіюємо весь вихідний код проекту
COPY . .

# Встановлюємо змінну середовища для продакшн режиму
ENV NODE_ENV=production
# Для Koyeb: додаємо фіктивний BOT_TOKEN, реальний ви задасте в налаштуваннях Environment Variables в панелі Koyeb.
ENV BOT_TOKEN="" 

# Запускаємо бота
CMD ["npm", "run", "start"]