"""
SQLAlchemy models.

TABLES
  operators, machines, sites, zones, devices
  telemetry              TimescaleDB hypertable, partitioned by time
  tasks, task_runs
  incidents, incident_photos
  ppe_checks, ppe_overrides
  fault_lookups
  training_modules, training_completions, operator_skills
  handovers
  model_versions, model_rollouts
  audit_log              separate DB user, insert-only
  consents               per operator, per feature, versioned notice text

Every mutable row carries client_uuid so offline retries are idempotent.
Schema detail in docs/DATA_SCHEMA.md.
"""
