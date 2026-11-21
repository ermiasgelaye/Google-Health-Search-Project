#!/usr/bin/env python3
"""Statistical analysis behind the Analytics page: assets/data/analysis.data.js.

1. Validation — does search interest reflect where conditions actually occur?
   State search interest (2011–2017, the BRFSS years) vs CDC BRFSS adult prevalence of the same condition.
   Pearson r with 95% CI (Fisher z), p-value, Spearman rho, and a partial correlation that controls for
   each state's overall health-search intensity (PC1 below), so a state that searches more for *everything*
   doesn't create a spurious match.
2. Structure — principal component analysis of metro areas' 9-condition profiles (z-scored 2004–2017
   averages), with k-means silhouette scores to check whether metros form distinct clusters.
3. Stability — Spearman rank correlation of each metro's interest in 2008–10 vs 2015–17.

Google Trends zeros mean "not enough data" and are treated as missing throughout.
Run after tools/build_static.py:   python3 tools/analyze.py
"""
import json
import pathlib
import re
import warnings

import numpy as np
import pandas as pd
from scipy import stats
from sklearn.cluster import KMeans
from sklearn.decomposition import PCA
from sklearn.metrics import silhouette_score

ROOT = pathlib.Path(__file__).resolve().parent.parent
VALIDATE = {  # search condition -> BRFSS measure
    "diabetes": ("diabetes", "Diagnosed diabetes"),
    "depression": ("depression", "Diagnosed depressive disorder"),
    "Cancer": ("cancer", "Cancer (other than skin)"),
    "cardiovascular": ("coronary_heart_disease", "Coronary heart disease or heart attack"),
    "stroke": ("stroke", "Stroke"),
    "vaccine": ("flu_vaccination_65plus", "Flu shot in past year (age 65+)"),
    "obesity": ("obesity", "Obesity (BMI ≥ 30)"),
}


def r_ci(r, n):
    z, se = np.arctanh(r), 1 / np.sqrt(n - 3)
    return float(np.tanh(z - 1.96 * se)), float(np.tanh(z + 1.96 * se))


def partial_r(x, y, z):
    """Correlation of x and y after removing the linear effect of z from both."""
    A = np.column_stack([np.ones(len(z)), np.asarray(z, float)])
    resid = lambda v: v - A @ np.linalg.lstsq(A, v, rcond=None)[0]
    rx, ry = resid(np.asarray(x, float)), resid(np.asarray(y, float))
    r, p = stats.pearsonr(rx, ry)
    return float(r), float(p)


