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

# デプロイのたびにフロントの静的キャッシュをDBの最新状態へ同期させる
# （seeder等APIを経由しないデータ変更を反映させるための自己修復。失敗しても起動は継続する）
if [ -n "$FRONTEND_URL" ]; then
  curl -fsS "$FRONTEND_URL/api/revalidate?tag=prices" >/dev/null 2>&1 || true
  curl -fsS "$FRONTEND_URL/api/revalidate?tag=regular-holidays" >/dev/null 2>&1 || true
fi

exec "$@"
