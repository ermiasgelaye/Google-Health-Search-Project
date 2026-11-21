#!/usr/bin/env python3
"""Download the external validation data: CDC BRFSS state-level disease prevalence, 2011–2017.

Used to test the project's research question — does search interest reflect where conditions actually
occur? — by comparing each state's Google search interest with the share of adults who report the condition.

Source: CDC, Behavioral Risk Factor Surveillance System (BRFSS) Prevalence Data (2011 to present),
        https://data.cdc.gov/Behavioral-Risk-Factors/BRFSS-Prevalence-Data-2011-to-present-/dttw-5yxu
        Crude prevalence (%) of adults, overall population, by state and year.
Output: Data/external/brfss_state_prevalence_2011_2017.csv  (state, measure, year, prevalence)

Run:   python3 tools/fetch_external.py              (only needed to refresh the file; it is committed)
       python3 tools/fetch_external.py saved.json   (use a response already downloaded, e.g. with curl)
"""
import csv
import json
import pathlib
import sys
import urllib.parse
import urllib.request

ROOT = pathlib.Path(__file__).resolve().parent.parent
OUT = ROOT / "Data" / "external" / "brfss_state_prevalence_2011_2017.csv"
# BRFSS question -> (measure name, response that counts as having the condition)
MEASURES = {
    "DIABETE3": ("diabetes", lambda r: r == "Yes"),
    "ADDEPEV2": ("depression", lambda r: r == "Yes"),
    "_BMI5CAT": ("obesity", lambda r: r.lower().startswith("obese")),
    "_MICHD": ("coronary_heart_disease", lambda r: r == "Reported having MI or CHD"),
    "CVDSTRK3": ("stroke", lambda r: r == "Yes"),
    "CHCOCNCR": ("cancer", lambda r: r == "Yes"),
    "_FLSHOT6": ("flu_vaccination_65plus", lambda r: r == "Yes"),
}


def main():
    where = ("year between 2011 and 2017 and break_out='Overall' and questionid in("
             + ",".join(f"'{q}'" for q in MEASURES) + ")")
    url = "https://data.cdc.gov/resource/dttw-5yxu.json?" + urllib.parse.urlencode({"$where": where, "$limit": 50000})
    if len(sys.argv) > 1:
        rows = json.loads(pathlib.Path(sys.argv[1]).read_text())
    else:
        with urllib.request.urlopen(url, timeout=60) as res:
            rows = json.load(res)
    out = []
    for r in rows:
        name, keep = MEASURES[r["questionid"]]
        if keep(r.get("response", "")) and r.get("data_value") not in (None, ""):
            out.append((r["locationabbr"], name, int(r["year"]), float(r["data_value"])))
    out.sort()
    OUT.parent.mkdir(parents=True, exist_ok=True)
    with OUT.open("w", newline="") as f:
        w = csv.writer(f)
        w.writerow(["state", "measure", "year", "prevalence_pct"])
        w.writerows(out)
    print(f"{OUT.relative_to(ROOT)}  {len(out)} rows")


if __name__ == "__main__":
    main()
