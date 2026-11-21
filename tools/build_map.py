#!/usr/bin/env python3
"""Pre-project the US map into SVG paths: assets/data/usmap.data.js.

The page draws a geographically accurate state map (with Alaska and Hawaii insets) and every metro
area at its real location — with no mapping library and no network request, so it always loads.

  Shapes: Data/geo/states-albers-10m.json — us-atlas 3.0.1 (US Census Bureau cartographic boundaries),
          already projected to Albers USA in a 975 x 610 frame.
  Points: metro coordinates from assets/data/health.data.js (corrected by tools/clean_data.py),
          projected here with the same Albers USA projection so they line up with the shapes.

Run after tools/build_static.py:   python3 tools/build_map.py
"""
import json
import math
import pathlib
import re

ROOT = pathlib.Path(__file__).resolve().parent.parent
NAME_TO_POSTAL = {
    "Alabama": "AL", "Alaska": "AK", "Arizona": "AZ", "Arkansas": "AR", "California": "CA", "Colorado": "CO", "Connecticut": "CT",
    "Delaware": "DE", "District of Columbia": "DC", "Florida": "FL", "Georgia": "GA", "Hawaii": "HI", "Idaho": "ID", "Illinois": "IL",
    "Indiana": "IN", "Iowa": "IA", "Kansas": "KS", "Kentucky": "KY", "Louisiana": "LA", "Maine": "ME", "Maryland": "MD",
    "Massachusetts": "MA", "Michigan": "MI", "Minnesota": "MN", "Mississippi": "MS", "Missouri": "MO", "Montana": "MT",
    "Nebraska": "NE", "Nevada": "NV", "New Hampshire": "NH", "New Jersey": "NJ", "New Mexico": "NM", "New York": "NY",
    "North Carolina": "NC", "North Dakota": "ND", "Ohio": "OH", "Oklahoma": "OK", "Oregon": "OR", "Pennsylvania": "PA",
    "Rhode Island": "RI", "South Carolina": "SC", "South Dakota": "SD", "Tennessee": "TN", "Texas": "TX", "Utah": "UT",
    "Vermont": "VT", "Virginia": "VA", "Washington": "WA", "West Virginia": "WV", "Wisconsin": "WI", "Wyoming": "WY",
}


# ---------- TopoJSON decoding ----------
def decode_arcs(topo):
    sx, sy = topo["transform"]["scale"]
    tx, ty = topo["transform"]["translate"]
    arcs = []
    for arc in topo["arcs"]:
        x = y = 0
        pts = []
        for dx, dy in arc:
            x += dx; y += dy
            pts.append((x * sx + tx, y * sy + ty))
        arcs.append(pts)
    return arcs


def ring(arcs, idxs):
    pts = []
    for i in idxs:
        a = arcs[i] if i >= 0 else arcs[~i][::-1]
        pts.extend(a[1:] if pts else a)
    return pts


def polygons(arcs, geom):
    if geom["type"] == "Polygon":
        return [[ring(arcs, r) for r in geom["arcs"]]]
    if geom["type"] == "MultiPolygon":
        return [[ring(arcs, r) for r in poly] for poly in geom["arcs"]]
    return []


def svg_path(polys):
    out = []
    for poly in polys:
        for r in poly:
            out.append("M" + "L".join(f"{x:.1f},{y:.1f}" for x, y in r) + "Z")
    return re.sub(r"\.0(?=[,LZ])", "", "".join(out))


def area_centroid(r):
    a = cx = cy = 0.0
    for (x0, y0), (x1, y1) in zip(r, r[1:] + r[:1]):
        f = x0 * y1 - x1 * y0
        a += f; cx += (x0 + x1) * f; cy += (y0 + y1) * f
    return (abs(a) / 2, (cx / (3 * a), cy / (3 * a)) if a else r[0])


def inside(pt, polys):
    x, y = pt
    for poly in polys:
        hit = False
        for r in poly:
            for (x0, y0), (x1, y1) in zip(r, r[1:] + r[:1]):
                if (y0 > y) != (y1 > y) and x < (x1 - x0) * (y - y0) / (y1 - y0) + x0:
                    hit = not hit
        if hit:
            return True
    return False


# ---------- Albers USA (same parameters as d3.geoAlbersUsa / us-atlas) ----------
def conic_equal_area(parallels, rotate, center, k, translate):
    p0, p1 = (math.radians(v) for v in parallels)
    n = (math.sin(p0) + math.sin(p1)) / 2
    c = 1 + math.sin(p0) * (2 * n - math.sin(p0))
    r0 = math.sqrt(c) / n

    def raw(lam, phi):
        r = math.sqrt(max(c - 2 * n * math.sin(phi), 0)) / n
        return r * math.sin(lam * n), r0 - r * math.cos(lam * n)

    cx, cy = raw(math.radians(center[0]), math.radians(center[1]))

    def project(lon, lat):
        lam = math.radians(lon + rotate)
        lam = (lam + math.pi) % (2 * math.pi) - math.pi
        x, y = raw(lam, math.radians(lat))
        return translate[0] + k * (x - cx), translate[1] - k * (y - cy)
    return project


def albers_usa(k=1300, t=(487.5, 305)):
    lower48 = conic_equal_area((29.5, 45.5), 96, (-0.6, 38.7), k, t)
    alaska = conic_equal_area((55, 65), 154, (-2, 58.5), 0.35 * k, (t[0] - 0.307 * k, t[1] + 0.201 * k))
    hawaii = conic_equal_area((8, 18), 157, (-3, 19.9), k, (t[0] - 0.205 * k, t[1] + 0.212 * k))

    def project(lon, lat):
        if lat > 50 and lon < -129:
            return alaska(lon, lat)
        if lat < 23 and lon < -154:
            return hawaii(lon, lat)
        return lower48(lon, lat)
    return project


def main():
    topo = json.loads((ROOT / "Data/geo/states-albers-10m.json").read_text())
    arcs = decode_arcs(topo)
    states, shapes = [], {}
    for g in topo["objects"]["states"]["geometries"]:
        postal = NAME_TO_POSTAL.get(g["properties"]["name"])
        if not postal:
            continue
        polys = polygons(arcs, g)
        shapes[postal] = polys
        _, (cx, cy) = max((area_centroid(p[0]) for p in polys), key=lambda a: a[0])
        states.append({"postal": postal, "name": g["properties"]["name"], "d": svg_path(polys), "c": [round(cx), round(cy)]})

    js = (ROOT / "assets/data/health.data.js").read_text()
    data = json.loads(re.search(r"window\.HEALTH_DATA = (\{.*\});", js, re.S).group(1))
    proj = albers_usa()
    metros, outside = [], []
    for m in data["metros"]:
        x, y = proj(m["lng"], m["lat"])
        metros.append([round(x, 1), round(y, 1)])
        if m["postal"] in shapes and not inside((x, y), shapes[m["postal"]]):
            outside.append(m["name"])

    out = {"viewBox": "0 0 975 610", "states": states, "metros": metros}
    path = ROOT / "assets/data/usmap.data.js"
    path.write_text("/* Generated by tools/build_map.py from us-atlas (US Census) shapes — do not edit by hand. */\n"
                    f"window.US_MAP = {json.dumps(out, separators=(',', ':'))};\n")
    print(f"{path.relative_to(ROOT)}  {len(states)} states  {len(metros)} metros  {path.stat().st_size // 1024} KB")
    # Metros near a coastline or border can sit just outside a simplified outline; list them for review.
    print(f"metro points outside their state's outline: {len(outside)}", outside[:12])


if __name__ == "__main__":
    main()
