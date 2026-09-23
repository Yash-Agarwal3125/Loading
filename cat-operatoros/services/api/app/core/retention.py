"""
Scheduled retention enforcement.

Retention that depends on someone remembering is not retention. This job runs
nightly and physically deletes:

    PPE thumbnails          > 7 days
    Warning-light photos    > 30 days
    Voice transcripts       > 30 days
    Hazard photos           > 24 months (or incident closed + 12 months)
    Telemetry               > 24 months hot -> roll up to aggregates

Write this in phase one, not "before launch". Table in
docs/DATA_GOVERNANCE.md section 2.
"""
# TODO