def main():
    D = json.loads(re.search(r"window\.HEALTH_DATA = (\{.*\});", (ROOT / "assets/data/health.data.js").read_text(), re.S).group(1))
    C, Y = D["conditions"], D["years"]
    V = np.array(D["values"], float)
    V[V == 0] = np.nan
    postal = np.array([m["postal"] for m in D["metros"]])

    def metro_mean(years, min_years):
        idx = [Y.index(y) for y in years]
        sub = V[:, idx, :]
        with warnings.catch_warnings():
            warnings.simplefilter("ignore", RuntimeWarning)  # all-missing cells -> NaN, handled below
            m = np.nanmean(sub, axis=1)
        m[np.sum(~np.isnan(sub), axis=1) < min_years] = np.nan
        return m

    # ---------- Structure (PCA) on 2004–2017 metro profiles ----------
    mm = metro_mean(Y, 7)
    ok = ~np.isnan(mm).any(axis=1)
    Z = (mm[ok] - mm[ok].mean(0)) / mm[ok].std(0)
    pca = PCA().fit(Z)
    scores = np.full((len(V), 2), np.nan)
    scores[ok] = pca.transform(Z)[:, :2]
    # orient components so that higher = more interest (PC1) / more southern (PC2)
    if pca.components_[0].sum() < 0:
        scores[:, 0] *= -1; pca.components_[0] *= -1
    lat = np.array([m["lat"] for m in D["metros"]])
    if stats.pearsonr(scores[ok, 1], lat[ok])[0] > 0:
        scores[:, 1] *= -1; pca.components_[1] *= -1
    sil = {k: float(silhouette_score(Z, KMeans(k, n_init=20, random_state=0).fit(Z).labels_)) for k in range(2, 7)}
    pcs = {
        "explained": [round(float(v), 4) for v in pca.explained_variance_ratio_],
        "loadings": [[round(float(v), 3) for v in pca.components_[i]] for i in range(2)],
        "scores": [[None if np.isnan(v) else round(float(v), 3) for v in s] for s in scores],
        "latR": [round(float(stats.pearsonr(scores[ok, i], lat[ok])[0]), 3) for i in range(2)],
        "n": int(ok.sum()),
        "silhouette": {str(k): round(v, 3) for k, v in sil.items()},
    }

    # ---------- Validation against CDC BRFSS ----------
    b = pd.read_csv(ROOT / "Data/external/brfss_state_prevalence_2011_2017.csv")
    prev = b.groupby(["state", "measure"]).prevalence_pct.mean().unstack()
    prevp = prev.add_prefix("prev_")  # avoid name clashes with search columns (e.g. "diabetes")
    m11 = metro_mean(range(2011, 2018), 4)
    search = pd.DataFrame(m11, columns=C).assign(postal=postal).groupby("postal").mean()
    pc1 = pd.Series(scores[:, 0], index=postal).groupby(level=0).mean()
    rows, points = [], {}
    for c, (meas, label) in VALIDATE.items():
        pm = f"prev_{meas}"
        j = pd.concat([search[c], prevp[pm], pc1.rename("pc1")], axis=1, join="inner").dropna()
        r, p = stats.pearsonr(j[c], j[pm])
        rho, _ = stats.spearmanr(j[c], j[pm])
        pr, pp = partial_r(j[c].values, j[pm].values, j["pc1"].values)
        lo, hi = r_ci(r, len(j))
        rows.append({"condition": c, "measure": meas, "label": label, "n": len(j), "r": round(float(r), 3), "lo": round(lo, 3), "hi": round(hi, 3),
                     "p": float(p), "rho": round(float(rho), 3), "partial": round(pr, 3), "partialP": pp,
                     "years": f"{int(b[b.measure == meas].year.min())}–{int(b[b.measure == meas].year.max())}"})
        points[c] = [[st, round(float(j.loc[st, c]), 1), round(float(j.loc[st, pm]), 2)] for st in j.index]
    # Overall: state health-search intensity (PC1) vs a composite disease burden (mean z-score of six conditions)
    six = ["diabetes", "depression", "cancer", "coronary_heart_disease", "stroke", "obesity"]
    burden = ((prev[six] - prev[six].mean()) / prev[six].std()).mean(axis=1)
    jb = pd.concat([pc1.rename("pc1"), burden.rename("burden")], axis=1, join="inner").dropna()
    br, bp = stats.pearsonr(jb.pc1, jb.burden)
    overall = {"r": round(float(br), 3), "p": float(bp), "n": len(jb), "lo": round(r_ci(br, len(jb))[0], 3), "hi": round(r_ci(br, len(jb))[1], 3),
               "points": [[st, round(float(jb.loc[st, "pc1"]), 2), round(float(jb.loc[st, "burden"]), 2)] for st in jb.index]}
    meas_order = [VALIDATE[c][0] for c in VALIDATE]
    allj = search.join(prevp, how="inner")
    matrix = [[round(float(stats.pearsonr(*allj[[c, f"prev_{m}"]].dropna().values.T)[0]), 2) for m in meas_order] for c in C]

    # ---------- Stability ----------
    early, late = metro_mean(range(2008, 2011), 2), metro_mean(range(2015, 2018), 2)
    stab = []
    for ci, c in enumerate(C):
        s = ~np.isnan(early[:, ci]) & ~np.isnan(late[:, ci])
        stab.append(round(float(stats.spearmanr(early[s, ci], late[s, ci])[0]), 3))

    out = {"overall": overall, "validation": rows, "points": points, "matrix": {"conditions": C, "measures": meas_order,
           "labels": [VALIDATE[c][1] for c in VALIDATE], "r": matrix}, "pca": pcs, "stability": stab,
           "brfss": {st: {m: round(float(v), 2) for m, v in prev.loc[st].dropna().items()} for st in prev.index}}
    path = ROOT / "assets/data/analysis.data.js"
    path.write_text("/* Generated by tools/analyze.py — do not edit by hand. */\n"
                    f"window.HEALTH_ANALYSIS = {json.dumps(out, separators=(',', ':'))};\n")
    print(f"{path.relative_to(ROOT)}  {path.stat().st_size // 1024} KB")
    for r in rows:
        print(f"  {r['condition']:15s} n={r['n']} r={r['r']:+.2f} [{r['lo']:+.2f},{r['hi']:+.2f}] p={r['p']:.4f} | partial r={r['partial']:+.2f} p={r['partialP']:.3f}")
    print(f"  overall intensity vs burden r={overall['r']} p={overall['p']:.5f}")
    print("  PCA explained:", pcs["explained"][:3], "lat r:", pcs["latR"], "silhouette:", pcs["silhouette"])
    print("  stability:", dict(zip(C, stab)))


if __name__ == "__main__":
    main()
