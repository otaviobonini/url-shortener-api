#!/bin/sh
set -e

# Aplica as migrations pendentes no banco real, no startup do container.
npx prisma migrate deploy

# Substitui este shell pelo comando do CMD, para que o node vire o PID 1
# e receba o SIGTERM do Docker (sem isso o graceful shutdown nunca dispara).
exec "$@"
