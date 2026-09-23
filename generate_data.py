"""Synthetic operator-telemetry generator for the CAT Smart Operator Assistant hackathon.

Produces data.csv matching the sample sheet columns (Timestamp, Machine ID,
Operator ID, Engine Hours, Fuel Used, Load Cycles, Idling Time, Seatbelt
Status, Safety Alert Triggered) plus Machine Type, scaled up to many
machines/operators/days so the dashboard has something to chart.
"""
import csv
import random
from datetime import datetime, timedelta

random.seed(42)  # ponytail: fixed seed for reproducible demo data, remove if randomness is wanted

MACHINES = [
    ("EXC001", "Excavator"), ("EXC002", "Excavator"), ("EXC003", "Excavator"),
    ("LOD001", "Loader"), ("LOD002", "Loader"),
]
OPERATORS = [f"OP{1001 + i}" for i in range(6)]
SHIFT_HOURS = [8, 10, 12, 14]  # readings taken a few times per shift
DAYS = 14
ROWS_PER_MACHINE_PER_DAY = 3


def make_alert(idling_min, seatbelt, load_cycles, proximity_alert):
    """Safety alert fires on the same conditions the dashboard flags as risky."""
    if seatbelt == "Unfastened" or proximity_alert == "Yes":
        return "Yes"
    if idling_min >= 45:
        return "Yes"
    if load_cycles == 0 and idling_min >= 20:
        return "Yes"
    return "No"


def generate_rows():
    rows = []
    start_date = datetime(2025, 5, 1)
    engine_hours = {m: round(random.uniform(1400, 1600), 1) for m, _ in MACHINES}

    for day in range(DAYS):
        date = start_date + timedelta(days=day)
        for machine_id, machine_type in MACHINES:
            operator_id = random.choice(OPERATORS)
            for hour in random.sample(SHIFT_HOURS, ROWS_PER_MACHINE_PER_DAY):
                ts = date.replace(hour=hour)
                engine_hours[machine_id] = round(engine_hours[machine_id] + random.uniform(1.0, 3.5), 1)
                fuel_used = round(random.uniform(1.5, 7.0), 1)
                load_cycles = random.choices([0, 1, 2, 5, 8, 10, 12, 15], weights=[5, 5, 10, 15, 20, 20, 15, 10])[0]
                idling_time = random.choices(range(0, 65, 5), weights=[10, 10, 10, 10, 8, 8, 8, 6, 6, 6, 6, 4, 4])[0]
                seatbelt = random.choices(["Fastened", "Unfastened"], weights=[85, 15])[0]
                proximity_alert = random.choices(["Yes", "No"], weights=[8, 92])[0]
                alert = make_alert(idling_time, seatbelt, load_cycles, proximity_alert)
                incident_logged = "Yes" if (alert == "Yes" and random.random() < 0.3) else "No"

                rows.append({
                    "Timestamp": ts.strftime("%Y-%m-%d %H:%M:%S"),
                    "Machine ID": machine_id,
                    "Machine Type": machine_type,
                    "Operator ID": operator_id,
                    "Engine Hours": engine_hours[machine_id],
                    "Fuel Used (L)": fuel_used,
                    "Load Cycles": load_cycles,
                    "Idling Time (min)": idling_time,
                    "Seatbelt Status": seatbelt,
                    "Proximity Alert": proximity_alert,
                    "Safety Alert Triggered": alert,
                    "Incident Logged": incident_logged,
                })
    rows.sort(key=lambda r: r["Timestamp"])
    return rows


def main():
    rows = generate_rows()
    fieldnames = list(rows[0].keys())
    with open("data.csv", "w", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)
    print(f"Wrote {len(rows)} rows to data.csv")


def _self_check():
    rows = generate_rows()
    assert len(rows) > 0
    assert all(r["Safety Alert Triggered"] in ("Yes", "No") for r in rows)
    assert all(r["Seatbelt Status"] in ("Fastened", "Unfastened") for r in rows)
    unfastened_alerts = [r for r in rows if r["Seatbelt Status"] == "Unfastened"]
    assert all(r["Safety Alert Triggered"] == "Yes" for r in unfastened_alerts)
    print("self-check passed:", len(rows), "rows generated")


if __name__ == "__main__":
    import sys
    if "--test" in sys.argv:
        _self_check()
    else:
        main()
