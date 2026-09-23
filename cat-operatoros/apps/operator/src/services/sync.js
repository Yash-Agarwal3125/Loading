/**
 * Offline sync engine. The cab has no connectivity guarantee; treat offline as
 * the normal case.
 *
 *   enqueue(mutation)   -> IndexedDB outbox, returns client_uuid
 *   drain()             -> flush when online, exponential backoff
 *   status()            -> { online, queueDepth, lastSyncAt }
 *
 * RULES
 * - Every mutation gets a client-generated UUID so retries are idempotent.
 * - Conflicts: last-write-wins per field, EXCEPT incidents, which are
 *   append-only and never merge.
 * - The badge tells the truth. Never show a green tick while the outbox is
 *   non-empty. Show "3 items waiting to sync".
 *
 * ACCEPTANCE: a full simulated shift in airplane mode, then reconnect, with
 * nothing lost and nothing duplicated. This test gates any customer pilot.
 */
// TODO
