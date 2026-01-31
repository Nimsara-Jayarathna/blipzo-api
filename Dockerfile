FROM node:20-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --omit=dev

# Copy source
COPY . .

# Ensure app listens on the container port
ENV PORT=5000

EXPOSE 5000

CMD ["node", "server.js"]
