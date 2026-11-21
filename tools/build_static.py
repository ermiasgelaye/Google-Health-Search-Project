#!/usr/bin/env python3
"""Pre-compute every data endpoint as a static JSON file, so the site needs no database or server.

The site used to query PostgreSQL on every request. The data never changes, so this script loads
the same CSVs the database was built from into an in-memory SQLite database, runs each endpoint's
original SQL, and writes the result to static/data/<endpoint>.json in the same format the Flask
routes returned (pandas `to_json(orient="table")`).

It also writes assets/data/health.json: a compact, pre-shaped copy of the same data that the
website itself loads (about 10x smaller than the API files).

Run it after editing any CSV in Data/database/load_in_to_db/ (or after tools/clean_data.py):
    python3 tools/build_static.py
"""
import json
import pathlib
import sqlite3

import pandas as pd

ROOT = pathlib.Path(__file__).resolve().parent.parent
SRC = ROOT / "Data" / "database" / "load_in_to_db"
OUT = ROOT / "static" / "data"

SUM_ALL = ('SUM(s."Cancer" + s."cardiovascular" + s."stroke" + s."depression" + s."rehab"'
           ' + s."vaccine" + s."diarrhea" + s."obesity" + s."diabetes")')
SUM_EACH = ('SUM("Cancer") AS cancer, SUM("cardiovascular") AS cardiovascular, SUM("stroke") AS stroke,'
            ' SUM("depression") AS depression, SUM("rehab") AS rehab, SUM("vaccine") AS vaccine,'
            ' SUM("diarrhea") AS diarrhea, SUM("obesity") AS obesity, SUM("diabetes") AS diabetes')

# endpoint name -> (SQL, index column). Aliases are lower-case because PostgreSQL folded the
# original unquoted aliases (e.g. `AS Searches`) to lower case, and the front end reads them that way.
ENDPOINTS = {
    "searchbyyear": (f'SELECT year, {SUM_ALL.replace("s.", "")} AS searches FROM search_condition '
                     'GROUP BY year ORDER BY year', "year"),
    "searchyearandcondition": (f"SELECT year, {SUM_EACH} FROM search_condition GROUP BY year ORDER BY year", "year"),
    "searchbycity": (f"SELECT l.city, l.postal, l.state, l.latitude, l.longitude, {SUM_ALL} AS searches "
                     "FROM location l JOIN search_condition s ON s.location_id = l.location_id "
                     "GROUP BY l.city, l.state, l.postal, l.latitude, l.longitude ORDER BY l.city", "city"),
    "searchbystate": (f"SELECT l.state, l.postal, {SUM_ALL} AS searches FROM location l "
                      "JOIN search_condition s ON s.location_id = l.location_id "
                      "GROUP BY l.state, l.postal ORDER BY l.state", "state"),
    "bystateandyear": (f"SELECT l.state, l.latitude, l.longitude, s.year, {SUM_ALL} AS searches "
                       "FROM location l JOIN search_condition s ON s.location_id = l.location_id "
                       "GROUP BY l.state, l.latitude, l.longitude, s.year ORDER BY s.year", "state"),
    "casesleadingdeath": ("SELECT * FROM leading_causes_of_death ORDER BY year", "year"),
    # location_id appears in both tables; select it once so the JSON has unique keys.
    "allsearchrecord": ('SELECT l.city, l.state, l.postal, l.latitude, l.longitude, s.* '
                        "FROM location l JOIN search_condition s ON s.location_id = l.location_id "
                        "ORDER BY s.year, l.city", "year"),
    "location": ("SELECT * FROM location", "location_id"),
    "conditions": ("SELECT * FROM search_condition", "location_id"),
    "mostsserached": (f"SELECT l.state, {SUM_EACH} FROM location l "
                      "JOIN search_condition s ON s.location_id = l.location_id GROUP BY l.state "
                      "ORDER BY cancer DESC, cardiovascular DESC, stroke DESC, depression DESC, rehab DESC, "
                      "vaccine DESC, diarrhea DESC, diabetes DESC, obesity DESC LIMIT 10", "state"),
    "totalcondition": (f"SELECT {SUM_EACH} FROM search_condition", "cancer"),
    # Linked from the menu but never implemented on the server: total CDC death rate per cause.
    "totaldeathcase": ('SELECT SUM("Diseases_of_heart") AS diseases_of_heart, SUM("Malignant_neoplasms") AS malignant_neoplasms,'
                       ' SUM("Accidents") AS accidents, SUM("Respiratory") AS respiratory, SUM("Cerebrovascular") AS cerebrovascular,'
                       ' SUM("Alzheimer") AS alzheimer, SUM("Diabetes") AS diabetes, SUM("Influenza_and_pneumonia") AS influenza_and_pneumonia,'
                       ' SUM("Nephrosis") AS nephrosis, SUM("Suicide") AS suicide FROM leading_causes_of_death', None),
}


def load_db():
    con = sqlite3.connect(":memory:")
    for table in ("location", "search_condition", "leading_causes_of_death"):
        df = pd.read_csv(SRC / f"{table}.csv", encoding="utf-8-sig")
        df.to_sql(table, con, index=False)
    return con


CONDITIONS = ["Cancer", "cardiovascular", "stroke", "depression", "rehab", "vaccine", "diarrhea", "obesity", "diabetes"]
CDC_CAUSES = ["Diseases_of_heart", "Malignant_neoplasms", "Accidents", "Respiratory", "Cerebrovascular",
              "Alzheimer", "Diabetes", "Influenza_and_pneumonia", "Nephrosis", "Suicide"]


def write_site_data(con):
    """Columnar data for the web pages: values[metro][year] = [9 Google Trends scores]."""
    loc = pd.read_sql("SELECT * FROM location ORDER BY city", con)
    sc = pd.read_sql("SELECT * FROM search_condition", con)
    cdc = pd.read_sql("SELECT * FROM leading_causes_of_death ORDER BY year", con)
    years = sorted(sc["year"].unique().tolist())
    by = sc.set_index(["location_id", "year"])[CONDITIONS]
    metros, values = [], []
    for r in loc.itertuples(index=False):
        metros.append({"id": int(r.location_id), "name": r.city, "state": r.state, "postal": r.postal,
                       "lat": round(float(r.latitude), 3), "lng": round(float(r.longitude), 3)})
        values.append([[int(v) for v in by.loc[(r.location_id, y)].tolist()] for y in years])
    payload = {
        "source": "Google Trends regional interest by DMA (each year x condition scaled 0-100) and CDC age-adjusted death rates",
        "conditions": CONDITIONS, "years": years, "metros": metros, "values": values,
        "cdc": {"years": cdc["year"].tolist(), "causes": {c: cdc[c].tolist() for c in CDC_CAUSES}},
    }
    path = ROOT / "assets" / "data" / "health.json"
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(payload, separators=(",", ":")))
    print(f"{path.relative_to(ROOT)}  {len(metros)} metros  {path.stat().st_size // 1024} KB")


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    con = load_db()
    for name, (sql, index) in ENDPOINTS.items():
        df = pd.read_sql(sql, con)
        if index:
            df = df.set_index(index)
        payload = json.loads(df.to_json(orient="table"))
        path = OUT / f"{name}.json"
        path.write_text(json.dumps(payload, separators=(",", ":")))
        print(f"{path.relative_to(ROOT)}  {len(df):>5} rows  {path.stat().st_size // 1024} KB")
    write_site_data(con)


if __name__ == "__main__":
    main()
