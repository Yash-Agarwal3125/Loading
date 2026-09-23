/**
 * IndexedDB via Dexie. Replaces localStorage from the prototype.
 *
 * STORES: telemetry, tasks, incidents, ppeChecks, faultLookups, training,
 *         outbox, models, zoneProfiles, settings
 *
 * Encrypt images at rest. Clear everything on logout and uninstall.
 */
// TODO
