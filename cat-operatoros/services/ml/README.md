# ML

Four models. Full spec in `docs/ML_SPEC.md` — thresholds, training data
requirements and monitoring signals live there, not here.

```
ppe/              helmet, vest, eye protection. YOLO family, on-device.
warning_lights/   ~40 ISO symbol classes. Confirm-not-classify.
eta/              LightGBM + quantile intervals + SHAP contributors.
anomaly/          z-score and IQR against the operator's own baseline.
common/           dataset loading, eval harness, ONNX export, registry.
```

Each model directory has the same four entry points:

```
train.py      fit, log to MLflow with dataset hash and params
evaluate.py   full report including the fairness and lighting slices
export.py     ONNX, INT8 quantised, size and latency assertions
predict.py    reference implementation, used by tests
```

A model version without a current evaluation report does not deploy. The
export step asserts the size and latency budgets and fails the build if they
are missed, so a too-large model cannot reach a device.
