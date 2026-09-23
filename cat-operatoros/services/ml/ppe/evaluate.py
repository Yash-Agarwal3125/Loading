"""\nppe/evaluate.py\n\nPPE detection. Recall over precision: a false pass is a person without a helmet, a false fail is two taps. Evaluate lighting-bucket disparity explicitly; a gap over 5 points is a blocker, not a known issue.\n\nSee docs/ML_SPEC.md for ship criteria.\n"""
# TODO
