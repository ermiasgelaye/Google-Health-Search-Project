/* Eagle Health Analytics — every statistic, chart and map on the site, computed from the data in
 * assets/data/health.data.js (search interest + CDC) and assets/data/usmap.data.js (US Census map shapes).
 * Both are plain scripts loaded with the page, so the data always loads — even opened from disk.
 *
 * How to read Google Trends scores (shapes every calculation):
 *   Google scales each year × condition separately — the metro area with the highest share of searches
 *   on that topic scores 100. Scores compare *places* within one condition and year. A 0 means
 *   "not enough data". The original analyses (totals by year, by condition, by state) are kept below with
 *   notes explaining what they can and can't show. */
'use strict';

const Health = (() => {
    const LABELS = { Cancer: 'Cancer', cardiovascular: 'Cardiovascular', stroke: 'Stroke', depression: 'Depression', rehab: 'Rehab',
        vaccine: 'Vaccine', diarrhea: 'Diarrhea', obesity: 'Obesity', diabetes: 'Diabetes' };
    const ICONS = { all: 'layer-group', Cancer: 'ribbon', cardiovascular: 'heart-pulse', stroke: 'brain', depression: 'cloud-rain', rehab: 'person-walking',
        vaccine: 'syringe', diarrhea: 'bacteria', obesity: 'weight-scale', diabetes: 'droplet' };
    const COND_COLORS = { Cancer: '#0a6cff', cardiovascular: '#dc2626', stroke: '#7c3aed', depression: '#0891b2', rehab: '#f59e0b',
        vaccine: '#16a34a', diarrhea: '#a16207', obesity: '#db2777', diabetes: '#475569' };
    const CAUSE_LABELS = { Diseases_of_heart: 'Heart disease', Malignant_neoplasms: 'Cancer', Accidents: 'Accidents (unintentional injuries)',
        Respiratory: 'Chronic lower respiratory disease', Cerebrovascular: 'Stroke', Alzheimer: "Alzheimer's disease", Diabetes: 'Diabetes',
        Influenza_and_pneumonia: 'Influenza & pneumonia', Nephrosis: 'Kidney disease', Suicide: 'Suicide' };
    const CAUSE_COLORS = ['#dc2626', '#0a6cff', '#f59e0b', '#64748b', '#7c3aed', '#db2777', '#16a34a', '#0891b2', '#a16207', '#111827'];
    const STATE_NAMES = { AL: 'Alabama', AK: 'Alaska', AZ: 'Arizona', AR: 'Arkansas', CA: 'California', CO: 'Colorado', CT: 'Connecticut', DC: 'District of Columbia',
        DE: 'Delaware', FL: 'Florida', GA: 'Georgia', HI: 'Hawaii', ID: 'Idaho', IL: 'Illinois', IN: 'Indiana', IA: 'Iowa', KS: 'Kansas', KY: 'Kentucky',
        LA: 'Louisiana', ME: 'Maine', MD: 'Maryland', MA: 'Massachusetts', MI: 'Michigan', MN: 'Minnesota', MS: 'Mississippi', MO: 'Missouri', MT: 'Montana',
        NE: 'Nebraska', NV: 'Nevada', NH: 'New Hampshire', NJ: 'New Jersey', NM: 'New Mexico', NY: 'New York', NC: 'North Carolina', ND: 'North Dakota',
        OH: 'Ohio', OK: 'Oklahoma', OR: 'Oregon', PA: 'Pennsylvania', RI: 'Rhode Island', SC: 'South Carolina', SD: 'South Dakota', TN: 'Tennessee',
        TX: 'Texas', UT: 'Utah', VT: 'Vermont', VA: 'Virginia', WA: 'Washington', WV: 'West Virginia', WI: 'Wisconsin', WY: 'Wyoming' };
    const ENDPOINTS = [
        ['searchbyyear', 'Total search score by year', 'Sum of all nine conditions per year (original analysis).'],
        ['searchyearandcondition', 'Search score by year and condition', 'Sum per condition per year.'],
        ['searchbystate', 'Total search score by state', 'Sum of all conditions and years per state.'],
        ['searchbycity', 'Total search score by metro area', 'Sum per metro area, with coordinates.'],
        ['bystateandyear', 'Search score by state and year', 'Sum per state, metro and year.'],
        ['casesleadingdeath', 'CDC leading causes of death', 'Age-adjusted deaths per 100,000 by year, 2004–2017.'],
        ['allsearchrecord', 'All search records', 'Every metro area × year with all nine condition scores.'],
        ['location', 'Metro areas', 'Name, state and corrected coordinates of the 210 DMAs.'],
        ['conditions', 'Search conditions table', 'The raw search_condition table.'],
        ['mostsserached', 'Top ten states by condition', 'States with the highest summed scores per condition.'],
        ['totalcondition', 'Total by condition', 'Sum of each condition across all metros and years.'],
        ['totaldeathcase', 'Total CDC death rates', 'Sum of each cause of death over 2004–2017.']
    ];

    const ALL = -1; // "all conditions" selection
    const esc = (s) => ARC.util.escapeHtml(s);
    const mean = (a) => (a.length ? a.reduce((s, v) => s + v, 0) / a.length : NaN);
    const sum = (a) => a.reduce((s, v) => s + v, 0);
    const pct = (v) => `${v >= 0 ? '+' : '−'}${Math.abs(v).toFixed(1)}%`;
    const label = (c) => (c === 'all' ? 'All conditions' : LABELS[c] || c);
    const nn = (a) => a.filter((v) => v != null);
    function pearson(xs, ys) {
        const n = xs.length, mx = mean(xs), my = mean(ys);
        let sxy = 0, sxx = 0, syy = 0;
        for (let i = 0; i < n; i++) { const a = xs[i] - mx, b = ys[i] - my; sxy += a * b; sxx += a * a; syy += b * b; }
        return sxx && syy ? sxy / Math.sqrt(sxx * syy) : 0;
    }

    /* ---------- Model ---------- */
    let cache = null;
    function load() {
        if (cache) return cache;
        const D = window.HEALTH_DATA;
        if (!D) throw new Error('Data not loaded');
        const C = D.conditions, Y = D.years, V = D.values;
        // Zeros are Google's "not enough data": excluded from averages and correlations. A metro's average for a
        // condition needs data in at least half the years.
        const MIN_YEARS = Math.ceil(Y.length / 2);
        const metroMean = V.map((ys) => C.map((_, ci) => { const xs = ys.map((v) => v[ci]).filter((v) => v > 0); return xs.length >= MIN_YEARS ? mean(xs) : null; }));
        const metrosByState = {};
        D.metros.forEach((m, i) => { (metrosByState[m.postal] = metrosByState[m.postal] || []).push(i); });
        const states = Object.keys(metrosByState).sort((a, b) => STATE_NAMES[a].localeCompare(STATE_NAMES[b]));
        const one = (i, ci, yi) => (yi == null ? metroMean[i][ci] : (V[i][yi][ci] > 0 ? V[i][yi][ci] : null));
        // ci === ALL: average of the metro's relative scores across conditions (each is 0–100 within its condition)
        const metroScore = (i, ci, yi) => {
            if (ci !== ALL) return one(i, ci, yi);
            const xs = nn(C.map((_, k) => one(i, k, yi)));
            return xs.length >= 5 ? mean(xs) : null;
        };
        const stateScore = (st, ci, yi) => { const xs = nn(metrosByState[st].map((i) => metroScore(i, ci, yi))); return xs.length ? mean(xs) : null; };
        const national = C.map((_, ci) => mean(nn(D.metros.map((_, i) => metroMean[i][ci]))));
        const sparse = D.metros.filter((_, i) => metroMean[i].filter((v) => v == null).length > C.length / 2).map((m) => m.name);
        const complete = D.metros.map((_, i) => i).filter((i) => metroMean[i].every((v) => v != null));
        const corrOf = (rows, a, b) => { const xs = [], ys = []; rows.forEach((r) => { if (r[a] != null && r[b] != null) { xs.push(r[a]); ys.push(r[b]); } }); return pearson(xs, ys); };
        const corr = C.map((_, a) => C.map((_, b) => corrOf(metroMean, a, b)));
        const pairs = [];
        C.forEach((_, a) => C.forEach((_, b) => { if (a < b) pairs.push({ a, b, r: corr[a][b] }); }));
        pairs.sort((x, y) => y.r - x.r);

        // Summed scores per state: only used to explain the original dashboard's state ranking.
        const stateTotal = Object.fromEntries(states.map((st) => [st, sum(metrosByState[st].map((i) => sum(V[i].map((ys) => sum(ys)))))]));
        const zeros = Y.map((_, yi) => V.reduce((s, ys) => s + ys[yi].filter((v) => v === 0).length, 0));
        const medians = Y.map((_, yi) => { const all = V.flatMap((ys) => ys[yi]).sort((a, b) => a - b); return all[Math.floor(all.length / 2)]; });

        const cdcYears = D.cdc.years;
        const cdc = Object.entries(D.cdc.causes).map(([k, v]) => ({ key: k, label: CAUSE_LABELS[k] || k, values: v, first: v[0], last: v[v.length - 1], total: sum(v), change: ((v[v.length - 1] - v[0]) / v[0]) * 100 }));

        cache = { D, C, Y, V, metroMean, metrosByState, states, metroScore, stateScore, national, corr, pairs, sparse, complete, MIN_YEARS,
            stateTotal, zeros, medians, cdc, cdcYears };
        return cache;
    }

    /* ---------- Shared UI ---------- */
    const failAll = (msg) => document.querySelectorAll('[data-needs-data]').forEach((e) => { e.innerHTML = `<div class="alert err">${msg || 'The dataset couldn\'t be loaded — please refresh the page.'}</div>`; });
    const shade = (t) => `color-mix(in srgb, var(--brand) ${Math.round(10 + t * 90)}%, var(--surface))`;
    const divColor = (v, m) => `color-mix(in srgb, ${v >= 0 ? '#ea580c' : 'var(--brand)'} ${Math.round(8 + (Math.min(1, Math.abs(v) / (m || 1))) * 80)}%, var(--surface))`;
    const heatColor = (r) => `color-mix(in srgb, var(${r >= 0 ? '--brand' : '--danger'}) ${Math.round(Math.abs(r) * 85)}%, var(--surface))`;
    function chips(box, items, current, onPick) {
        if (!box) return;
        box.innerHTML = items.map(([k, text, icon]) => `<button type="button" class="chip" data-k="${esc(k)}" aria-pressed="${k === current}">${icon ? `<i class="fas fa-${icon}" aria-hidden="true"></i> ` : ''}${esc(text)}</button>`).join('');
        box.addEventListener('click', (e) => {
            const b = e.target.closest('[data-k]'); if (!b) return;
            box.querySelectorAll('[data-k]').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
            onPick(b.dataset.k);
        });
    }
    const charts = {};
    const draw = (id, cfg) => { const cv = document.getElementById(id); if (!cv || !window.Chart) return; charts[id]?.destroy(); charts[id] = new Chart(cv, cfg); };
    const axis = (c, title) => ({ title: { display: !!title, text: title, color: c.ink3 }, grid: { color: c.border }, ticks: { color: c.ink3 } });
    const legend = (c, pos = 'top') => ({ position: pos, labels: { color: c.ink2, usePointStyle: true, boxWidth: 8 } });
    const setText = (id, html) => { const e = document.getElementById(id); if (e) e.innerHTML = html; };

    /** Chart.js from cdnjs (as on the portfolio), falling back to jsDelivr if that CDN is unreachable. */
    async function ensureChart() {
        if (window.Chart) return window.Chart;
        try { return await ARC.loadChartJs(); } catch { /* try the fallback CDN */ }
        return new Promise((resolve, reject) => {
            const s = Object.assign(document.createElement('script'), { src: 'https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js', crossOrigin: 'anonymous' });
            s.onload = () => resolve(window.Chart); s.onerror = () => reject(new Error('Chart.js unavailable'));
            document.head.appendChild(s);
        });
    }
    async function withCharts(redraw) {
        try { await ensureChart(); } catch {
            document.querySelectorAll('.chart-box').forEach((b) => { b.innerHTML = '<div class="alert err">The chart library couldn\'t load (check your connection). Maps, tables and figures still work.</div>'; });
            return;
        }
        document.addEventListener('themechange', redraw);
        redraw();
    }

    /** Legend explaining the metro bubbles: three reference sizes drawn at the map's display scale. */
    function bubbleLegend(lo, hi, f) {
        const s = 0.66; // map units -> approximate on-screen pixels at typical width
        const R = (v) => (3.5 + Math.sqrt((v - lo) / (hi - lo || 1)) * 9.5) * s;
        const vals = [lo, (lo + hi) / 2, hi];
        const lab = (v) => (f ? f(v) : Math.round(v));
        return `<div class="bubble-legend"><span><strong>Bubbles</strong> = Google metro areas at their real location; size = score</span>${vals.map((v) => `<span class="bl-item"><svg width="${Math.ceil(R(hi) * 2 + 2)}" height="${Math.ceil(R(hi) * 2 + 2)}" aria-hidden="true"><circle cx="${R(hi) + 1}" cy="${R(hi) + 1}" r="${R(v).toFixed(1)}"/></svg>${esc(String(lab(v)))}</span>`).join('')}</div>`;
    }

    /* ---------- Real US map (US Census shapes, Albers USA, pre-projected by tools/build_map.py) ---------- */
    function renderMap(box, opts) {
        const U = window.US_MAP;
        if (!box) return;
        if (!U) { box.innerHTML = '<div class="alert err">The map couldn\'t be loaded — please refresh the page.</div>'; return; }
        const M = load();
        const vals = opts.values || {};
        const vs = nn(Object.values(vals)), lo = Math.min(...vs), hi = Math.max(...vs);
        const t = (v) => (hi > lo ? (v - lo) / (hi - lo) : 0.5);
        const id = box.id || 'map';
        const mv = opts.metros || null;
        const mvs = mv ? nn(mv.map((m) => m.v)) : [];
        const mlo = Math.min(...mvs), mhi = Math.max(...mvs);
        const states = U.states.map((s) => {
            const v = vals[s.postal];
            const name = STATE_NAMES[s.postal];
            const has = M.metrosByState[s.postal];
            const tip = v == null ? `${name}: ${has ? 'not enough data' : 'no metro area of its own'}` : `${name}${opts.fmt ? (opts.fmt(v) ? `: ${opts.fmt(v)}` : '') : `: ${v.toFixed(1)}`}`;
            const fill = v == null ? `url(#hatch-${id})` : opts.diverging ? divColor(v, Math.max(Math.abs(lo), Math.abs(hi))) : shade(t(v));
            return `<path d="${s.d}" data-st="${s.postal}" class="st${v == null ? ' nodata' : ''}${opts.selected === s.postal ? ' on' : ''}" style="fill:${fill}"${v == null ? '' : ' tabindex="0" role="button"'} aria-label="${esc(tip)}"><title>${esc(tip)}</title></path>`;
        }).join('');
        // Bubble radius in map units (map is 975 wide): area grows with the value (square-root scale).
        const R_MIN = 3.5, R_MAX = 13;
        const radius = (v) => (mhi > mlo ? R_MIN + Math.sqrt((v - mlo) / (mhi - mlo)) * (R_MAX - R_MIN) : 6);
        const sized = !!mv && !opts.diverging && !opts.fixedSize;
        const order = mv ? [...mv].sort((a, b) => (b.v ?? 0) - (a.v ?? 0)) : []; // big first, so small bubbles stay visible on top
        const metros = mv ? order.map(({ i, v, on, sim }) => {
            const p = U.metros[i]; if (!p || (v == null && !on)) return '';
            const r = on ? 12 : sim ? 8.5 : opts.diverging ? 5.5 : opts.fixedSize ? 4.5 : radius(v);
            const shown = v == null ? '' : (opts.metroFmt ? opts.metroFmt(v) : v.toFixed(0));
            const tip = `${M.D.metros[i].name}${shown ? `: ${shown}` : ''}`;
            const style = opts.diverging && v != null ? ` style="fill:${v >= 0 ? '#ea580c' : '#0a6cff'};fill-opacity:${(0.35 + 0.6 * Math.min(1, Math.abs(v) / 2.5)).toFixed(2)}"` : '';
            return `<circle cx="${p[0]}" cy="${p[1]}" r="${r.toFixed(1)}" data-i="${i}" class="metro${on ? ' on' : ''}${sim ? ' sim' : ''}"${style}><title>${esc(tip)}</title></circle>`;
        }).join('') : '';
        box.innerHTML = `<svg viewBox="${U.viewBox}" class="usmap" role="group" aria-label="${esc(opts.label || 'Map of US states')}">
            <defs><pattern id="hatch-${id}" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="6" height="6" class="hatch-bg"/><line x1="0" y1="0" x2="0" y2="6" class="hatch-line"/></pattern></defs>
            <g>${states}</g><g>${metros}</g></svg>
            <div class="map-tip" hidden></div>${sized && mvs.length ? bubbleLegend(mlo, mhi, opts.metroFmt) : ''}`;
        const tipEl = box.querySelector('.map-tip');
        const svg = box.querySelector('svg');
        svg.addEventListener('mousemove', (e) => {
            const el = e.target.closest('[data-st],[data-i]');
            if (!el) { tipEl.hidden = true; return; }
            tipEl.textContent = el.querySelector('title').textContent;
            const r = box.getBoundingClientRect();
            tipEl.style.left = `${Math.max(0, Math.min(e.clientX - r.left + 12, r.width - 200))}px`;
            tipEl.style.top = `${e.clientY - r.top + 12}px`;
            tipEl.hidden = false;
        });
        svg.addEventListener('mouseleave', () => { tipEl.hidden = true; });
        const pick = (el) => {
            if (!el) return;
            if (el.dataset.i != null && opts.onMetro) opts.onMetro(+el.dataset.i);
            else if (el.dataset.st && !el.classList.contains('nodata') && opts.onState) opts.onState(el.dataset.st);
        };
        svg.addEventListener('click', (e) => pick(e.target.closest('[data-st],[data-i]')));
        svg.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pick(e.target.closest('[data-st]')); } });
        const sc = document.getElementById(`${id}-scale`);
        if (sc) sc.innerHTML = opts.diverging ? '<span>Northern profile</span><span class="scale-bar div"></span><span>Southern profile</span>'
            : `<span>${opts.fmt ? opts.fmt(lo) : lo.toFixed(0)}</span><span class="scale-bar"></span><span>${opts.fmt ? opts.fmt(hi) : hi.toFixed(0)}</span>`;
    }

    /* ======================= Overview ======================= */
    function initOverview() {
        let M;
        try { M = load(); } catch { failAll(); return; }
        const { D, C, Y } = M;
        document.querySelectorAll('[data-kpi="metros"]').forEach((e) => { e.textContent = D.metros.length; });
        document.querySelectorAll('[data-kpi="states"]').forEach((e) => { e.textContent = M.states.length; });
        renderFindings(M);
        setText('zeroNote', `The typical (median) score rose from ${M.medians[0]} in ${Y[0]} to ${M.medians[M.medians.length - 1]} in ${Y[Y.length - 1]}, and zero scores fell from ${M.zeros[0]} to ${M.zeros[M.zeros.length - 1]} — more metro areas crossed Google's minimum-volume threshold, which compresses the scale. That is why summed scores rise over time even if search behaviour didn't change.`);

        const ui = { ci: ALL, yi: null, state: null, rank: 'top', metros: true };
        chips(document.getElementById('condChips'), [['all', 'All conditions', ICONS.all], ...C.map((c) => [c, label(c), ICONS[c]])], 'all', (k) => { ui.ci = k === 'all' ? ALL : C.indexOf(k); render(); });
        const yearSel = document.getElementById('yearSel');
        yearSel.innerHTML = `<option value="">All years (average)</option>${Y.map((y, i) => `<option value="${i}">${y}</option>`).join('')}`;
        yearSel.addEventListener('change', () => { ui.yi = yearSel.value === '' ? null : +yearSel.value; render(); });
        document.getElementById('showMetros').addEventListener('change', (e) => { ui.metros = e.target.checked; render(); });
        document.getElementById('rankToggle').addEventListener('click', (e) => {
            const b = e.target.closest('[data-rank]'); if (!b) return;
            ui.rank = b.dataset.rank;
            e.currentTarget.querySelectorAll('[data-rank]').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
            render();
        });
        const sel = document.getElementById('stateSel');
        sel.innerHTML = M.states.map((st) => `<option value="${st}">${esc(STATE_NAMES[st])}</option>`).join('');
        sel.value = 'MS';
        sel.addEventListener('change', () => { ui.state = sel.value; render(); renderProfile(M, sel.value); });

        function render() {
            const ci = ui.ci, yi = ui.yi, c = ci === ALL ? 'all' : C[ci];
            const vals = Object.fromEntries(M.states.map((st) => [st, M.stateScore(st, ci, yi)]));
            renderMap(document.getElementById('usMap'), {
                values: vals, selected: ui.state, label: `${label(c)} search interest by state`,
                metros: ui.metros ? D.metros.map((_, i) => ({ i, v: M.metroScore(i, ci, yi) })) : null,
                onState: (st) => { ui.state = ui.state === st ? null : st; if (ui.state) { sel.value = st; renderProfile(M, st); } render(); },
                onMetro: (i) => { ui.state = D.metros[i].postal; sel.value = ui.state; renderProfile(M, ui.state); render(); }
            });
            const when = yi == null ? `${Y[0]}–${Y[Y.length - 1]} average` : Y[yi];
            setText('mapTitle', `${esc(label(c))} search interest <small>${esc(when)}</small>`);
            const pool = (ui.state ? M.metrosByState[ui.state] : D.metros.map((_, i) => i)).map((i) => ({ i, v: M.metroScore(i, ci, yi) })).filter((x) => x.v != null);
            pool.sort((a, b) => (ui.rank === 'top' ? b.v - a.v : a.v - b.v));
            setText('rankTitle', `${ui.rank === 'top' ? 'Highest' : 'Lowest'} metro areas <small>${ui.state ? esc(STATE_NAMES[ui.state]) : 'United States'}</small>`);
            setText('rankList', pool.slice(0, 10).map(({ i, v }) => `<li><span class="bar-wrap" style="--w:${Math.max(2, v)}%"><span title="${esc(D.metros[i].name)}">${esc(D.metros[i].name)}</span></span><b>${v.toFixed(0)}</b></li>`).join('') || '<li class="chart-note" style="display:block">Not enough data for this selection.</li>');
            const best = M.states.filter((s) => vals[s] != null).sort((a, b) => vals[b] - vals[a]);
            setText('explorerNote', `Highest state average: <strong>${esc(STATE_NAMES[best[0]])}</strong> (${vals[best[0]].toFixed(1)}); lowest: <strong>${esc(STATE_NAMES[best[best.length - 1]])}</strong> (${vals[best[best.length - 1]].toFixed(1)}). ` +
                (ci === ALL ? 'All conditions = the average of each metro area\'s relative interest across the nine conditions — overall health-search intensity. ' : '') +
                `States are shaded by the average score of their metro areas; dots are the ${D.metros.length} Google metro areas at their real locations (bigger = higher). Click a state or dot to filter the list and open its profile. Hatched: no metro area of its own (NH, NJ, DE) or not enough data.`);
        }
        render();
        withCharts(() => renderProfile(M, sel.value));
        addKnowledge(M);
    }

    function renderFindings(M) {
        const box = document.getElementById('findings'); if (!box) return;
        const { C } = M, AN = A();
        const topState = (ci) => M.states.filter((s) => M.stateScore(s, ci, null) != null).sort((a, b) => M.stateScore(b, ci, null) - M.stateScore(a, ci, null));
        const names = (list) => list.map((s) => STATE_NAMES[s]).join(', ');
        const d = topState(C.indexOf('diabetes')), de = topState(C.indexOf('depression'));
        const s = [...M.cdc].sort((a, b) => b.change - a.change);
        const items = [];
        if (AN) {
            const v = Object.fromEntries(AN.validation.map((x) => [x.condition, x]));
            items.push(['stethoscope', `Search interest tracks real disease burden (r = ${AN.overall.r.toFixed(2)} across ${AN.overall.n} states)`,
                `States that search more about health also have more diabetes, depression, cancer and heart disease in CDC surveys (condition matches r = ${v.cardiovascular.r.toFixed(2)}–${v.Cancer.r.toFixed(2)}). Much of the match is general rather than condition-specific.`]);
            items.push(['weight-scale', 'Obesity is the exception: the heaviest states search relatively less about it',
                `Obesity searches don't track obesity prevalence (r = ${v.obesity.r.toFixed(2)}; r = ${v.obesity.partial.toFixed(2)} after controlling for overall search intensity). People search the consequences — diabetes and diarrhea searches track obesity better.`]);
            items.push(['compass', `A north–south divide explains ${(AN.pca.explained[1] * 100).toFixed(0)}% of the variation`,
                `Southern metros lean toward rehab, heart and diarrhea searches; northern ones toward depression, vaccine and obesity (correlation with latitude r = ${AN.pca.latR[1].toFixed(2)}).`]);
        }
        let diaNote = '';
        if (AN) { // where do the top diabetes-search states rank for diagnosed diabetes in CDC surveys?
            const ranked = Object.entries(AN.brfss).filter(([s, v]) => STATE_NAMES[s] && v.diabetes != null).sort((a, b) => b[1].diabetes - a[1].diabetes).map(([s]) => s);
            diaNote = `In CDC surveys they rank ${d.slice(0, 3).map((s) => `#${ranked.indexOf(s) + 1}`).join(', ')} of ${ranked.length} for diagnosed diabetes. `;
        }
        items.push(['droplet', `Diabetes interest peaks in ${names(d.slice(0, 3))}; depression in ${names(de.slice(0, 3))}`, `${diaNote}The depression leaders are all northern states with long winters.`]);
        items.push(['file-medical', `Heart-disease deaths fell ${Math.abs(M.cdc[0].change).toFixed(0)}% and cancer deaths ${Math.abs(M.cdc[1].change).toFixed(0)}% from 2004 to 2017`, `Rising: ${s.slice(0, 3).map((x) => `${x.label} ${pct(x.change)}`).join(', ')}.`]);
        box.innerHTML = items.map(([i, h, p]) => `<li class="card"><i class="fas fa-${i}" aria-hidden="true"></i><div><strong>${esc(h)}</strong><p>${esc(p)}</p></div></li>`).join('');
    }

    function renderProfile(M, st) {
        if (!document.getElementById('profileChart')) return;
        const { C, D } = M;
        const vals = C.map((_, ci) => M.stateScore(st, ci, null));
        const diff = vals.map((v, ci) => ({ c: C[ci], d: v == null ? 0 : v - M.national[ci] }));
        const above = diff.filter((x) => x.d > 3).sort((a, b) => b.d - a.d), below = diff.filter((x) => x.d < -3).sort((a, b) => a.d - b.d);
        const metros = M.metrosByState[st].map((i) => D.metros[i].name);
        setText('profileNote', `<strong>${esc(STATE_NAMES[st])}</strong> (${metros.length} metro area${metros.length > 1 ? 's' : ''}: ${esc(metros.join('; '))}). ` +
            (above.length ? `Above the national average for <strong>${esc(above.map((x) => label(x.c)).join(', '))}</strong>. ` : '') +
            (below.length ? `Below average for <strong>${esc(below.map((x) => label(x.c)).join(', '))}</strong>.` : '') + (!above.length && !below.length ? 'Close to the national average for every condition.' : ''));
        const c = ARC.themeColors();
        draw('profileChart', { type: 'bar',
            data: { labels: C.map(label), datasets: [{ label: STATE_NAMES[st], data: vals, backgroundColor: '#0a6cff', borderRadius: 6 }, { label: 'All metro areas', data: M.national, backgroundColor: 'rgba(124,58,237,.35)', borderRadius: 6 }] },
            options: { responsive: true, maintainAspectRatio: false, animation: { duration: 300 }, plugins: { legend: legend(c), tooltip: { callbacks: { label: (x) => `${x.dataset.label}: ${x.raw == null ? 'n/a' : x.raw.toFixed(1)}` } } },
                scales: { x: { ...axis(c), grid: { display: false } }, y: { ...axis(c, 'Average interest (0–100)'), min: 0, max: 100 } } } });
    }

    /* ======================= Analytics ======================= */
    const A = () => window.HEALTH_ANALYSIS;
    const fmtP = (p) => (p < 0.001 ? '< 0.001' : p.toFixed(3));
    const verdict = (r, p) => (p >= 0.05 ? ['none', 'Not significant'] : Math.abs(r) >= 0.5 ? ['strong', 'Strong'] : Math.abs(r) >= 0.3 ? ['moderate', 'Moderate'] : ['weak', 'Weak']);
    const SHORT_MEASURE = { diabetes: 'Diabetes', depression: 'Depression', cancer: 'Cancer', coronary_heart_disease: 'Heart disease', stroke: 'Stroke', flu_vaccination_65plus: 'Flu shot (65+)', obesity: 'Obesity' };
    const SOUTH = '#ea580c'; // PC2 > 0 colour (southern profile); brand blue = northern profile

    function initAnalytics() {
        let M;
        try { M = load(); } catch { failAll(); return; }
        const AN = A();
        if (!AN) { failAll('The analysis results couldn\'t be loaded — please refresh the page.'); return; }
        const { C, D } = M;

        // ---- 1. Validation table + overall card ----
        const o = AN.overall;
        setText('overallStat', `<strong>r = ${o.r.toFixed(2)}</strong> (95% CI ${o.lo.toFixed(2)} to ${o.hi.toFixed(2)}, p ${fmtP(o.p)}, ${o.n} states)`);
        const vt = document.getElementById('validTable');
        if (vt) vt.innerHTML = AN.validation.map((v) => {
            const [cls, lab] = verdict(v.r, v.p), [pc, pl] = verdict(v.partial, v.partialP);
            return `<tr><th scope="row">${esc(label(v.condition))}</th><td>${esc(v.label)} <small>(${v.years})</small></td><td class="num">${v.r.toFixed(2)} <small>[${v.lo.toFixed(2)}, ${v.hi.toFixed(2)}]</small></td><td class="num">${fmtP(v.p)}</td><td><span class="strength ${cls}">${lab}</span></td><td class="num">${v.partial.toFixed(2)}</td><td><span class="strength ${pc}">${v.partial < 0 && v.partialP < 0.05 ? 'Negative' : pl}</span></td></tr>`;
        }).join('');
        const vs = [...AN.validation].sort((a, b) => b.r - a.r);
        const sig = vs.filter((v) => v.p < 0.05).map((v) => label(v.condition));
        const ob = AN.validation.find((v) => v.condition === 'obesity');
        const keepV = AN.validation.filter((v) => v.partial > 0.2);
        const keep = keepV.map((v) => label(v.condition));
        const keepTxt = keepV.length ? `${esc(keep.join(' and '))} keep a weak, borderline signal (partial r ${Math.min(...keepV.map((v) => v.partial)).toFixed(2)}–${Math.max(...keepV.map((v) => v.partial)).toFixed(2)}, p ${Math.min(...keepV.map((v) => v.partialP)).toFixed(3)}–${Math.max(...keepV.map((v) => v.partialP)).toFixed(3)})` : 'no condition keeps a specific signal';
        setText('validNote', `Search interest matches where the condition is actually more common for <strong>${esc(sig.join(', '))}</strong> (r ${Math.min(...vs.filter((v) => v.p < 0.05).map((v) => v.r)).toFixed(2)}–${vs[0].r.toFixed(2)}). ` +
            `But most of that match is <em>general</em>: after controlling for each state's overall health-search intensity, only ${keepTxt}. ` +
            `<strong>Obesity is the exception</strong> — raw r = ${ob.r.toFixed(2)}, and r = ${ob.partial.toFixed(2)} (p ${fmtP(ob.partialP)}) after the control: states with more obesity search <em>relatively less</em> about it.`);
        const ui = { c: 'diabetes' };
        chips(document.getElementById('validChips'), AN.validation.map((v) => [v.condition, label(v.condition), ICONS[v.condition]]), ui.c, (k) => { ui.c = k; drawValid(); });

        // Search × prevalence matrix (specificity)
        const mx = AN.matrix, mbox = document.getElementById('matrix');
        if (mbox) mbox.innerHTML = `<table class="heat"><caption class="visually-hidden">Correlation of each condition's search interest with each CDC prevalence measure across states</caption>
            <thead><tr><td><small>CDC prevalence →</small></td>${mx.measures.map((m, j) => `<th scope="col" title="${esc(mx.labels[j])}">${esc(SHORT_MEASURE[m] || mx.labels[j])}</th>`).join('')}</tr></thead>
            <tbody>${mx.conditions.map((c, i) => `<tr><th scope="row">${esc(label(c))} searches</th>${mx.r[i].map((r, j) => {
                const diag = AN.validation[j] && AN.validation[j].condition === c;
                return `<td class="${diag ? 'on' : ''}" style="background:${heatColor(r)};color:${Math.abs(r) > 0.55 ? '#fff' : 'var(--ink)'}" title="${esc(label(c))} searches vs ${esc(mx.labels[j])}: r = ${r.toFixed(2)}">${r.toFixed(2)}</td>`;
            }).join('')}</tr>`).join('')}</tbody></table>`;
        const r_ = (c, m) => mx.r[mx.conditions.indexOf(c)][mx.measures.indexOf(m)];
        setText('matrixNote', `Outlined cells pair each search with its own condition. Obesity prevalence is tracked better by searches for <strong>diarrhea</strong> (r = ${r_('diarrhea', 'obesity').toFixed(2)}) and <strong>diabetes</strong> (r = ${r_('diabetes', 'obesity').toFixed(2)}) than by obesity searches (r = ${r_('obesity', 'obesity').toFixed(2)}) — people search for the consequences, not the condition. ` +
            `Depression searches are specific: they track depression (r = ${r_('depression', 'depression').toFixed(2)}) but not diabetes prevalence (r = ${r_('depression', 'diabetes').toFixed(2)}).`);

        // ---- 2. Structure (PCA) ----
        const P = AN.pca, ex = P.explained;
        setText('pcaNote', `<strong>PC1 (${(ex[0] * 100).toFixed(0)}% of variance)</strong> — every condition loads positively: it is overall health-search intensity. It is highest in smaller Southern and Midwestern metros and lowest in large coastal ones, where health is a smaller share of everything searched; at state level it tracks overall disease burden (r = ${o.r.toFixed(2)}). ` +
            `<strong>PC2 (${(ex[1] * 100).toFixed(0)}%)</strong> contrasts rehab, cardiovascular and diarrhea (+) with vaccine, depression and obesity (−), and runs north–south (correlation with latitude r = ${P.latR[1].toFixed(2)}). ` +
            `Metros don't fall into distinct groups (best k-means silhouette = ${Math.max(...Object.values(P.silhouette)).toFixed(2)}, well below the ~0.5 that indicates real clusters), so they are described by these two continuous dimensions.`);
        const pcVals = Object.fromEntries(M.states.map((st) => { const xs = nn(M.metrosByState[st].map((i) => P.scores[i][1])); return [st, xs.length ? mean(xs) : null]; }));
        renderMap(document.getElementById('pcaMap'), {
            values: pcVals, diverging: true, label: 'North–south health-search profile (PC2) by state', fmt: (v) => `${v >= 0 ? '+' : ''}${v.toFixed(2)}`,
            metros: D.metros.map((_, i) => ({ i, v: P.scores[i][1] })), metroFmt: (v) => `PC2 ${v >= 0 ? '+' : ''}${v.toFixed(2)}`
        });

        // ---- 3. Correlations ----
        renderHeatmap(M);
        const pairState = { a: M.pairs[0].a, b: M.pairs[0].b };
        document.getElementById('heatmap')?.addEventListener('click', (e) => {
            const b = e.target.closest('[data-a]'); if (!b) return;
            pairState.a = +b.dataset.a; pairState.b = +b.dataset.b;
            document.querySelectorAll('#heatmap td').forEach((td) => td.classList.toggle('on', td.firstElementChild === b));
            renderScatter(M, pairState.a, pairState.b);
        });

        // ---- 4. Stability ----
        const st = C.map((c, i) => ({ c, r: AN.stability[i] })).sort((a, b) => b.r - a.r);
        setText('stabNote', `Where a condition is searched is persistent: a metro's rank in ${AN.windows ? AN.windows.early : '2008–2010'} predicts its rank in ${AN.windows ? AN.windows.late : '2015–2017'} with Spearman ρ = ${st[st.length - 2].r.toFixed(2)}–${st[0].r.toFixed(2)} for most conditions (highest: ${esc(label(st[0].c))}). ` +
            `${esc(label(st[st.length - 1].c))} is the exception (ρ = ${st[st.length - 1].r.toFixed(2)}): its geography shifts year to year, consistent with outbreak-driven, seasonal searching.`);

        // ---- 5. CDC ----
        renderCdcCards(M);

        // ---- 6. Original findings revisited ----
        const perMetro = (s) => M.stateTotal[s] / M.metrosByState[s].length;
        const byTotal = [...M.states].sort((a, b) => M.stateTotal[b] - M.stateTotal[a]).slice(0, 3).map((s) => STATE_NAMES[s]);
        const byAvg = [...M.states].sort((a, b) => perMetro(b) - perMetro(a)).slice(0, 3).map((s) => STATE_NAMES[s]);
        const ri = (a, b) => M.corr[C.indexOf(a)][C.indexOf(b)];
        const rows = [
            ['Health searching grew by about 120% from 2004 to 2017.', `Not supported. Each year is rescaled so the top metro scores 100; the typical score rose from ${M.medians[0]} to ${M.medians[M.medians.length - 1]} because more small metros crossed Google's reporting threshold (zero scores fell from ${M.zeros[0]} to ${M.zeros[M.zeros.length - 1]}).`],
            ['Cancer is the most searched condition; stroke out-searches cardiovascular disease.', 'Can\'t be tested with this data — every condition is scaled 0–100 on its own. A higher total only means interest is spread more evenly across metros.'],
            [`${byTotal.join(', ')} have the highest search volume.`, `Their totals reflect how many metro areas they have (${M.metrosByState.TX.length}, ${M.metrosByState.CA.length}, ${M.metrosByState.NY.length}). Per metro, ${byAvg.join(', ')} rank highest.`],
            ['Diabetes correlates strongly with depression and obesity (r up to 0.74).', `Partly confirmed across metro areas: diabetes–obesity r = ${ri('diabetes', 'obesity').toFixed(2)}, diabetes–depression r = ${ri('depression', 'diabetes').toFixed(2)}. The strongest pair is ${label(C[M.pairs[0].a])}–${label(C[M.pairs[0].b])} (r = ${M.pairs[0].r.toFixed(2)}).`],
            ['Goal: compare searches with the actual location of occurrences.', `Now tested against CDC state prevalence: searches track disease burden (r = ${o.r.toFixed(2)} overall), mostly through general health-search intensity — see section 1.`]
        ];
        const rt = document.getElementById('revisitedRows');
        if (rt) rt.innerHTML = rows.map(([a, b]) => `<tr><td>${esc(a)}</td><td>${esc(b)}</td></tr>`).join('');

        function drawValid() {
            const c = ARC.themeColors(), v = AN.validation.find((x) => x.condition === ui.c), pts = AN.points[ui.c];
            const xs = pts.map((p) => p[1]), ys = pts.map((p) => p[2]), mxx = mean(xs), myy = mean(ys);
            let sxy = 0, sxx = 0; xs.forEach((x, i) => { sxy += (x - mxx) * (ys[i] - myy); sxx += (x - mxx) ** 2; });
            const slope = sxy / sxx, b0 = myy - slope * mxx, x0 = Math.min(...xs), x1 = Math.max(...xs);
            setText('validTitle', `${esc(label(ui.c))} searches vs ${esc(v.label.toLowerCase())} <small>r = ${v.r.toFixed(2)}, p ${fmtP(v.p)}, ${v.n} states</small>`);
            draw('validChart', { type: 'scatter', data: { datasets: [
                { data: pts.map((p) => ({ x: p[1], y: p[2], st: p[0] })), backgroundColor: 'rgba(10,108,255,.55)', borderColor: 'rgba(10,108,255,.9)', pointRadius: 4.5, pointHoverRadius: 7 },
                { type: 'line', data: [{ x: x0, y: b0 + slope * x0 }, { x: x1, y: b0 + slope * x1 }], borderColor: '#7c3aed', borderWidth: 2.5, pointRadius: 0, borderDash: v.p < 0.05 ? [] : [6, 6] }] },
                options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, tooltip: { callbacks: { label: (x) => (x.raw.st ? `${STATE_NAMES[x.raw.st]}: search ${x.raw.x}, prevalence ${x.raw.y}%` : 'Fit') } } },
                    scales: { x: axis(c, `${label(ui.c)} search interest (state average, ${AN.windows ? AN.windows.validation : '2011–2017'})`), y: axis(c, `${v.label} (% of adults)`) } } });
        }
        withCharts(() => {
            const c = ARC.themeColors();
            drawValid();
            draw('overallChart', { type: 'scatter', data: { datasets: [{ data: o.points.map((p) => ({ x: p[1], y: p[2], st: p[0] })), backgroundColor: 'rgba(234,88,12,.6)', pointRadius: 4.5 }] },
                options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, tooltip: { callbacks: { label: (x) => `${STATE_NAMES[x.raw.st]}: intensity ${x.raw.x}, burden ${x.raw.y}` } } },
                    scales: { x: axis(c, 'Overall health-search intensity (PC1)'), y: axis(c, 'Disease burden (mean z-score, 6 conditions)') } } });
            draw('screeChart', { type: 'bar', data: { labels: ex.map((_, i) => `PC${i + 1}`), datasets: [{ data: ex.map((v) => +(v * 100).toFixed(1)), backgroundColor: ex.map((_, i) => (i < 2 ? '#0a6cff' : c.ink3)), borderRadius: 4 }] },
                options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, tooltip: { callbacks: { label: (x) => `${x.raw}% of variance` } } }, scales: { x: { ...axis(c), grid: { display: false } }, y: { ...axis(c, '% of variance explained'), beginAtZero: true } } } });
            draw('loadChart', { type: 'bar', data: { labels: C.map(label), datasets: [
                { label: 'PC1 · intensity', data: P.loadings[0], backgroundColor: '#0a6cff', borderRadius: 4 },
                { label: 'PC2 · south (+) vs north (−)', data: P.loadings[1], backgroundColor: SOUTH, borderRadius: 4 }] },
                options: { indexAxis: 'y', responsive: true, maintainAspectRatio: false, plugins: { legend: legend(c) }, scales: { x: { ...axis(c, 'Loading'), min: -0.8, max: 0.8 }, y: { ...axis(c), grid: { display: false } } } } });
            renderScatter(M, pairState.a, pairState.b);
            draw('stabChart', { type: 'bar', data: { labels: st.map((x) => label(x.c)), datasets: [{ data: st.map((x) => x.r), backgroundColor: st.map((x) => (x.r >= 0.6 ? '#0a6cff' : x.r >= 0.5 ? 'rgba(10,108,255,.55)' : c.ink3)), borderRadius: 4 }] },
                options: { indexAxis: 'y', responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, tooltip: { callbacks: { label: (x) => `Spearman ρ = ${x.raw.toFixed(2)}` } } }, scales: { x: { ...axis(c, `Rank correlation, ${AN.windows ? `${AN.windows.early} vs ${AN.windows.late}` : '2008–10 vs 2015–17'}`), min: 0, max: 1 }, y: { ...axis(c), grid: { display: false } } } } });
            draw('cdcChart', { type: 'line', data: { labels: M.cdcYears, datasets: M.cdc.map((x, i) => ({ label: x.label, data: x.values, borderColor: CAUSE_COLORS[i], backgroundColor: CAUSE_COLORS[i], borderWidth: 2.2, pointRadius: 2, tension: .3 })) },
                options: { responsive: true, maintainAspectRatio: false, interaction: { mode: 'index', intersect: false }, plugins: { legend: legend(c, 'bottom') },
                    scales: { x: axis(c), y: { ...axis(c, 'Deaths per 100,000 (log scale)'), type: 'logarithmic', ticks: { color: c.ink3, callback: (v) => ([10, 20, 50, 100, 200].includes(v) ? v : '') } } } } });
        });
        addKnowledge(M);
    }

    function renderHeatmap(M) {
        const box = document.getElementById('heatmap'); if (!box) return;
        const { C } = M, first = M.pairs[0];
        box.innerHTML = `<table class="heat"><caption class="visually-hidden">Correlation between search interest in each pair of conditions across metro areas</caption>
            <thead><tr><td></td>${C.map((c) => `<th scope="col">${esc(label(c))}</th>`).join('')}</tr></thead>
            <tbody>${C.map((a, ai) => `<tr><th scope="row">${esc(label(a))}</th>${C.map((b, bi) => {
                if (ai === bi) return '<td class="self">—</td>';
                const r = M.corr[ai][bi], lo = Math.min(ai, bi), hi = Math.max(ai, bi);
                return `<td class="${lo === first.a && hi === first.b ? 'on' : ''}" style="background:${heatColor(r)};color:${Math.abs(r) > 0.55 ? '#fff' : 'var(--ink)'}"><button type="button" data-a="${lo}" data-b="${hi}" aria-label="${esc(label(a))} and ${esc(label(b))}: r = ${r.toFixed(2)}">${r.toFixed(2)}</button></td>`;
            }).join('')}</tr>`).join('')}</tbody></table>`;
        const weak = M.pairs[M.pairs.length - 1];
        setText('heatNote', `Strongest: ${M.pairs.slice(0, 3).map((p) => `${esc(label(C[p.a]))} & ${esc(label(C[p.b]))} (${p.r.toFixed(2)})`).join(', ')}; weakest: ${esc(label(C[weak.a]))} & ${esc(label(C[weak.b]))} (${weak.r.toFixed(2)}). ` +
            `Every pair is positive because of the shared intensity factor (PC1): places that search more about health search more about everything. Correlation is not causation.`);
    }

    function renderScatter(M, a, b) {
        if (!document.getElementById('scatterChart')) return;
        const c = ARC.themeColors(), { C, D } = M;
        const pts = D.metros.map((m, i) => ({ x: M.metroMean[i][a], y: M.metroMean[i][b], m })).filter((p) => p.x != null && p.y != null);
        const xs = pts.map((p) => p.x), ys = pts.map((p) => p.y), mx = mean(xs), my = mean(ys);
        let sxy = 0, sxx = 0; xs.forEach((x, i) => { sxy += (x - mx) * (ys[i] - my); sxx += (x - mx) ** 2; });
        const slope = sxy / sxx, icpt = my - slope * mx, x0 = Math.min(...xs), x1 = Math.max(...xs);
        setText('scatterTitle', `${esc(label(C[a]))} vs ${esc(label(C[b]))} <small>r = ${M.corr[a][b].toFixed(2)} · ${pts.length} metro areas</small>`);
        draw('scatterChart', { type: 'scatter', data: { datasets: [
            { label: 'Metro areas', data: pts, backgroundColor: 'rgba(10,108,255,.5)', borderColor: 'rgba(10,108,255,.9)', pointRadius: 3.5, pointHoverRadius: 6 },
            { type: 'line', label: 'Trend', data: [{ x: x0, y: icpt + slope * x0 }, { x: x1, y: icpt + slope * x1 }], borderColor: '#7c3aed', borderWidth: 2.5, pointRadius: 0 }] },
            options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, tooltip: { callbacks: { label: (x) => (x.raw.m ? `${x.raw.m.name}: ${x.raw.x.toFixed(0)}, ${x.raw.y.toFixed(0)}` : 'Trend') } } },
                scales: { x: axis(c, `${label(C[a])} interest`), y: axis(c, `${label(C[b])} interest`) } } });
    }

    function renderCdcCards(M) {
        const box = document.getElementById('cdcCards'); if (!box) return;
        const Y = M.cdcYears, s = [...M.cdc].sort((a, b) => b.change - a.change);
        box.innerHTML = [s[0], s[1], s[2], s[s.length - 2], s[s.length - 1]].map((x) => `<article class="card stat-card">
            <h3><span>${esc(x.label)}</span><span class="strength ${x.change > 0 ? 'moderate' : 'strong'}">${pct(x.change)}</span></h3>
            <dl><dt>${Y[0]}</dt><dd>${x.first.toFixed(1)}</dd><dt>${Y[Y.length - 1]}</dt><dd>${x.last.toFixed(1)}</dd></dl><p>Deaths per 100,000, age-adjusted.</p></article>`).join('');
    }

    /* ======================= City comparison ======================= */
    function initComparison() {
        let M;
        try { M = load(); } catch { failAll(); return; }
        const { D, C, Y, V } = M, AN = A();
        const sel = document.getElementById('citySel');
        const order = D.metros.map((m, i) => ({ m, i })).sort((a, b) => a.m.name.localeCompare(b.m.name));
        sel.innerHTML = order.map(({ m, i }) => `<option value="${i}">${esc(m.name)}</option>`).join('');
        const start = D.metros.findIndex((m) => m.name.startsWith('Austin'));
        sel.value = String(start >= 0 ? start : 0);
        let city = +sel.value, cond = 'all';
        // z-scores of each metro's 9-condition profile, for "most similar" (Euclidean distance)
        const cols = C.map((_, ci) => nn(M.metroMean.map((r) => r[ci])));
        const mu = cols.map(mean), sd = cols.map((v, ci) => Math.sqrt(mean(v.map((x) => (x - mu[ci]) ** 2))));
        const z = M.metroMean.map((r) => r.map((v, ci) => (v == null ? null : (v - mu[ci]) / sd[ci])));
        // Percentile rank of a metro for condition ci in year yi (among metros with data that year)
        const pctRank = (i, ci, yi) => {
            const v = V[i][yi][ci]; if (!(v > 0)) return null;
            const all = V.map((ys) => ys[yi][ci]).filter((x) => x > 0);
            return (all.filter((x) => x < v).length + 0.5 * (all.filter((x) => x === v).length - 1)) / (all.length - 1) * 100;
        };
        const meanPct = (i, ci) => { const xs = nn(Y.map((_, yi) => pctRank(i, ci, yi))); return xs.length ? mean(xs) : null; };
        chips(document.getElementById('condChips'), [['all', 'All conditions', ICONS.all], ...C.map((c) => [c, label(c), ICONS[c]])], cond, (k) => { cond = k; if (window.Chart) drawCharts(); });

        let S = null;
        const update = () => {
            const m = D.metros[city], zi = z[city];
            const sims = zi.some((v) => v == null) ? [] : D.metros.map((_, j) => j).filter((j) => j !== city && z[j].every((v) => v != null))
                .map((j) => ({ j, d: Math.sqrt(sum(zi.map((v, k) => (v - z[j][k]) ** 2))) })).sort((a, b) => a.d - b.d).slice(0, 5);
            renderMap(document.getElementById('cityMap'), {
                values: Object.fromEntries(M.states.map((st) => [st, st === m.postal ? 1 : 0])), selected: m.postal, label: `Location of ${m.name}`, fmt: () => '',
                metros: D.metros.map((_, i) => ({ i, v: i === city ? null : 1, on: i === city, sim: sims.some((s) => s.j === i) })), metroFmt: () => '', fixedSize: true,
                onMetro: (i) => { city = i; sel.value = String(i); update(); }
            });
            const pcts = C.map((_, ci) => meanPct(city, ci));
            const overall = nn(pcts).length ? mean(nn(pcts)) : null;
            const pc = AN ? AN.pca.scores[city] : [null, null];
            const dist = C.map((c, ci) => ({ c, p: pcts[ci] })).filter((x) => x.p != null).sort((a, b) => Math.abs(b.p - 50) - Math.abs(a.p - 50))[0];
            const kv = (id, v) => { const e = document.getElementById(id); if (e) e.textContent = v; };
            kv('cState', m.state);
            kv('cOverall', overall == null ? 'n/a' : `${Math.round(overall)}th pct`);
            kv('cProfile', pc[1] == null ? 'n/a' : pc[1] > 0.5 ? 'Southern' : pc[1] < -0.5 ? 'Northern' : 'Mixed');
            kv('cDistinct', dist ? `${label(dist.c)} (${Math.round(dist.p)})` : 'n/a');
            const zeros = V[city].flat().filter((v) => v === 0).length;
            setText('cityNote', `${zeros ? `${zeros} of ${Y.length * C.length} values are 0 (Google's "not enough data") and are excluded.` : 'Complete data for every year and condition.'} Percentiles compare this metro with all metro areas in the same year (100 = highest).`);
            setText('simList', sims.length ? sims.map((s) => `<li><button type="button" class="linklike" data-i="${s.j}">${esc(D.metros[s.j].name)}</button> <small>distance ${s.d.toFixed(2)}</small></li>`).join('') : '<li>Not enough data to compare profiles.</li>');
            S = { pcts };
            if (window.Chart) drawCharts();
        };
        document.getElementById('simList')?.addEventListener('click', (e) => { const b = e.target.closest('[data-i]'); if (!b) return; city = +b.dataset.i; sel.value = String(city); update(); });
        const drawCharts = () => {
            const c = ARC.themeColors(), m = D.metros[city], ci = C.indexOf(cond);
            draw('profileChart', { type: 'bar', data: { labels: C.map(label), datasets: [{ data: S.pcts.map((p) => (p == null ? null : +(p - 50).toFixed(1))), backgroundColor: S.pcts.map((p) => (p == null ? c.ink3 : p >= 50 ? '#0a6cff' : SOUTH)), borderRadius: 4, base: 0 }] },
                options: { indexAxis: 'y', responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, tooltip: { callbacks: { label: (x) => `${Math.round(x.raw + 50)}th percentile of metro areas` } } },
                    scales: { x: { ...axis(c, 'Percentile minus 50 (right = more interest than most metros)'), min: -50, max: 50, ticks: { color: c.ink3, callback: (v) => `${v + 50}` } }, y: { ...axis(c), grid: { display: false } } } } });
            // all conditions: average of the nine percentiles that year (needs at least 5)
            const series = Y.map((_, yi) => { if (cond !== 'all') return pctRank(city, ci, yi); const xs = nn(C.map((_, k) => pctRank(city, k, yi))); return xs.length >= 5 ? mean(xs) : null; });
            const col = cond === 'all' ? '#0a6cff' : COND_COLORS[cond];
            draw('rankChart', { type: 'line', data: { labels: Y, datasets: [{ label: m.name, data: series, borderColor: col, backgroundColor: col, tension: .3, pointRadius: 3, spanGaps: true }] },
                options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, tooltip: { callbacks: { label: (x) => `${Math.round(x.raw)}th percentile` } } }, scales: { x: axis(c), y: { ...axis(c, `${label(cond)}: percentile among metro areas`), min: 0, max: 100 } } } });
            setText('rankTitle', `${esc(label(cond))} over time <small>${esc(m.name)}</small>`);
        };
        sel.addEventListener('change', () => { city = +sel.value; update(); });
        update();
        withCharts(drawCharts);
        addKnowledge(M);
    }

    /* ======================= Data & API ======================= */
    function initData() {
        let M;
        try { M = load(); } catch { failAll(); return; }
        const { D, C, Y } = M;
        const rows = [];
        D.metros.forEach((m, i) => Y.forEach((y, yi) => { const r = { metro: m.name, state: m.state, year: y }; C.forEach((c, ci) => { r[c] = D.values[i][yi][ci]; }); rows.push(r); }));
        const k = (id, v) => { const e = document.getElementById(id); if (e) e.textContent = v; };
        DataTable.mount(document.getElementById('searchTable'), {
            id: 'gh', rows, fileName: 'google-health-search-interest', pageSize: 25, caption: 'Google Trends search interest by metro area and year',
            columns: [{ key: 'metro', label: 'Metro area' }, { key: 'state', label: 'State', filter: true, filterLabel: 'states' }, { key: 'year', label: 'Year', type: 'number', filter: true, filterLabel: 'years' }, ...C.map((c) => ({ key: c, label: label(c), type: 'number' }))],
            onChange: (v) => { k('kRows', v.length.toLocaleString()); k('kMetros', new Set(v.map((r) => r.metro)).size); k('kStates', new Set(v.map((r) => r.state)).size); k('kYears', new Set(v.map((r) => r.year)).size); }
        });
        DataTable.mount(document.getElementById('cdcTable'), {
            id: 'cdc', fileName: 'cdc-leading-causes-of-death', pageSize: 25, caption: 'CDC age-adjusted death rates per 100,000',
            rows: M.cdcYears.map((y, yi) => Object.fromEntries([['year', y], ...M.cdc.map((x) => [x.key, x.values[yi]])])),
            columns: [{ key: 'year', label: 'Year', type: 'number' }, ...M.cdc.map((x) => ({ key: x.key, label: x.label, type: 'number' }))]
        });
        addKnowledge(M);
    }

    function initApi() {
        let M = null;
        try { M = load(); } catch { /* the endpoint list still works */ }
        const box = document.getElementById('endpoints'); if (!box) return;
        const base = new URL('static/data/', location.href).href;
        box.innerHTML = ENDPOINTS.map(([ep, title, desc]) => `<article class="card endpoint">
            <div class="endpoint-head"><span class="method">GET</span><code>static/data/${ep}.json</code><span class="legacy">was <code>/${ep}</code></span></div>
            <h3>${esc(title)}</h3><p>${esc(desc)}</p>
            <div class="endpoint-actions"><a class="btn btn-outline btn-sm" href="static/data/${ep}.json" target="_blank" rel="noopener"><i class="fas fa-arrow-up-right-from-square" aria-hidden="true"></i> Open</a>
            <button type="button" class="btn btn-outline btn-sm" data-try="${ep}"><i class="fas fa-play" aria-hidden="true"></i> Try it</button>
            <button type="button" class="btn btn-outline btn-sm" data-copy="${base}${ep}.json"><i class="fas fa-copy" aria-hidden="true"></i> Copy URL</button></div>
            <pre class="endpoint-out" hidden></pre></article>`).join('');
        box.addEventListener('click', async (e) => {
            const cp = e.target.closest('[data-copy]');
            if (cp) { try { await navigator.clipboard.writeText(cp.dataset.copy); ARC.toast('URL copied'); } catch { ARC.toast(cp.dataset.copy); } return; }
            const t = e.target.closest('[data-try]'); if (!t) return;
            const out = t.closest('.endpoint').querySelector('.endpoint-out');
            out.hidden = false; out.textContent = 'Loading…';
            try {
                const res = await fetch(`static/data/${t.dataset.try}.json`);
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                const j = await res.json();
                out.textContent = `// ${j.data.length} records — fields: ${j.schema.fields.map((f) => f.name).join(', ')}\n${JSON.stringify(j.data.slice(0, 3), null, 2)}${j.data.length > 3 ? '\n…' : ''}`;
            } catch (err) {
                out.textContent = location.protocol === 'file:' ? 'Browsers block requests from pages opened as files. Open the site from its web address (or run python3 app.py) to try the endpoints.' : `Couldn't load the endpoint (${err.message}).`;
            }
        });
        if (M) addKnowledge(M);
    }

    /* ======================= Assistant knowledge generated from the data ======================= */
    let kbAdded = false;
    function addKnowledge(M) {
        if (kbAdded || !window.ARC || !ARC.KB) return;
        kbAdded = true;
        const { C, D } = M;
        const ranked = (ci) => M.states.filter((s) => M.stateScore(s, ci, null) != null).sort((a, b) => M.stateScore(b, ci, null) - M.stateScore(a, ci, null));
        const aliases = { Cancer: ['cancer', 'tumor', 'oncology'], cardiovascular: ['cardiovascular', 'heart', 'cardiac', 'heart disease'], stroke: ['stroke'],
            depression: ['depression', 'mental health', 'depressed'], rehab: ['rehab', 'rehabilitation', 'addiction'], vaccine: ['vaccine', 'vaccination', 'vaccines'],
            diarrhea: ['diarrhea', 'diarrhoea'], obesity: ['obesity', 'obese', 'overweight', 'weight'], diabetes: ['diabetes', 'diabetic', 'blood sugar'] };
        C.forEach((c, ci) => {
            const r = ranked(ci);
            const metros = D.metros.map((m, i) => ({ m, v: M.metroMean[i][ci] })).filter((x) => x.v != null).sort((a, b) => b.v - a.v);
            const rel = M.pairs.filter((p) => p.a === ci || p.b === ci).slice(0, 2).map((p) => `${label(C[p.a === ci ? p.b : p.a])} (r = ${p.r.toFixed(2)})`);
            ARC.KB.push({ id: `gh-c-${c}`, topic: 'project', title: `${label(c)} search interest`,
                q: [`where do people search most for ${label(c).toLowerCase()}`, `tell me about ${label(c).toLowerCase()}`, `${label(c).toLowerCase()} searches by state`, `which states search ${label(c).toLowerCase()} the most`],
                k: [...aliases[c], 'state', 'states', 'highest', 'lowest', 'where'],
                a: `**${label(c)} — where interest is highest** (${D.years[0]}–${D.years[D.years.length - 1]} average, 0–100 scale)\n\n- **Top states:** ${r.slice(0, 3).map((s) => `${STATE_NAMES[s]} (${M.stateScore(s, ci, null).toFixed(0)})`).join(', ')}\n- **Lowest states:** ${r.slice(-2).map((s) => `${STATE_NAMES[s]} (${M.stateScore(s, ci, null).toFixed(0)})`).join(', ')}\n- **Top metro area:** ${metros[0].m.name} (${metros[0].v.toFixed(0)})\n- **Searched together with:** ${rel.join(', ')}\n\nScores compare places *within* ${label(c).toLowerCase()}.`,
                actions: [{ label: 'Open the map', action: 'link:index.html#explore' }] });
        });
        M.states.forEach((st) => {
            const vals = C.map((_, ci) => ({ c: C[ci], s: M.stateScore(st, ci, null) })).filter((x) => x.s != null).map((x) => ({ c: x.c, d: x.s - M.national[C.indexOf(x.c)] })).sort((a, b) => b.d - a.d);
            if (vals.length < 4) return;
            const n = M.metrosByState[st].length;
            ARC.KB.push({ id: `gh-s-${st}`, topic: 'project', title: `${STATE_NAMES[st]} health searches`,
                q: [`what does ${STATE_NAMES[st].toLowerCase()} search for`, `${STATE_NAMES[st].toLowerCase()} health trends`, `tell me about ${STATE_NAMES[st].toLowerCase()}`],
                k: [STATE_NAMES[st].toLowerCase(), 'state', 'profile'],
                a: `**${STATE_NAMES[st]}** — ${n} Google metro area${n > 1 ? 's' : ''} in the data.\n\n- **Strongest relative interest:** ${vals.slice(0, 2).map((x) => `${label(x.c)} (${x.d >= 0 ? '+' : ''}${x.d.toFixed(1)})`).join(', ')}\n- **Weakest relative interest:** ${vals.slice(-2).reverse().map((x) => `${label(x.c)} (${x.d >= 0 ? '+' : ''}${x.d.toFixed(1)})`).join(', ')}\n\nPoints above (+) or below (−) the average of all metro areas on Google's 0–100 scale.`,
                actions: [{ label: 'See the state profile', action: 'link:index.html#states' }] });
        });
        D.metros.forEach((m, i) => {
            const v = M.metroMean[i];
            if (v.filter((x) => x != null).length < 5) return;
            const top = C.map((c, ci) => ({ c, v: v[ci] })).filter((x) => x.v != null).sort((a, b) => b.v - a.v);
            const city = m.name.split(/[-&(]/)[0].replace(/\s[A-Z]{2}$/, '').trim().toLowerCase();
            ARC.KB.push({ id: `gh-m-${m.id}`, topic: 'project', title: `${m.name} health searches`,
                q: [`what does ${city} search for`, `${city} health searches`],
                k: [city, 'city', 'metro'],
                a: `**${m.name}** (${m.state}) — average interest 2004–2017:\n\n${top.map((x) => `- ${label(x.c)}: ${x.v.toFixed(0)}`).join('\n')}`,
                actions: [{ label: 'Compare cities', action: 'link:comparison.html' }] });
        });
        const pr = M.pairs;
        ARC.KB.push({ id: 'gh-corr', topic: 'project', title: 'Which conditions are searched together?',
            q: ['which conditions are correlated', 'is diabetes correlated with depression', 'which searches go together', 'correlation between conditions'],
            k: ['correlation', 'correlated', 'related', 'together', 'relationship', 'pearson', 'heatmap', 'comorbidity'],
            a: `Correlation of search interest across the ${D.metros.length - M.sparse.length} metro areas with enough data:\n\n**Strongest pairs**\n${pr.slice(0, 4).map((p) => `- ${label(C[p.a])} & ${label(C[p.b])}: r = ${p.r.toFixed(2)}`).join('\n')}\n\n**Weakest pairs**\n${pr.slice(-3).reverse().map((p) => `- ${label(C[p.a])} & ${label(C[p.b])}: r = ${p.r.toFixed(2)}`).join('\n')}\n\nPlaces with high interest in one tend to have high interest in the other — co-occurrence, not causation.`,
            actions: [{ label: 'Open the heatmap', action: 'link:analytics.html#correlations' }] });
        const s = [...M.cdc].sort((a, b) => b.change - a.change);
        ARC.KB.push({ id: 'gh-cdc', topic: 'project', title: 'CDC leading causes of death',
            q: ['how did death rates change', 'cdc leading causes of death', 'which causes of death increased', 'cdc mortality trends'],
            k: ['cdc', 'death', 'deaths', 'mortality', 'causes', 'died', 'leading causes'],
            a: `US age-adjusted death rates per 100,000, ${M.cdcYears[0]} → ${M.cdcYears[M.cdcYears.length - 1]}:\n\n**Rising:** ${s.slice(0, 3).map((x) => `${x.label} ${pct(x.change)}`).join(', ')}\n**Falling most:** ${s.slice(-3).reverse().map((x) => `${x.label} ${pct(x.change)}`).join(', ')}\n\nHeart disease and cancer remain the two leading causes. (The 2017 cancer rate was corrected from a typo of 52.5 to 152.5.)`,
            actions: [{ label: 'See the chart', action: 'link:analytics.html#cdc' }] });
        const AN = A();
        if (AN) {
            ARC.KB.push({ id: 'gh-valid', topic: 'project', title: 'Does search interest match real disease rates?',
                q: ['do searches match disease rates', 'does search interest reflect disease burden', 'is search data valid', 'do searches match cdc data', 'do searches predict prevalence'],
                k: ['validation', 'valid', 'prevalence', 'brfss', 'burden', 'match', 'reflect', 'actual', 'real', 'occurrence'],
                a: `Tested against CDC BRFSS state prevalence (2011–2017):\n\n${AN.validation.map((v) => `- **${label(v.condition)}** vs ${v.label.toLowerCase()}: r = ${v.r.toFixed(2)} [${v.lo.toFixed(2)}, ${v.hi.toFixed(2)}], p ${fmtP(v.p)}; controlling for overall search intensity r = ${v.partial.toFixed(2)}`).join('\n')}\n\nOverall, states' health-search intensity tracks their overall disease burden (r = ${AN.overall.r.toFixed(2)}). The specific match is modest for diabetes and depression, and obesity is the exception — heavier states search relatively less about it.`,
                actions: [{ label: 'See the validation', action: 'link:analytics.html#validation' }] });
            ARC.KB.push({ id: 'gh-pca', topic: 'project', title: 'The two dimensions of health search',
                q: ['what is the north south divide', 'principal component analysis', 'are there clusters of cities', 'what are the main patterns'],
                k: ['pca', 'principal', 'component', 'dimension', 'north', 'south', 'divide', 'cluster', 'clusters', 'pattern'],
                a: `Principal component analysis of ${AN.pca.n} metro areas' search profiles:\n\n- **PC1 (${(AN.pca.explained[0] * 100).toFixed(0)}%)** — overall health-search intensity: highest in smaller Southern and Midwestern metros, lowest in big coastal ones.\n- **PC2 (${(AN.pca.explained[1] * 100).toFixed(0)}%)** — a north–south axis (latitude r = ${AN.pca.latR[1].toFixed(2)}): rehab, heart and diarrhea in the South; depression, vaccine and obesity in the North.\n\nThere are no distinct clusters (silhouette ≤ ${Math.max(...Object.values(AN.pca.silhouette)).toFixed(2)}); metros vary along these continuous dimensions.`,
                actions: [{ label: 'See the map', action: 'link:analytics.html#structure' }] });
        }
    }

    return { load, initOverview, initAnalytics, initComparison, initData, initApi, LABELS, addKnowledge: () => addKnowledge(load()) };
})();
