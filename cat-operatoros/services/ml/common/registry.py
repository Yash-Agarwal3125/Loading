"""
MLflow wrapper.

Every logged version records: training dataset hash, hyperparameters, the full
evaluation report including fairness slices, and the approver.

Promotion to production is a deliberate call with a named approver, never an
automatic consequence of a metric improving.
"""
# TODO
