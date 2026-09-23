"""
ONNX export + INT8 quantisation.

Asserts before writing the artefact:
    size          <= 10 MB
    p95 latency   <= 400 ms on the reference device profile

Fail the build on a miss. A model that is too large silently degrades every
tablet on a site hotspot.
"""
# TODO
