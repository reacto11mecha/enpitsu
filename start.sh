# Migrate
echo "Memulai proses migrasi..."
sh "/db-migrate/db-migrate-release-command.sh"

# Mulai Enpitsu
echo "Memulai Enpitsu..."
node apps/admin/server.js

