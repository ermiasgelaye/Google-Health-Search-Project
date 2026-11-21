#!/usr/bin/env python3
"""Refresh the Google Trends search data (2004 → today) — run this on your own machine.

The original data (Google News Lab, via Kaggle) stops in 2017 and was never updated, so newer years must be
re-queried from Google Trends. This script reproduces the original structure exactly: for each condition and
each calendar year, Google's interest by metro area (Nielsen DMA), scaled 0–100 within that term and year.
Because every year is scaled on its own, the whole series is re-pulled rather than appending new years.

Uses the unofficial `pytrends` client (pip install pytrends pandas). Google rate-limits it heavily, so the
script is slow on purpose (about a minute between requests) and resumable: every (term, year) response is
saved to Data/trends_cache/, and re-running skips what's already downloaded. Expect several hours for the
~200 requests; you can stop and restart at any time.

    python3 tools/fetch_trends.py                 # download 2004 → current year (current year = year to date)
    python3 tools/fetch_trends.py --apply         # then write Data/database/load_in_to_db/search_condition.csv
    python3 tools/build_static.py && python3 tools/build_map.py && python3 tools/analyze.py

Before --apply, the current search_condition.csv is copied to search_condition_2004_2017_original.csv.
"""
import argparse
import datetime as dt
import json
import pathlib
import random
import shutil
import sys
import time

ROOT = pathlib.Path(__file__).resolve().parent.parent
CACHE = ROOT / "Data" / "trends_cache"
DB = ROOT / "Data" / "database" / "load_in_to_db"
TERMS = ["cancer", "cardiovascular", "stroke", "depression", "rehab", "vaccine", "diarrhea", "obesity", "diabetes"]
COLUMNS = {"cancer": "Cancer"}  # the original table capitalises Cancer only


def fetch(years, pause):
    try:
        from pytrends.request import TrendReq
    except ImportError:
        sys.exit("Install the client first:  pip install pytrends pandas")
    CACHE.mkdir(parents=True, exist_ok=True)
    py = TrendReq(hl="en-US", tz=300, timeout=(10, 30))
    todo = [(y, t) for y in years for t in TERMS if not (CACHE / f"{y}_{t}.json").exists()]
    print(f"{len(todo)} requests to go ({len(years) * len(TERMS) - len(todo)} already cached)")
    today = dt.date.today()
    for n, (year, term) in enumerate(todo, 1):
        end = f"{year}-12-31" if year < today.year else today.isoformat()
        for attempt in range(6):
            try:
                py.build_payload([term], timeframe=f"{year}-01-01 {end}", geo="US")
                df = py.interest_by_region(resolution="DMA", inc_low_vol=True, inc_geo_code=True)
                rows = [{"dma": dma, "geoCode": str(r["geoCode"]), "value": int(r[term])} for dma, r in df.iterrows()]
                if len(rows) < 150:
                    raise RuntimeError(f"only {len(rows)} metro areas returned")
                (CACHE / f"{year}_{term}.json").write_text(json.dumps({"term": term, "year": year, "end": end, "rows": rows}))
                print(f"[{n}/{len(todo)}] {year} {term}: {len(rows)} metro areas")
                break
            except Exception as e:  # 429 Too Many Requests, timeouts, ...
                wait = pause * (2 ** attempt) + random.uniform(0, 15)
                print(f"  {year} {term}: {type(e).__name__}: {str(e)[:80]} — waiting {wait:.0f}s")
                time.sleep(wait)
        else:
            sys.exit("Google keeps refusing requests. Wait an hour (or change network) and run again — progress is saved.")
        time.sleep(pause + random.uniform(0, 20))


def apply(years):
    import pandas as pd
    missing = [f"{y} {t}" for y in years for t in TERMS if not (CACHE / f"{y}_{t}.json").exists()]
    if missing:
        sys.exit(f"{len(missing)} downloads still missing (e.g. {', '.join(missing[:4])}). Run without --apply first.")
    rows = []
    for y in years:
        for t in TERMS:
            for r in json.loads((CACHE / f"{y}_{t}.json").read_text())["rows"]:
                rows.append({"location_id": int(r["geoCode"]), "year": y, "term": COLUMNS.get(t, t), "value": r["value"]})
    wide = pd.DataFrame(rows).pivot_table(index=["location_id", "year"], columns="term", values="value").reset_index()
    known = set(pd.read_csv(DB / "location.csv").location_id)
    extra = sorted(set(wide.location_id) - known)
    if extra:
        print(f"Note: {len(extra)} metro codes not in location.csv were dropped: {extra[:8]}")
    wide = wide[wide.location_id.isin(known)]
    cols = ["location_id"] + [COLUMNS.get(t, t) for t in TERMS] + ["year"]
    backup = DB / "search_condition_2004_2017_original.csv"
    if not backup.exists():
        shutil.copy(DB / "search_condition.csv", backup)
    wide[cols].astype(int).sort_values(["year", "location_id"]).to_csv(DB / "search_condition.csv", index=False)
    print(f"Wrote search_condition.csv: {wide.location_id.nunique()} metro areas × {wide.year.nunique()} years "
          f"({min(years)}–{max(years)}). Original kept as {backup.name}.")


def main():
    ap = argparse.ArgumentParser(description=__doc__.split("\n")[0])
    ap.add_argument("--start", type=int, default=2004)
    ap.add_argument("--end", type=int, default=dt.date.today().year)
    ap.add_argument("--pause", type=float, default=60, help="seconds between requests (default 60)")
    ap.add_argument("--apply", action="store_true", help="write the downloaded data into the project")
    a = ap.parse_args()
    years = list(range(a.start, a.end + 1))
    apply(years) if a.apply else fetch(years, a.pause)


if __name__ == "__main__":
    main()
