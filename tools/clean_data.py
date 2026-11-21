#!/usr/bin/env python3
"""Data corrections applied on top of the original cleaning notebook.

An audit of Data/database/load_in_to_db/*.csv found three problems; this script fixes them in place
and is safe to re-run.

1. Wrong state for multi-state metro areas. Google Trends reports 210 Nielsen DMAs such as
   "Tallahassee FL-Thomasville GA". The original cleaning used the *last* state code, so the DMA was
   filed under Georgia (and Washington DC, Rhode Island and Vermont disappeared entirely). The primary
   state is the first code — the one the DMA is named after.
2. Wrong coordinates from geocoding by bare city name: e.g. "Victoria" TX was placed in Australia,
   "Lima" OH in Peru and "Albany" GA in New York. 23 of 210 points fell outside their own state.
   They are replaced with the coordinates of the DMA's primary city (below).
3. A typo in the CDC table: the 2017 age-adjusted cancer death rate is 152.5 per 100k (CDC,
   Health, United States), not 52.5 — which made cancer deaths appear to drop by two thirds in a year.

4. The cleaning notebook's output, Data/Data_Cleaning/cleaned_data/health_data.csv, carried the same bad
   geocoding plus its own: coordinates that change between years for one metro (Philadelphia placed in
   Pittsburgh, San Francisco in Philadelphia, Quincy IL in Nebraska and Alaska), 7 metros never geocoded and
   420 blank trailing rows. It is rebuilt with one corrected coordinate pair per metro; search values are
   unchanged (they match the database table exactly).

Known source anomalies (kept, not corrected — they are Google's own values): in a few metro-years every
condition drops together and recovers the next year — Portland OR 2013–15, Roanoke-Lynchburg VA 2014–15,
San Francisco and Washington DC 2009–10. This looks like a Google sampling artefact; metro averages over 14
years are only slightly affected.

Run:  python3 tools/clean_data.py && python3 tools/build_static.py
"""
import pathlib
import re

import pandas as pd

ROOT = pathlib.Path(__file__).resolve().parent.parent
RAW = ROOT / "Data" / "Data_Cleaning" / "raw_data" / "RegionalInterestByConditionOverTime.csv"
DB = ROOT / "Data" / "database" / "load_in_to_db"
CLEANED = ROOT / "Data" / "Data_Cleaning" / "cleaned_data"

STATE_NAMES = {
    "AL": "Alabama", "AK": "Alaska", "AZ": "Arizona", "AR": "Arkansas", "CA": "California", "CO": "Colorado",
    "CT": "Connecticut", "DC": "District of Columbia", "DE": "Delaware", "FL": "Florida", "GA": "Georgia",
    "HI": "Hawaii", "ID": "Idaho", "IL": "Illinois", "IN": "Indiana", "IA": "Iowa", "KS": "Kansas",
    "KY": "Kentucky", "LA": "Louisiana", "ME": "Maine", "MD": "Maryland", "MA": "Massachusetts",
    "MI": "Michigan", "MN": "Minnesota", "MS": "Mississippi", "MO": "Missouri", "MT": "Montana",
    "NE": "Nebraska", "NV": "Nevada", "NH": "New Hampshire", "NJ": "New Jersey", "NM": "New Mexico",
    "NY": "New York", "NC": "North Carolina", "ND": "North Dakota", "OH": "Ohio", "OK": "Oklahoma",
    "OR": "Oregon", "PA": "Pennsylvania", "RI": "Rhode Island", "SC": "South Carolina", "SD": "South Dakota",
    "TN": "Tennessee", "TX": "Texas", "UT": "Utah", "VT": "Vermont", "VA": "Virginia", "WA": "Washington",
    "WV": "West Virginia", "WI": "Wisconsin", "WY": "Wyoming",
}

