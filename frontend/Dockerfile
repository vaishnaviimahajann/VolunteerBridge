# --- Frontend Dockerfile (React + Vite, multi-stage build) ---

# Stage 1: Build the static files
FROM node:20-alpine AS build

WORKDIR /app

# Accept the backend URL as a build argument (Render passes environment
# variables set in its dashboard as build args automatically), then
# expose it as an env var so Vite bakes it into the build output.
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# Stage 2: Serve the built files with Nginx (small, fast, production-ready)
FROM nginx:alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf

COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
