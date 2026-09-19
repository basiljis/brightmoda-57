# Деплой Shoplet в Timeweb Cloud Apps (обход блокировок Supabase в РФ)

## Что уже готово в проекте

| Файл | Назначение |
|------|------------|
| `Dockerfile` | Сборка Vite → Nginx, `ARG VITE_*` пробрасываются в билд |
| `nginx.conf` | SPA-сервер + reverse-proxy на Supabase для `api.shoplet.pro` |
| `edge/Dockerfile`, `edge/nginx.conf`, `edge/maintenance.html` | Edge-прокси с авто-заглушкой на время деплоя |
| `docker-compose.yml` | Сервисы `edge` (8082→8080) и `app` (только `expose: 8080`) |
| `.dockerignore` | Исключает `node_modules`, `.git`, `dist` |
| `src/integrations/supabase/client.ts` | URL и anon-ключ читаются из `import.meta.env` |

Схема: браузер → `shoplet.pro` / `api.shoplet.pro` (Timeweb) → nginx → `kpimhnlvjndbvwlozeow.supabase.co`.
Исходящие соединения с сервера в РФ к Supabase не блокируются.

## Переменные окружения в Timeweb

```
VITE_SUPABASE_URL=https://api.shoplet.pro
VITE_SUPABASE_PUBLISHABLE_KEY=<anon-ключ Supabase>
VITE_SUPABASE_PROJECT_ID=kpimhnlvjndbvwlozeow
DEPENDENCY_CACHE_VERSION=2026-09-19-1
```

`service_role` ключ во фронтенд не попадает никогда — только в секреты Edge Functions.

## Порядок деплоя

1. Запушить ветку с этими файлами.
2. Timeweb Cloud Apps → создать приложение типа **Docker Compose**, указать репозиторий и ветку.
3. Внешний порт приложения → **8082** (это `edge`). Контейнер `app` наружу не публикуется.
4. Добавить переменные окружения из раздела выше.
5. Healthcheck: `GET /__edge_health` → `ok`.
6. DNS у регистратора:
   - `A  shoplet.pro      → <IP Timeweb>`
   - `A  www.shoplet.pro  → <IP Timeweb>`
   - `A  api.shoplet.pro  → <IP Timeweb>` (без него обхода не будет)
   - для магазинов на поддоменах: `A  *.shoplet.pro → <IP Timeweb>`
7. SSL Let's Encrypt включить на **оба** домена: `shoplet.pro` и `api.shoplet.pro`.
8. Deploy. Первая сборка 6–10 минут.

Если Timeweb повторно использует старый слой установки зависимостей, увеличьте
`DEPENDENCY_CACHE_VERSION` (например, до `2026-09-19-2`) и запустите Deploy ещё
раз. Это принудительно пересоздаст слой `npm ci`; удалять lock-файл не нужно.

## Настройки Supabase Auth

Authentication → URL Configuration:
- Site URL: `https://shoplet.pro`
- Redirect URLs: `https://shoplet.pro/*`, `https://www.shoplet.pro/*`, `http://localhost:8080/*`

JWT issuer менять не нужно.

## Проверка после деплоя

```bash
curl -s  https://shoplet.pro/__edge_health          # ok
curl -sI https://shoplet.pro/ | head -1             # 200
curl -sI https://api.shoplet.pro/auth/v1/health     # 200
curl -s -H "apikey: <anon>" https://api.shoplet.pro/rest/v1/ | head
curl -sI -X OPTIONS https://api.shoplet.pro/auth/v1/token \
  -H "Origin: https://shoplet.pro" -H "Access-Control-Request-Method: POST"   # 204, один CORS-заголовок
```

## Ручная заглушка

```bash
docker exec <edge_container> touch /etc/nginx/flags/maintenance.enabled   # включить
docker exec <edge_container> rm    /etc/nginx/flags/maintenance.enabled   # выключить
```

## Частые проблемы

| Проблема | Решение |
|----------|---------|
| 502 Bad Gateway | `app` должен слушать 8080, edge проксирует на `app:8080` |
| Ошибка вместо заглушки | Внешний порт Timeweb должен указывать на 8082 (edge) |
| CORS-ошибки | В `nginx.conf` для `api.` должны быть `proxy_hide_header Access-Control-*` |
| 526 / 404 от прокси | Проверить `proxy_ssl_server_name on` и `Host` = домен Supabase |
| Сборка падает по памяти | В `Dockerfile` уже задан `NODE_OPTIONS=--max-old-space-size=4096` |
| `npm error Exit handler never called!` | Увеличить `DEPENDENCY_CACHE_VERSION` и пересобрать; установка автоматически очищает npm-кэш и повторяется один раз |
