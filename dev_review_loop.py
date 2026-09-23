"""Automated 'revisit the project as a developer' loop.

Re-scans the repo each cycle and prints/logs must-fix recommendations against
the hackathon brief (Smart Operator Assistant for CAT machinery). Meant to be
re-run as the project evolves -- each cycle reflects the *current* files on
disk, so running it again after making changes shows what's still missing.

Usage:
    python dev_review_loop.py            # 3 cycles, default
    python dev_review_loop.py --cycles 5 --pause 0
"""
import argparse
import csv
import os
import re
import time
from datetime import datetime

LOG_FILE = "RECOMMENDATIONS.md"


def _read(path):
    if not os.path.exists(path):
        return ""
    with open(path, encoding="utf-8") as f:
        return f.read()


def check_dataset():
    findings = []
    if not os.path.exists("data.csv"):
        findings.append(("MUST", "data.csv missing -- run generate_data.py before demoing."))
        return findings
    with open("data.csv", newline="") as f:
        rows = list(csv.DictReader(f))
    if len(rows) < 50:
        findings.append(("SHOULD", f"Only {len(rows)} dataset rows -- generate more for a convincing demo."))
    cols = set(rows[0].keys()) if rows else set()
    if "Safety Alert Triggered" not in cols:
        findings.append(("MUST", "Dataset lost the Safety Alert Triggered column -- brief requires it."))
    if not any(c.lower().startswith("proximity") for c in cols):
        findings.append(("MUST", "No proximity-hazard field in the dataset -- brief lists proximity hazards as a required safety feature."))
    if not any("incident" in c.lower() for c in cols):
        findings.append(("MUST", "No incident-logging field in the dataset -- brief lists incident logging as a required safety feature."))
    if not any("duration" in c.lower() for c in cols):
        findings.append(("MUST", "No task-duration field in the dataset -- brief requires task time estimation, which needs a real target to predict."))
    if not any(c in ("Weather", "Ground Condition", "Shift") for c in cols):
        findings.append(("MUST", "No working-conditions fields (weather/ground/shift) -- brief says working conditions must be considered."))
    if not any("anomaly" in c.lower() for c in cols):
        findings.append(("MUST", "No Anomaly Label field -- brief requires identifying unusual behavior, which needs a ground-truth label to check against."))
    return findings


def check_dashboard():
    findings = []
    html = _read("index.html")
    if not html:
        findings.append(("MUST", "index.html missing -- there is no dashboard to demo."))
        return findings
    required = {
        "Daily task dashboard": r"Daily Task Dashboard",
        "Seatbelt compliance display": r"[Ss]eatbelt",
        "Safety alert display": r"Safety Alert",
        "Training hub": r"Training Hub",
        "Task time estimation": r"Task Time Estimation",
    }
    for label, pattern in required.items():
        if not re.search(pattern, html):
            findings.append(("MUST", f"Dashboard is missing the '{label}' section required by the brief."))
    if "proximity" not in html.lower():
        findings.append(("MUST", "Dashboard has no proximity-hazard UI -- only seatbelt compliance is visualized."))
    if "incident" not in html.lower():
        findings.append(("MUST", "Dashboard has no incident-logging UI (form or log view)."))
    if "fetch('data.csv')" in html or 'fetch("data.csv")' in html:
        findings.append(("SHOULD", "Dashboard loads data.csv via fetch(), which needs a local server (file:// will fail on CORS) -- document `python -m http.server` in a README."))
    return findings


def check_project_hygiene():
    findings = []
    if not os.path.exists("README.md"):
        findings.append(("SHOULD", "No README.md -- judges/teammates need setup instructions (generate data, serve dashboard)."))
    if not os.path.exists(".gitignore"):
        findings.append(("NICE", "No .gitignore -- add one for __pycache__/ etc. before the repo gets noisy."))
    return findings


CHECKS = [check_dataset, check_dashboard, check_project_hygiene]


def run_cycle(cycle_num):
    findings = []
    for check in CHECKS:
        findings.extend(check())

    order = {"MUST": 0, "SHOULD": 1, "NICE": 2}
    findings.sort(key=lambda f: order[f[0]])

    ts = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    lines = [f"## Cycle {cycle_num} — {ts}", ""]
    if not findings:
        lines.append("No outstanding recommendations. Project matches the brief.")
    for severity, msg in findings:
        lines.append(f"- **{severity}**: {msg}")
    lines.append("")
    block = "\n".join(lines)

    print(block)
    with open(LOG_FILE, "a", encoding="utf-8") as f:
        f.write(block + "\n")

    return findings


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--cycles", type=int, default=3, help="number of review cycles to run")
    parser.add_argument("--pause", type=float, default=1.0, help="seconds to wait between cycles")
    args = parser.parse_args()

    with open(LOG_FILE, "a", encoding="utf-8") as f:
        f.write(f"\n# Dev review run — {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n\n")

    for i in range(1, args.cycles + 1):
        run_cycle(i)
        if i < args.cycles and args.pause > 0:
            time.sleep(args.pause)


def _self_check():
    findings = check_dataset() + check_dashboard() + check_project_hygiene()
    assert isinstance(findings, list)
    for severity, msg in findings:
        assert severity in ("MUST", "SHOULD", "NICE")
        assert isinstance(msg, str) and msg
    print("self-check passed:", len(findings), "findings on current project state")


if __name__ == "__main__":
    import sys
    if "--test" in sys.argv:
        _self_check()
    else:
        main()
