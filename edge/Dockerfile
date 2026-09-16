FROM nginx:alpine

COPY nginx.conf /etc/nginx/nginx.conf
COPY maintenance.html /usr/share/nginx/maintenance/maintenance.html

RUN mkdir -p /etc/nginx/flags

EXPOSE 8080

HEALTHCHECK --interval=15s --timeout=3s --start-period=5s \
  CMD wget -qO- http://127.0.0.1:8080/__edge_health >/dev/null || exit 1

CMD ["nginx", "-g", "daemon off;"]
