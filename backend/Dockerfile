# --- Backend Dockerfile (Node.js + Express) ---
FROM node:20-alpine

WORKDIR /app

# Install dependencies first (better layer caching — only re-installs
# when package.json actually changes, not on every code change)
COPY package*.json ./
RUN npm install --omit=dev

# Copy the rest of the backend source code
COPY . .

EXPOSE 5000

CMD ["npm", "start"]
