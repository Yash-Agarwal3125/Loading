"""
Append-only audit log.

Runs on a SEPARATE database user with INSERT but no UPDATE or DELETE. The
point of an audit log is that the application cannot rewrite it.

    record(actor_id, action, subject_type, subject_id, reason, request_id)

Mandatory before returning: any individual PPE record, any hazard photo, any
operator's personal history viewed by someone who is not that operator.

Retention 7 years. See docs/DATA_GOVERNANCE.md section 2.
"""
# TODO
