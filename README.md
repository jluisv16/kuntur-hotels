# Kuntur

PMS multi-tenant para hoteles de 1 a 5 estrellas en LATAM.

## Estructura

| Carpeta | Contenido |
|---|---|
| backend | API en Go 1.22+, Gin y GORM |
| frontend | Vue 3, Vite, TypeScript, Pinia, Tailwind y Chart.js |
| db | Script de PostgreSQL 15+ (pendiente) |
| docs | PDF de la demo y pantallas de ejemplo |

## Arranque local

```bash
docker compose up -d db
cd backend && go mod tidy && go run ./cmd/api
cd frontend && pnpm install && pnpm dev
```

La API responde en `http://localhost:8080/health`.
