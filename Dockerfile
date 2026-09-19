# --- Сборка SPA (Vite) ---
# Debian/glibc is more stable than Alpine/musl for npm installs on constrained
# builders. Keep both Node and npm pinned so a base-image update cannot change
# package installation behaviour unexpectedly.
FROM node:20.19.5-bookworm-slim AS build

WORKDIR /app

# Timeweb may inject NODE_ENV=production for the whole build. The build stage
# needs Vite, Tailwind and the React plugin from devDependencies. NODE_ENV is
# set only after dependency installation, so npm cannot omit build tools.
ENV NODE_ENV=development \
    NPM_CONFIG_OMIT="" \
    NPM_CONFIG_MAXSOCKETS=5 \
    NPM_CONFIG_FETCH_RETRIES=5 \
    NPM_CONFIG_FETCH_RETRY_MINTIMEOUT=20000 \
    NPM_CONFIG_FETCH_RETRY_MAXTIMEOUT=120000

ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_PUBLISHABLE_KEY
ARG VITE_SUPABASE_PROJECT_ID

ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL \
    VITE_SUPABASE_PUBLISHABLE_KEY=$VITE_SUPABASE_PUBLISHABLE_KEY \
    VITE_SUPABASE_PROJECT_ID=$VITE_SUPABASE_PROJECT_ID \
    NODE_OPTIONS=--max-old-space-size=2048

COPY package*.json ./

# Change this value when Timeweb must discard a stale dependency layer.
ARG DEPENDENCY_CACHE_VERSION=2026-09-19-1
RUN echo "Dependency cache: ${DEPENDENCY_CACHE_VERSION}" \
 && npm install --global npm@11.6.0 --no-audit --no-fund \
 && (npm ci --include=dev --no-audit --no-fund --prefer-offline \
     || (rm -rf node_modules /root/.npm/_cacache \
         && npm cache clean --force \
         && npm ci --include=dev --no-audit --no-fund)) \
 && test -x node_modules/.bin/vite \
 && node_modules/.bin/vite --version

COPY . .
RUN NODE_ENV=production npm run build

# --- Отдача статики + reverse-proxy на Supabase ---
FROM nginx:alpine

COPY nginx.conf /etc/nginx/nginx.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]
