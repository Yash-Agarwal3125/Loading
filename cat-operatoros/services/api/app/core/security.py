"""
OIDC token validation, role extraction, device enrolment.

ROLES: operator | supervisor | safety_officer | maintenance | admin

require_role(*roles) is a dependency. Apply it to every endpoint that is not
explicitly public. An endpoint with no role dependency is a bug, and the test
suite should assert that no route lacks one.
"""
# TODO
