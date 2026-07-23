#!/bin/bash
# Backup do banco PostgreSQL — SGTU
# Uso: ./scripts/backup.sh [output_dir]
# Requer: pg_dump (CLI PostgreSQL)
#
# Exemplo com Neon:
#   pg_dump "$DATABASE_URL" --no-owner --clean --if-exists \
#     --file="./backups/sgtu-$(date +%Y-%m-%d).sql"

set -euo pipefail

OUTPUT_DIR="${1:-./backups}"
mkdir -p "$OUTPUT_DIR"

DATABASE_URL="${DATABASE_URL:-}"
if [ -z "$DATABASE_URL" ]; then
  if [ -f .env ]; then
    export $(grep -v '^#' .env | xargs)
  fi
fi

if [ -z "${DATABASE_URL:-}" ]; then
  echo "ERRO: Defina DATABASE_URL no .env ou na variável de ambiente"
  exit 1
fi

FILENAME="sgtu-$(date +%Y-%m-%d-%H%M%S).sql"
FILEPATH="$OUTPUT_DIR/$FILENAME"

echo "Iniciando backup em $FILEPATH ..."
pg_dump "$DATABASE_URL" --no-owner --clean --if-exists --file="$FILEPATH"
echo "Backup concluído: $(wc -c < "$FILEPATH") bytes"