# Coordinates of the primary city for DMAs whose geocoded point was wrong or whose primary city changed.
COORDS = {
    511: (38.907, -77.037),   # Washington DC (Hagerstown MD)
    521: (41.824, -71.413),   # Providence RI-New Bedford MA
    523: (44.476, -73.212),   # Burlington VT-Plattsburgh NY
    525: (31.578, -84.156),   # Albany GA
    530: (30.438, -84.281),   # Tallahassee FL-Thomasville GA
    531: (36.313, -82.353),   # Tri-Cities TN-VA (Johnson City)
    546: (34.000, -81.035),   # Columbia SC
    549: (43.975, -75.911),   # Watertown NY
    522: (32.461, -84.988),   # Columbus GA
    554: (40.064, -80.721),   # Wheeling WV-Steubenville OH
    558: (40.743, -84.105),   # Lima OH
    567: (34.853, -82.394),   # Greenville-Spartanburg SC-Asheville NC-Anderson SC
    603: (37.084, -94.513),   # Joplin MO-Pittsburg KS
    611: (44.012, -92.480),   # Rochester MN-Mason City IA-Austin MN
    626: (28.805, -97.004),   # Victoria TX
    627: (33.914, -98.493),   # Wichita Falls TX & Lawton OK
    628: (32.509, -92.119),   # Monroe LA-El Dorado AR
    631: (41.020, -92.411),   # Ottumwa IA-Kirksville MO
    632: (37.083, -88.600),   # Paducah KY-Cape Girardeau MO-Harrisburg-Mount Vernon IL
    638: (39.768, -94.846),   # St. Joseph MO
    639: (35.615, -88.814),   # Jackson TN
    642: (30.224, -92.020),   # Lafayette LA
    644: (31.311, -92.445),   # Alexandria LA
    647: (33.516, -90.180),   # Greenwood-Greenville MS
    657: (33.636, -96.609),   # Sherman TX-Ada OK
    676: (46.787, -92.100),   # Duluth MN-Superior WI
    682: (41.524, -90.578),   # Davenport IA-Rock Island-Moline IL
    686: (30.695, -88.040),   # Mobile AL-Pensacola (Ft. Walton Beach) FL
    687: (48.233, -101.296),  # Minot-Bismarck-Dickinson(Williston) ND
    711: (32.364, -88.704),   # Meridian MS
    717: (39.936, -91.410),   # Quincy IL-Hannibal MO-Keokuk IA
    718: (32.299, -90.185),   # Jackson MS
    755: (47.506, -111.300),  # Great Falls MT
    759: (41.140, -104.820),  # Cheyenne WY-Scottsbluff NE
    771: (32.693, -114.628),  # Yuma AZ-El Centro CA
    802: (40.802, -124.164),  # Eureka CA
}

# The 2017 row of both copies of the CDC table: cancer (2nd column) was typed as 52.5 instead of 152.5.
CDC_FILES = [DB / "leading_causes_of_death.csv", CLEANED / "leading_causes_of_death.csv"]
CDC_ROW_FIX = (b"165,52.5,49.4,", b"165,152.5,49.4,")


def fix_locations():
    raw = pd.read_csv(RAW, encoding="utf-8-sig")[["dma", "geoCode"]]
    old = pd.read_csv(DB / "location.csv", encoding="utf-8-sig").set_index("location_id")
    rows = []
    for dma, code in raw.itertuples(index=False):
        postal = re.findall(r"\b([A-Z]{2})\b", dma)[0]
        lat, lng = COORDS.get(code, (old.at[code, "latitude"], old.at[code, "longitude"]))
        rows.append({"city": dma, "state": STATE_NAMES[postal], "postal": postal,
                     "location_id": code, "latitude": round(float(lat), 6), "longitude": round(float(lng), 6)})
    df = pd.DataFrame(rows).sort_values("city")
    df.to_csv(DB / "location.csv", index=False)
    print(f"location.csv: {len(df)} metro areas in {df.state.nunique()} states/DC")


def fix_cdc():
    """Edit only the faulty row, so the rest of each file is left byte-for-byte unchanged."""
    wrong, right = CDC_ROW_FIX
    for path in CDC_FILES:
        data = path.read_bytes()  # bytes, so BOM and CRLF line endings are preserved
        if wrong in data:
            path.write_bytes(data.replace(wrong, right))
            print(f"{path.name}: 2017 cancer death rate 52.5 -> 152.5")


def rebuild_health_data():
    """Rewrite the cleaning output with one corrected coordinate pair per metro and no blank rows."""
    path = CLEANED / "health_data.csv"
    if not path.exists():
        return
    d = pd.read_csv(path, encoding="utf-8-sig").dropna(subset=["City"])
    loc = pd.read_csv(DB / "location.csv").set_index("location_id")
    d["location_id"] = d["location_id"].astype(int)
    d["year"] = d["year"].astype(int)
    d["Latitude"] = d["location_id"].map(loc["latitude"])
    d["Longitude"] = d["location_id"].map(loc["longitude"])
    cols = ["Cancer", "cardiovascular", "stroke", "depression", "rehab", "vaccine", "diarrhea", "obesity", "diabetes"]
    d[cols] = d[cols].astype(int)
    d.to_csv(path, index=False)
    print(f"health_data.csv: {len(d)} rows, {d.City.nunique()} metros, {d.Latitude.isna().sum()} missing coordinates")


if __name__ == "__main__":
    fix_locations()
    fix_cdc()
    rebuild_health_data()
