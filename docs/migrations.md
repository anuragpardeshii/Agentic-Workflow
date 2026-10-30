# Database migrations

Migration files live in `backend/migrations/`, ordered by a 14-digit UTC timestamp: `YYYYMMDDHHmmss_description.js`. Each exports `async up(db)` using the MongoDB driver. Schema evolution is forward-only: correct a deployed change with a new migration rather than changing or deleting an applied file.

## Commands

```sh
make dev-up                             # build/start; API runs pending migrations before listening
make migrate                            # apply to Docker MongoDB, even if the API is stopped
make migrate-status                     # applied/pending versions and application timestamps
make migrate-create NAME=add_project_tags
make migrate-local                      # use backend/.env for a native or remote database
make migrate-status-local
```

`make migrate-create` needs Node but no running database. Implement the generated `up` function before running migrations; the scaffold intentionally fails until implemented. Commit each migration with the corresponding application change. API startup applies pending migrations and aborts if a migration fails, so a new app cannot serve against a partially upgraded database. For multiple replicas, run a single `make migrate` deployment job before starting them; the lock fails competing runners rather than letting them migrate concurrently.

Mongoose automatic index creation is disabled at application startup. Index changes belong in migrations. The initial baseline creates unique username/email indexes and project ownership/date indexes. Duplicate legacy usernames or emails cause the baseline to fail; resolve them deliberately, then rerun. Existing documents receive `schemaVersion: 1`; new model documents use the same default. Migration version numbers track database changes; `schemaVersion` tracks document format and should change only when its structure changes.

Legacy ownerless projects remain ownerless and excluded from authenticated queries. No migration guesses ownership, deletes projects, normalizes existing email addresses, or overwrites an existing document version.

## Ledger, integrity, and recovery

`_migrations` records the version, filename, SHA-256 checksum, and completion timestamp. Applied migrations must form an unchanged prefix of local files. Edited/deleted applied files, inserted earlier versions, and duplicate versions are rejected. `make migrate-status` also verifies this history.

The runner acquires a database lock in `_migration_locks` using the unique `_id: "schema"`. It releases the lock on normal completion and caught errors. A second runner fails before making changes. The lock deliberately does not expire while a long migration is running.

MongoDB standalone supports the local setup, so migrations are not wrapped in multi-document transactions. Each `up` must be idempotent: use explicit indexes, conditional updates, and upserts. The ledger is written only after `up` completes. If a process fails between an update and the ledger insert, the next run repeats that migration safely. Back up production data before schema changes.

A killed process or connection failure can leave a lock behind. Stop all migration runners and application startups, inspect the holder and `startedAt`, then remove only the stale schema lock before rerunning:

```sh
docker compose exec mongo mongosh buildfast --eval 'db._migration_locks.find().toArray()'
# Only after confirming the recorded runner is no longer running:
docker compose exec mongo mongosh buildfast --eval 'db._migration_locks.deleteOne({_id:"schema", holder:"REPLACE_WITH_INSPECTED_HOLDER"})'
make migrate
```

Do not clear the migration ledger or use `docker compose down -v` to resolve a migration failure. Neither automatic rollback nor destructive reset is provided.

## Tests

`make check` includes history and filename tests. Set `MIGRATION_TEST_URI` to run MongoDB integration tests; they use a randomly named test database and remove only that database afterward. CI starts MongoDB and runs these tests automatically. Against the development stack:

```sh
docker compose exec -e MIGRATION_TEST_URI=mongodb://mongo:27017 backend node --test tests/migrations.test.js
```
