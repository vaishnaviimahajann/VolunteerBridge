# --- Frontend Dockerfile (React + Vite, multi-stage build) ---

# Stage 1: Build the static files
FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# Stage 2: Serve the built files with Nginx (small, fast, production-ready)
FROM nginx:alpine

# Custom Nginx config so client-side routing (React Router) works —
# any unknown path falls back to index.html instead of 404ing
COPY nginx.conf /etc/nginx/conf.d/default.conf

COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
