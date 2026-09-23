"""
OperatorOS API.

Read docs/ARCHITECTURE.md before adding a router. Two rules that are easy to
break and expensive to fix:

1. Role checks are enforced HERE, per endpoint. The client hiding a screen is
   not access control.
2. Every read of an individual PPE record writes an audit row before the data
   is returned. Not after. See routers/safety.py.
"""
from fastapi import FastAPI

app = FastAPI(title="OperatorOS API", version="0.1.0")

# TODO: include routers: auth, telemetry, incidents, tasks, safety,
#       training, handover, models, audit
# TODO: structlog JSON logging, request id middleware
# TODO: /healthz and /readyz


@app.get("/healthz")
def healthz():
    return {"status": "ok"}
