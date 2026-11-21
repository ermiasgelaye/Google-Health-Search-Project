"""Optional local/legacy server for Eagle Health Analytics.

The site is fully static: data endpoints are pre-built JSON files in static/data/ (see
tools/build_static.py) and the chat assistant runs in the browser (static/js/chat-engine.js).
GitHub Pages hosts it with no server at all. This tiny Flask app only exists so the old URLs
(/searchbyyear, /dashboards/main, ...) keep working if you run it locally or on another host.
It needs no database.

    python3 app.py        # then open http://localhost:5000
"""
import os
import pathlib

from flask import Flask, abort, redirect, send_from_directory

ROOT = pathlib.Path(__file__).resolve().parent
DATA = ROOT / "static" / "data"

app = Flask(__name__, static_folder="static")


@app.route("/")
@app.route("/Home")
def index():
    return send_from_directory(ROOT, "index.html")


@app.route("/dashboards/<name>")
def dashboard(name):
    return redirect(f"/static/dashbords/{name}.html")


@app.route("/<endpoint>")
def data_endpoint(endpoint):
    """Old API URLs, e.g. /searchbyyear -> static/data/searchbyyear.json."""
    if not (DATA / f"{endpoint}.json").is_file():
        abort(404)
    return send_from_directory(DATA, f"{endpoint}.json", mimetype="application/json")


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.environ.get("PORT", 5000)), debug=False)
