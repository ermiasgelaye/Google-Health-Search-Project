"""Optional local/legacy server for Google Health Search Trends.

The site is fully static (index.html, data.html, assets/, static/data/) and is hosted on GitHub
Pages with no server. This tiny Flask app only exists so you can run it locally and so the old
Flask URLs (/searchbyyear, /dashboards/main, ...) keep working on any other host. No database.

    python3 app.py        # then open http://localhost:5000
"""
import os
import pathlib

from flask import Flask, abort, redirect, send_from_directory

ROOT = pathlib.Path(__file__).resolve().parent
DATA = ROOT / "static" / "data"
WEB_TYPES = {".html", ".js", ".css", ".json", ".csv", ".png", ".jpg", ".jpeg", ".gif", ".svg", ".webp", ".ico"}
DASHBOARDS = {"main": "/analytics.html", "comparison": "/comparison.html", "about": "/#team"}

app = Flask(__name__, static_folder=None)


@app.route("/")
@app.route("/Home")
def index():
    return send_from_directory(ROOT, "index.html")


@app.route("/dashboards/<name>")
def dashboard(name):
    return redirect(DASHBOARDS.get(name, "/"))


@app.route("/<path:path>")
def files(path):
    """Site files, plus the old API URLs (e.g. /searchbyyear -> static/data/searchbyyear.json)."""
    if "/" not in path and (DATA / f"{path}.json").is_file():
        return send_from_directory(DATA, f"{path}.json", mimetype="application/json")
    target = (ROOT / path).resolve()
    if ROOT in target.parents and target.is_file() and target.suffix.lower() in WEB_TYPES:
        return send_from_directory(ROOT, path)
    abort(404)


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.environ.get("PORT", 5000)), debug=False)
