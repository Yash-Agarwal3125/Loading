"""Synthetic operator-telemetry generator for the CAT Smart Operator Assistant hackathon.

Produces data.csv matching the brief's sample columns (Timestamp, Machine ID,
Operator ID, Engine Hours, Fuel Used, Load Cycles, Idling Time, Seatbelt
Status, Safety Alert Triggered) plus task/condition/operation/operator fields
that give the data real depth: task duration has a target worth predicting
(Scheduled vs Actual Duration), safety fields are correlated with outcomes
instead of independent coin flips, and an Anomaly Label gives the "identify
unusual behavior" outcome something to be checked against.
"""
import csv
import random
from datetime import datetime, timedelta

random.seed(42)  # ponytail: fixed seed for reproducible demo data, remove if randomness is wanted

MACHINES = [
    ("EXC001", "Excavator"), ("EXC002", "Excavator"), ("EXC003", "Excavator"),
    ("EXC004", "Excavator"), ("EXC005", "Excavator"),
    ("LOD001", "Loader"), ("LOD002", "Loader"), ("LOD003", "Loader"),
]
DRIFTING_MACHINE = "EXC002"  # ponytail: one machine's hydraulic temp climbs over the period, a deliberate "catch it before it fails" story

OPERATORS = [f"OP{1001 + i}" for i in range(8)]
HABITUAL_IDLER = "OP1003"  # ponytail: one operator idles more than the rest, a deliberate pattern for "identify unusual behavior"

SHIFT_HOURS = [6, 8, 10, 12, 14, 16, 18, 20, 22]  # spans day and night shifts
DAYS = 45
READINGS_PER_MACHINE_PER_DAY = 3

TASK_TYPES = ["Trenching", "Truck Loading", "Grading", "Backfilling", "Demolition"]
BASE_DURATION_MIN = {"Trenching": 90, "Truck Loading": 45, "Grading": 75, "Backfilling": 60, "Demolition": 120}
MATERIALS = {"Clay": 1.15, "Sand": 0.9, "Gravel": 1.0, "Rock": 1.35}
WEATHER = {"Clear": 1.0, "Rain": 1.15, "Fog": 1.05, "Dust": 1.1}
GROUND = {"Dry": 1.0, "Wet": 1.1, "Muddy": 1.25}
SITE_ZONES = ["Zone A", "Zone B", "Zone C", "Zone D"]
FUEL_BURN_RATE = {"Excavator": 1.1, "Loader": 0.9}  # L per engine hour at 100% load


def operator_profile(operator_id):
    """Deterministic per-operator profile: experience drives duration and incident risk."""
    rng = random.Random(operator_id)
    experience = rng.randint(0, 15)
    certification = "Trainee" if experience < 1 else ("Certified" if experience <= 5 else "Expert")
    return experience, certification


def experience_factor(experience):
    if experience < 1:
        return 1.2
    if experience <= 5:
        return 1.0
    return 0.85


def make_alert(idling_min, seatbelt, load_cycles, proximity_alert):
    """Safety alert fires on the same conditions the dashboard flags as risky."""
    if seatbelt == "Unfastened" or proximity_alert == "Yes":
        return "Yes"
    if idling_min >= 45:
        return "Yes"
    if load_cycles == 0 and idling_min >= 20:
        return "Yes"
    return "No"


def make_anomaly_label(idling_min, hydraulic_temp, max_tilt, max_speed):
    if idling_min >= 45:
        return "Excessive Idling"
    if hydraulic_temp >= 100:
        return "Overheating"
    if max_tilt >= 15:
        return "Unsafe Tilt"
    if max_speed >= 15:
        return "Overspeed"
    return "None"


