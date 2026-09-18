# --- Сборка SPA (Vite) ---
FROM node:20-alpine AS build

WORKDIR /app

# Timeweb may inject NODE_ENV=production for the whole build. The build stage
# needs Vite, Tailwind and the React plugin from devDependencies.
ENV NODE_ENV=development \
    NPM_CONFIG_PRODUCTION=false \
    NPM_CONFIG_OMIT=""

ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_PUBLISHABLE_KEY
ARG VITE_SUPABASE_PROJECT_ID

ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL \
    VITE_SUPABASE_PUBLISHABLE_KEY=$VITE_SUPABASE_PUBLISHABLE_KEY \
    VITE_SUPABASE_PROJECT_ID=$VITE_SUPABASE_PROJECT_ID \
    NODE_OPTIONS=--max-old-space-size=4096

COPY package*.json ./
RUN npm ci --include=dev --no-audit --no-fund \
 && test -x node_modules/.bin/vite \
 && node_modules/.bin/vite --version

COPY . .
RUN npm run build

# --- Отдача статики + reverse-proxy на Supabase ---
FROM nginx:alpine

COPY nginx.conf /etc/nginx/nginx.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]
