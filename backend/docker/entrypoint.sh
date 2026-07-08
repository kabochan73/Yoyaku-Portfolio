#!/bin/sh
set -e

if [ "$RUN_MIGRATIONS" = "true" ]; then
  php artisan migrate --force
fi

if [ "$RUN_SEED" = "true" ]; then
  php artisan db:seed --class=InitialDataSeeder --force
fi

if [ -n "$RUN_ONCE_CMD" ]; then
  php artisan tinker --execute="$RUN_ONCE_CMD"
fi

exec "$@"