def generate_rows():
    rows = []
    start_date = datetime(2025, 5, 1)
    engine_hours = {m: round(random.uniform(1400, 1600), 1) for m, _ in MACHINES}
    last_ts = {m: None for m, _ in MACHINES}

    for day in range(DAYS):
        date = start_date + timedelta(days=day)
        # One operator per machine per day (an operator can't be on two machines at once).
        day_assignment = dict(zip([m for m, _ in MACHINES], random.sample(OPERATORS, len(MACHINES))))
        for machine_id, machine_type in MACHINES:
            operator_id = day_assignment[machine_id]
            experience, certification = operator_profile(operator_id)

            for hour in sorted(random.sample(SHIFT_HOURS, READINGS_PER_MACHINE_PER_DAY)):
                ts = date.replace(hour=hour)
                shift = "Night" if hour >= 18 or hour < 6 else "Day"
                hours_into_shift = round((hour - 6) % 12 + random.uniform(0, 1.5), 1)

                # Engine hours only climb, and never by more than wall-clock time actually elapsed.
                elapsed_hours = (ts - last_ts[machine_id]).total_seconds() / 3600 if last_ts[machine_id] else 24
                engine_delta = max(0.2, min(random.uniform(0.5, 3.5), elapsed_hours * 0.9))
                engine_hours[machine_id] = round(engine_hours[machine_id] + engine_delta, 1)
                last_ts[machine_id] = ts

                # Task
                task_type = random.choice(TASK_TYPES)
                material = random.choice(list(MATERIALS))
                site_zone = random.choice(SITE_ZONES)
                base = BASE_DURATION_MIN[task_type]
                scheduled_duration = round(base * MATERIALS[material])
                weather = random.choices(list(WEATHER), weights=[60, 15, 15, 10])[0]
                ground = random.choices(list(GROUND), weights=[60, 25, 15])[0]
                noise = random.uniform(0.9, 1.15)
                actual_duration = round(
                    base * MATERIALS[material] * WEATHER[weather] * GROUND[ground]
                    * (1.12 if shift == "Night" else 1.0) * experience_factor(experience) * noise
                )

                load_cycles = random.choices([0, 1, 2, 5, 8, 10, 12, 15], weights=[5, 5, 10, 15, 20, 20, 15, 10])[0]
                idling_time = random.choices(range(0, 65, 5), weights=[10, 10, 10, 10, 8, 8, 8, 6, 6, 6, 6, 4, 4])[0]
                if operator_id == HABITUAL_IDLER:
                    idling_time = min(60, idling_time + 15)

                engine_load_pct = round(min(100, max(10, random.gauss(55, 15))))
                fuel_used = round(
                    engine_delta * FUEL_BURN_RATE[machine_type] * (0.7 + engine_load_pct / 100 * 0.6)
                    + idling_time * 0.02, 1
                )

                hydraulic_temp = round(70 + engine_load_pct * 0.3 + random.uniform(-3, 3), 1)
                if machine_id == DRIFTING_MACHINE:
                    hydraulic_temp = round(hydraulic_temp + day * 1.0, 1)  # slow developing fault
                max_tilt = round(max(0, random.gauss(5, 3)), 1)
                if random.random() < 0.03:
                    max_tilt = round(random.uniform(15, 25), 1)  # occasional unsafe spike
                max_speed = round(max(0, random.gauss(8, 3)), 1)
                if random.random() < 0.03:
                    max_speed = round(random.uniform(15, 22), 1)  # occasional overspeed spike
                harsh_events = max(0, round(random.gauss(0.5, 0.8)))
                if max_tilt >= 15 or max_speed >= 15:
                    harsh_events += random.randint(1, 3)

                seatbelt = random.choices(["Fastened", "Unfastened"], weights=[85, 15])[0]

                proximity_distance = round(random.uniform(1, 60), 1)
                if shift == "Night" or task_type == "Truck Loading":
                    proximity_distance = round(proximity_distance * 0.6, 1)
                proximity_alert = "Yes" if proximity_distance < 3 else "No"
                proximity_object = random.choice(["Person", "Vehicle", "Structure"]) if proximity_alert == "Yes" else "None"

                alert = make_alert(idling_time, seatbelt, load_cycles, proximity_alert)

                incident_logged = "No"
                incident_type = "None"
                incident_severity = "None"
                if alert == "Yes":
                    incident_risk = 0.3
                    if certification == "Trainee":
                        incident_risk += 0.15
                    if ground == "Muddy":
                        incident_risk += 0.1
                    if hours_into_shift > 8:
                        incident_risk += 0.1
                    if random.random() < incident_risk:
                        incident_logged = "Yes"
                        incident_type = random.choice(["Near Miss", "Collision", "Tip-over Risk"])
                        incident_severity = random.choices(["Low", "Medium", "High"], weights=[60, 30, 10])[0]

                anomaly_label = make_anomaly_label(idling_time, hydraulic_temp, max_tilt, max_speed)
                if anomaly_label == "None" and random.random() < 0.02:
                    anomaly_label = random.choice(["Excessive Idling", "Overheating", "Unsafe Tilt", "Overspeed"])

                rows.append({
                    "Timestamp": ts.strftime("%Y-%m-%d %H:%M:%S"),
                    "Machine ID": machine_id,
                    "Machine Type": machine_type,
                    "Operator ID": operator_id,
                    "Operator Experience (yrs)": experience,
                    "Operator Certification": certification,
                    "Hours Into Shift": hours_into_shift,
                    "Task ID": f"T{len(rows) + 1:05d}",
                    "Task Type": task_type,
                    "Site Zone": site_zone,
                    "Material": material,
                    "Weather": weather,
                    "Ground Condition": ground,
                    "Shift": shift,
                    "Engine Hours": engine_hours[machine_id],
                    "Fuel Used (L)": fuel_used,
                    "Engine Load (%)": engine_load_pct,
                    "Hydraulic Oil Temp (C)": hydraulic_temp,
                    "Load Cycles": load_cycles,
                    "Idling Time (min)": idling_time,
                    "Max Tilt (deg)": max_tilt,
                    "Max Travel Speed (km/h)": max_speed,
                    "Harsh Event Count": harsh_events,
                    "Seatbelt Status": seatbelt,
                    "Proximity Min Distance (m)": proximity_distance,
                    "Proximity Object": proximity_object,
                    "Proximity Alert": proximity_alert,
                    "Scheduled Duration (min)": scheduled_duration,
                    "Actual Duration (min)": actual_duration,
                    "Safety Alert Triggered": alert,
                    "Incident Logged": incident_logged,
                    "Incident Type": incident_type,
                    "Incident Severity": incident_severity,
                    "Anomaly Label": anomaly_label,
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

    # index.html parses the CSV with a naive line.split(','), so no field may contain a comma.
    for r in rows:
        for v in r.values():
            assert "," not in str(v), f"comma in field value would break the dashboard's CSV parser: {v!r}"

    # Engine hours must never go backward, and can't outrun wall-clock time.
    by_machine = {}
    for r in rows:
        by_machine.setdefault(r["Machine ID"], []).append(r)
    for machine_id, mrows in by_machine.items():
        mrows_sorted = sorted(mrows, key=lambda r: r["Timestamp"])
        prev_hours, prev_ts = None, None
        for r in mrows_sorted:
            ts = datetime.strptime(r["Timestamp"], "%Y-%m-%d %H:%M:%S")
            hours = r["Engine Hours"]
            if prev_hours is not None:
                assert hours >= prev_hours, f"{machine_id}: engine hours went backward at {r['Timestamp']}"
                elapsed = (ts - prev_ts).total_seconds() / 3600
                assert hours - prev_hours <= elapsed + 0.01, f"{machine_id}: engine hours outran wall-clock time at {r['Timestamp']}"
            prev_hours, prev_ts = hours, ts

    assert all(r["Actual Duration (min)"] > 0 for r in rows)
    assert all((r["Proximity Alert"] == "Yes") == (r["Proximity Min Distance (m)"] < 3) for r in rows)
    assert all(r["Incident Logged"] == "No" or r["Safety Alert Triggered"] == "Yes" for r in rows)

    # An operator's day view needs exactly one machine per operator per day.
    by_op_day = {}
    for r in rows:
        key = (r["Operator ID"], r["Timestamp"][:10])
        by_op_day.setdefault(key, set()).add(r["Machine ID"])
    assert all(len(machines) == 1 for machines in by_op_day.values()), \
        "an operator is assigned to more than one machine on the same day"

    print("self-check passed:", len(rows), "rows generated")


if __name__ == "__main__":
    import sys
    if "--test" in sys.argv:
        _self_check()
    else:
        main()
