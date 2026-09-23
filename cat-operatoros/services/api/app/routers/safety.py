"""
PPE results, overrides, compliance aggregates.

CONTRACT — read docs/DATA_GOVERNANCE.md first.

POST /ppe-checks
    Accepts the STRUCTURED RESULT plus a 256px thumbnail. Never a full photo.
    Reject any payload containing a full-resolution image: that is a client
    bug and silently accepting it defeats the entire privacy design.

POST /ppe-checks/{id}/override
    reason in: equipment_not_required | check_not_working |
               verified_by_supervisor | other
    Notifies the supervisor. Never blocks the shift.

GET /ppe-compliance          supervisor  -> AGGREGATES ONLY
GET /ppe-checks/{operator}   safety_officer, requires ?reason=, audited
GET /me/ppe-checks           operator, own history, always allowed

PPE data must not be exposed on any endpoint that feeds scoring, ranking or
HR export. There is no such endpoint. Do not add one.
"""
# TODO
