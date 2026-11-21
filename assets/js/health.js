/* Eagle Health Analytics — statistics and interactive charts computed from assets/data/health.data.js.
 *
 * How to read the data (this shapes every calculation below):
 *   Google Trends scales each year × condition separately: the metro area with the highest share of
 *   searches for that term in that year scores 100 and the rest are relative to it. So scores compare
 *   *places* within one condition and year. They do NOT compare conditions with each other, or years
 *   with each other. That's why this page shows where interest is relatively high and which conditions
 *   rise and fall together geographically, and never "total searches" or "growth".
 *
 * Every number on the page (and in the assistant's data answers) is calculated here from the data. */
'use strict';

const Health = (() => {
    const LABELS = { Cancer: 'Cancer', cardiovascular: 'Cardiovascular', stroke: 'Stroke', depression: 'Depression', rehab: 'Rehab',
        vaccine: 'Vaccine', diarrhea: 'Diarrhea', obesity: 'Obesity', diabetes: 'Diabetes' };
    const ICONS = { Cancer: 'ribbon', cardiovascular: 'heart-pulse', stroke: 'brain', depression: 'cloud-rain', rehab: 'person-walking',
        vaccine: 'syringe', diarrhea: 'bacteria', obesity: 'weight-scale', diabetes: 'droplet' };
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
    // US tile-grid layout: [row, column]
    const TILES = { AK: [0, 0], ME: [0, 10], WI: [1, 5], VT: [1, 9], NH: [1, 10], WA: [2, 0], ID: [2, 1], MT: [2, 2], ND: [2, 3], MN: [2, 4], IL: [2, 5],
        MI: [2, 6], NY: [2, 8], MA: [2, 9], OR: [3, 0], NV: [3, 1], WY: [3, 2], SD: [3, 3], IA: [3, 4], IN: [3, 5], OH: [3, 6], PA: [3, 7], NJ: [3, 8],
        CT: [3, 9], RI: [3, 10], CA: [4, 0], UT: [4, 1], CO: [4, 2], NE: [4, 3], MO: [4, 4], KY: [4, 5], WV: [4, 6], VA: [4, 7], MD: [4, 8], DE: [4, 9],
        AZ: [5, 1], NM: [5, 2], KS: [5, 3], AR: [5, 4], TN: [5, 5], NC: [5, 6], SC: [5, 7], DC: [5, 8], OK: [6, 3], LA: [6, 4], MS: [6, 5], AL: [6, 6],
        GA: [6, 7], HI: [7, 0], TX: [7, 3], FL: [7, 8] };

    const esc = (s) => ARC.util.escapeHtml(s);
    const mean = (a) => (a.length ? a.reduce((s, v) => s + v, 0) / a.length : NaN);
    const pct = (v) => `${v >= 0 ? '+' : '−'}${Math.abs(v).toFixed(1)}%`;
    const label = (c) => LABELS[c] || c;

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
        const C = D.conditions, Y = D.years;
        // In Google Trends a 0 means "not enough data" (the area is below Google's volume threshold), not zero
        // interest — so zeros are treated as missing. A metro's average for a condition needs data in at least
        // half the years; otherwise it's null and the metro is left out of that condition's statistics.
        const MIN_YEARS = Math.ceil(Y.length / 2);
        const nn = (a) => a.filter((v) => v != null);
        const metroMean = D.values.map((ys) => C.map((_, ci) => {
            const xs = ys.map((v) => v[ci]).filter((v) => v > 0);
            return xs.length >= MIN_YEARS ? mean(xs) : null;
        }));
        const metrosByState = {};
        D.metros.forEach((m, i) => { (metrosByState[m.postal] = metrosByState[m.postal] || []).push(i); });
        const states = Object.keys(metrosByState).sort((a, b) => STATE_NAMES[a].localeCompare(STATE_NAMES[b]));

        // Score of each metro for condition ci in year index yi (null = average of all years); null = no data
        const metroScore = (i, ci, yi) => (yi == null ? metroMean[i][ci] : (D.values[i][yi][ci] > 0 ? D.values[i][yi][ci] : null));
        const stateScore = (st, ci, yi) => { const xs = nn(metrosByState[st].map((i) => metroScore(i, ci, yi))); return xs.length ? mean(xs) : null; };
        const national = C.map((_, ci) => mean(nn(D.metros.map((_, i) => metroMean[i][ci]))));
        const sparse = D.metros.filter((_, i) => metroMean[i].filter((v) => v == null).length > C.length / 2).map((m) => m.name);
        const complete = D.metros.map((_, i) => i).filter((i) => metroMean[i].every((v) => v != null));

        const pairCorr = (a, b) => {
            const xs = [], ys = [];
            metroMean.forEach((r) => { if (r[a] != null && r[b] != null) { xs.push(r[a]); ys.push(r[b]); } });
            return pearson(xs, ys);
        };
        const corr = C.map((_, a) => C.map((_, b) => pairCorr(a, b)));
        const pairs = [];
        C.forEach((_, a) => C.forEach((_, b) => { if (a < b) pairs.push({ a, b, r: corr[a][b] }); }));
        pairs.sort((x, y) => y.r - x.r);

        // Share of zero scores per year: Google withholds values for low-volume areas, mostly in early years.
        const zeros = Y.map((_, yi) => D.values.reduce((s, ys) => s + ys[yi].filter((v) => v === 0).length, 0));
        const medians = Y.map((_, yi) => {
            const all = D.values.flatMap((ys) => ys[yi]).sort((a, b) => a - b);
            return all[Math.floor(all.length / 2)];
        });

        const cdcYears = D.cdc.years;
        const cdc = Object.entries(D.cdc.causes).map(([k, v]) => ({ key: k, label: CAUSE_LABELS[k] || k, values: v, first: v[0], last: v[v.length - 1], change: ((v[v.length - 1] - v[0]) / v[0]) * 100 }));

        cache = { D, C, Y, metroMean, metrosByState, states, metroScore, stateScore, national, corr, pairs, zeros, medians, cdc, cdcYears, sparse, complete, MIN_YEARS };
        return cache;
    }

    /* ---------- Shared UI helpers ---------- */
    const failAll = () => document.querySelectorAll('[data-needs-data]').forEach((e) => {
        e.innerHTML = '<div class="alert err">The dataset couldn\'t be loaded. You can still <a href="data.html">browse the data files</a>.</div>';
    });
    const shade = (t) => `color-mix(in srgb, var(--brand) ${Math.round(8 + t * 92)}%, var(--surface))`;
    const heatColor = (r) => (r >= 0 ? `color-mix(in srgb, var(--brand) ${Math.round(Math.abs(r) * 85)}%, var(--surface))`
        : `color-mix(in srgb, var(--danger) ${Math.round(Math.abs(r) * 85)}%, var(--surface))`);
    const chips = (box, items, current, onPick) => {
        box.innerHTML = items.map(([k, text, icon]) => `<button type="button" class="chip" data-k="${esc(k)}" aria-pressed="${k === current}">${icon ? `<i class="fas fa-${icon}" aria-hidden="true"></i> ` : ''}${esc(text)}</button>`).join('');
        box.addEventListener('click', (e) => {
            const b = e.target.closest('[data-k]'); if (!b) return;
            box.querySelectorAll('[data-k]').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
            onPick(b.dataset.k);
        });
    };
    const charts = {};
    const draw = (id, cfg) => {
        const cv = document.getElementById(id);
        if (!cv || !window.Chart) return;
        charts[id]?.destroy();
        charts[id] = new Chart(cv, cfg);
    };
    const axis = (c, title) => ({ title: { display: !!title, text: title, color: c.ink3 }, grid: { color: c.border }, ticks: { color: c.ink3 } });

    /* ---------- Overview page ---------- */
    async function initOverview() {
        let M;
        try { M = load(); } catch { failAll(); return; }
        const { D, C, Y } = M;

        const set = (sel, v) => document.querySelectorAll(sel).forEach((e) => { e.textContent = v; });
        set('[data-kpi="metros"]', D.metros.length);
        set('[data-kpi="states"]', M.states.length);
        set('[data-kpi="years"]', `${Y[0]}–${Y[Y.length - 1]}`);
        set('[data-kpi="conditions"]', C.length);

        renderFindings(M);
        renderCaveats(M);
        renderHeatmap(M);
        renderCdcCards(M);
        addKnowledge(M);

        // Explorer state
        const ui = { ci: C.indexOf('diabetes'), yi: null, state: null, rank: 'top' };
        chips(document.getElementById('condChips'), C.map((c) => [c, label(c), ICONS[c]]), C[ui.ci], (k) => { ui.ci = C.indexOf(k); renderExplorer(); });
        const yearSel = document.getElementById('yearSel');
        yearSel.innerHTML = `<option value="">All years (average)</option>${Y.map((y, i) => `<option value="${i}">${y}</option>`).join('')}`;
        yearSel.addEventListener('change', () => { ui.yi = yearSel.value === '' ? null : +yearSel.value; renderExplorer(); });
        document.getElementById('rankToggle').addEventListener('click', (e) => {
            const b = e.target.closest('[data-rank]'); if (!b) return;
            ui.rank = b.dataset.rank;
            e.currentTarget.querySelectorAll('[data-rank]').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
            renderExplorer();
        });

        const map = document.getElementById('tileMap');
        map.addEventListener('click', (e) => {
            const t = e.target.closest('.tile:not(.nodata)'); if (!t) return;
            ui.state = ui.state === t.dataset.st ? null : t.dataset.st;
            renderExplorer();
            if (ui.state) { document.getElementById('stateSel').value = ui.state; renderProfile(M, ui.state); }
        });

        function renderExplorer() {
            const ci = ui.ci, yi = ui.yi, c = C[ci];
            const vals = Object.fromEntries(M.states.map((st) => [st, M.stateScore(st, ci, yi)]));
            const vs = Object.values(vals).filter((v) => v != null), lo = Math.min(...vs), hi = Math.max(...vs);
            map.innerHTML = Object.entries(TILES).map(([st, [r, col]]) => {
                const v = vals[st];
                const pos = `grid-row:${r + 1};grid-column:${col + 1}`;
                if (v == null) return `<span class="tile nodata" style="${pos}" title="${esc(STATE_NAMES[st])}: ${M.metrosByState[st] ? 'not enough data' : 'no metro area of its own in the data'}">${st}</span>`;
                const t = hi > lo ? (v - lo) / (hi - lo) : 0.5;
                return `<button type="button" class="tile${t > 0.55 ? ' dark' : ''}" data-st="${st}" style="${pos};background:${shade(t)}" aria-pressed="${ui.state === st}"
                    aria-label="${esc(STATE_NAMES[st])}: ${v.toFixed(0)}" title="${esc(STATE_NAMES[st])}: ${v.toFixed(1)} (${M.metrosByState[st].length} metro area${M.metrosByState[st].length > 1 ? 's' : ''})">${st}<small>${v.toFixed(0)}</small></button>`;
            }).join('');
            document.getElementById('scaleLo').textContent = lo.toFixed(0);
            document.getElementById('scaleHi').textContent = hi.toFixed(0);
            const when = yi == null ? `${Y[0]}–${Y[Y.length - 1]} average` : Y[yi];
            document.getElementById('mapTitle').innerHTML = `${esc(label(c))} search interest by state <small>${esc(when)}</small>`;

            // Ranked metro areas (optionally within the selected state)
            const pool = (ui.state ? M.metrosByState[ui.state] : D.metros.map((_, i) => i)).map((i) => ({ i, v: M.metroScore(i, ci, yi) })).filter((x) => x.v != null);
            pool.sort((a, b) => (ui.rank === 'top' ? b.v - a.v : a.v - b.v));
            const top = pool.slice(0, 10);
            document.getElementById('rankTitle').innerHTML = `${ui.rank === 'top' ? 'Highest' : 'Lowest'} metro areas <small>${ui.state ? esc(STATE_NAMES[ui.state]) : 'United States'}</small>`;
            document.getElementById('rankList').innerHTML = top.length ? top.map(({ i, v }) => `<li><span class="bar-wrap" style="--w:${Math.max(2, v)}%"><span title="${esc(D.metros[i].name)}">${esc(D.metros[i].name)}</span></span><b>${v.toFixed(0)}</b></li>`).join('')
                : '<li class="chart-note" style="display:block">Not enough data for this selection.</li>';
            const best = M.states.filter((s) => vals[s] != null).sort((a, b) => vals[b] - vals[a]);
            document.getElementById('explorerNote').innerHTML =
                `Highest state average: <strong>${esc(STATE_NAMES[best[0]])}</strong> (${vals[best[0]].toFixed(1)}), lowest: <strong>${esc(STATE_NAMES[best[best.length - 1]])}</strong> (${vals[best[best.length - 1]].toFixed(1)}). ` +
                `Scores are relative within ${esc(label(c).toLowerCase())}${yi == null ? '' : ` in ${Y[yi]}`} (100 = the metro area with the highest share of searches). Click a state to filter the list and open its profile. ` +
                `Hatched states have no metro area of their own (NH, NJ, DE) or not enough data. Zeros — Google's "not enough data" — are excluded${yi == null ? `, and a metro needs data in at least ${M.MIN_YEARS} of ${Y.length} years` : ''}.`;
        }

        // State profile select
        const sel = document.getElementById('stateSel');
        sel.innerHTML = M.states.map((st) => `<option value="${st}">${esc(STATE_NAMES[st])}</option>`).join('');
        sel.value = 'MS';
        sel.addEventListener('change', () => renderProfile(M, sel.value));

        renderExplorer();

        try { await ARC.loadChartJs(); } catch {
            document.querySelectorAll('.chart-box').forEach((b) => { b.innerHTML = '<div class="alert err">Charts couldn\'t load (no connection to the chart library). The tables and map above still work.</div>'; });
            return;
        }
        const pairState = { a: M.pairs[0].a, b: M.pairs[0].b };
        const redraw = () => { renderScatter(M, pairState.a, pairState.b); renderProfile(M, sel.value); renderCdc(M); };
        document.getElementById('heatmap').addEventListener('click', (e) => {
            const b = e.target.closest('[data-a]'); if (!b) return;
            pairState.a = +b.dataset.a; pairState.b = +b.dataset.b;
            document.querySelectorAll('#heatmap td').forEach((td) => td.classList.toggle('on', td.firstElementChild === b));
            renderScatter(M, pairState.a, pairState.b);
            document.getElementById('scatterBox').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        });
        document.addEventListener('themechange', () => { renderExplorer(); redraw(); });
        redraw();
    }

    function renderFindings(M) {
        const box = document.getElementById('findings'); if (!box) return;
        const { C, D } = M;
        const topState = (ci) => M.states.filter((s) => M.stateScore(s, ci, null) != null).sort((a, b) => M.stateScore(b, ci, null) - M.stateScore(a, ci, null));
        const dia = C.indexOf('diabetes'), cv = C.indexOf('cardiovascular'), dep = C.indexOf('depression');
        const p0 = M.pairs[0], p1 = M.pairs[1], weak = M.pairs[M.pairs.length - 1];
        const names = (list) => list.map((s) => STATE_NAMES[s]).join(', ');
        const d = topState(dia), cvs = topState(cv), de = topState(dep);
        // External check (CDC diagnosed-diabetes prevalence): Mississippi and West Virginia are consistently among the highest.
        const cdcHigh = ['MS', 'WV', 'AL', 'LA', 'KY'].filter((s) => d.slice(0, 5).includes(s)).map((s) => STATE_NAMES[s]);
        const overall = M.complete.map((i) => ({ m: D.metros[i], v: mean(M.metroMean[i]) })).sort((a, b) => b.v - a.v);
        const items = [
            ['droplet', `Diabetes interest is highest in ${names(d.slice(0, 3))}`,
                cdcHigh.length ? `${cdcHigh.join(' and ')} ${cdcHigh.length > 1 ? 'are' : 'is'} also among the states with the highest diagnosed-diabetes rates in CDC surveillance — search interest follows the disease burden. Lowest: ${names(d.slice(-2))}.` : `Lowest: ${names(d.slice(-2))}.`],
            ['heart-pulse', `Heart-health searches concentrate in ${names(cvs.slice(0, 3))}`, `The least interest is in ${names(cvs.slice(-2))}.`],
            ['cloud-rain', `Depression searches peak in ${names(de.slice(0, 3))}`, `Lowest in ${names(de.slice(-2))}.`],
            ['link', `${label(C[p0.a])} & ${label(C[p0.b])} searches rise and fall together (r = ${p0.r.toFixed(2)})`, `Next is ${label(C[p1.a])} & ${label(C[p1.b])} (r = ${p1.r.toFixed(2)}). Weakest: ${label(C[weak.a])} & ${label(C[weak.b])} (r = ${weak.r.toFixed(2)}). Measured across the ${D.metros.length - M.sparse.length} metro areas with enough data.`],
            ['location-dot', `${overall[0].m.name} has the highest interest across all nine conditions`,
                `Average score ${overall[0].v.toFixed(1)}. Lowest: ${overall.slice(-3).reverse().map((o) => `${o.m.name} (${o.v.toFixed(1)})`).join(', ')} — in very large metros, health topics are a smaller share of everything people search for.${M.sparse.length ? ` ${M.sparse.join(', ')} ${M.sparse.length > 1 ? 'are' : 'is'} excluded: below Google's reporting threshold in most years.` : ''}`]
        ];
        box.innerHTML = items.map(([i, h, p]) => `<li class="card"><i class="fas fa-${i}" aria-hidden="true"></i><div><strong>${esc(h)}</strong><p>${esc(p)}</p></div></li>`).join('');
    }

    function renderCaveats(M) {
        const z = document.getElementById('zeroNote'); if (!z) return;
        const { Y } = M;
        z.textContent = `The typical (median) score rose from ${M.medians[0]} in ${Y[0]} to ${M.medians[M.medians.length - 1]} in ${Y[Y.length - 1]}, and the number of zero scores fell from ${M.zeros[0]} to ${M.zeros[M.zeros.length - 1]}. That reflects more metro areas crossing Google's minimum-volume threshold over time — not more people searching — so summing scores by year (as the original dashboard did) produces an artificial "growth" trend.`;
    }

    function renderHeatmap(M) {
        const box = document.getElementById('heatmap'); if (!box) return;
        const { C } = M;
        box.innerHTML = `<table class="heat"><caption class="visually-hidden">Correlation between search interest in each pair of conditions across metro areas</caption>
            <thead><tr><td></td>${C.map((c) => `<th scope="col">${esc(label(c))}</th>`).join('')}</tr></thead>
            <tbody>${C.map((a, ai) => `<tr><th scope="row">${esc(label(a))}</th>${C.map((b, bi) => {
                if (ai === bi) return '<td class="self">—</td>';
                const r = M.corr[ai][bi];
                const first = M.pairs[0];
                const on = (ai === first.a && bi === first.b);
                return `<td class="${on ? 'on' : ''}" style="background:${heatColor(r)};color:${Math.abs(r) > 0.55 ? '#fff' : 'var(--ink)'}"><button type="button" data-a="${Math.min(ai, bi)}" data-b="${Math.max(ai, bi)}" aria-label="${esc(label(a))} and ${esc(label(b))}: r = ${r.toFixed(2)}">${r.toFixed(2)}</button></td>`;
            }).join('')}</tr>`).join('')}</tbody></table>`;
    }

    function renderScatter(M, a, b) {
        const c = ARC.themeColors(), { C, D } = M;
        const pts = D.metros.map((m, i) => ({ x: M.metroMean[i][a], y: M.metroMean[i][b], m })).filter((p) => p.x != null && p.y != null);
        // least-squares line
        const xs = pts.map((p) => p.x), ys = pts.map((p) => p.y), mx = mean(xs), my = mean(ys);
        let sxy = 0, sxx = 0; xs.forEach((x, i) => { sxy += (x - mx) * (ys[i] - my); sxx += (x - mx) ** 2; });
        const slope = sxy / sxx, icpt = my - slope * mx, x0 = Math.min(...xs), x1 = Math.max(...xs);
        document.getElementById('scatterTitle').innerHTML = `${esc(label(C[a]))} vs ${esc(label(C[b]))} <small>r = ${M.corr[a][b].toFixed(2)} · ${pts.length} metro areas (${D.years[0]}–${D.years[D.years.length - 1]} average)</small>`;
        draw('scatterChart', {
            type: 'scatter',
            data: { datasets: [
                { label: 'Metro areas', data: pts, backgroundColor: 'rgba(10,108,255,.5)', borderColor: 'rgba(10,108,255,.9)', pointRadius: 3.5, pointHoverRadius: 6 },
                { type: 'line', label: 'Trend', data: [{ x: x0, y: icpt + slope * x0 }, { x: x1, y: icpt + slope * x1 }], borderColor: '#7c3aed', borderWidth: 2.5, pointRadius: 0 }
            ] },
            options: {
                responsive: true, maintainAspectRatio: false, animation: { duration: 300 },
                plugins: { legend: { display: false }, tooltip: { callbacks: { label: (ctx) => (ctx.raw.m ? `${ctx.raw.m.name}: ${ctx.raw.x.toFixed(0)}, ${ctx.raw.y.toFixed(0)}` : 'Trend') } } },
                scales: { x: axis(c, `${label(C[a])} interest`), y: axis(c, `${label(C[b])} interest`) }
            }
        });
    }

    function renderProfile(M, st) {
        const { C, D } = M;
        const vals = C.map((_, ci) => M.stateScore(st, ci, null));
        const diff = vals.map((v, ci) => ({ c: C[ci], d: v == null ? 0 : v - M.national[ci], v }));
        const above = diff.filter((x) => x.d > 3).sort((a, b) => b.d - a.d), below = diff.filter((x) => x.d < -3).sort((a, b) => a.d - b.d);
        const metros = M.metrosByState[st].map((i) => D.metros[i].name);
        document.getElementById('profileNote').innerHTML =
            `<strong>${esc(STATE_NAMES[st])}</strong> (${metros.length} metro area${metros.length > 1 ? 's' : ''}: ${esc(metros.join('; '))}). ` +
            (above.length ? `Noticeably above the national average for <strong>${esc(above.map((x) => label(x.c)).join(', '))}</strong>. ` : '') +
            (below.length ? `Below average for <strong>${esc(below.map((x) => label(x.c)).join(', '))}</strong>.` : '') +
            (!above.length && !below.length ? 'Close to the national average for every condition.' : '');
        const c = ARC.themeColors();
        draw('profileChart', {
            type: 'bar',
            data: { labels: C.map(label), datasets: [
                { label: STATE_NAMES[st], data: vals, backgroundColor: '#0a6cff', borderRadius: 6 },
                { label: 'All metro areas', data: M.national, backgroundColor: 'rgba(124,58,237,.35)', borderRadius: 6 }
            ] },
            options: { responsive: true, maintainAspectRatio: false, animation: { duration: 300 },
                plugins: { legend: { labels: { color: c.ink2, usePointStyle: true, boxWidth: 8 } }, tooltip: { callbacks: { label: (ctx) => `${ctx.dataset.label}: ${ctx.raw.toFixed(1)}` } } },
                scales: { x: { ...axis(c), grid: { display: false } }, y: { ...axis(c, 'Average interest (0–100)'), min: 0, max: 100 } } }
        });
    }

    function renderCdcCards(M) {
        const box = document.getElementById('cdcCards'); if (!box) return;
        const { cdcYears: Y } = M;
        const sorted = [...M.cdc].sort((a, b) => b.change - a.change);
        const pick = [sorted[0], sorted[1], sorted[2], sorted[sorted.length - 2], sorted[sorted.length - 1]];
        box.innerHTML = pick.map((x) => `<article class="card stat-card">
            <h3><span>${esc(x.label)}</span><span class="strength ${x.change > 0 ? 'moderate' : 'strong'}">${pct(x.change)}</span></h3>
            <dl><dt>${Y[0]}</dt><dd>${x.first.toFixed(1)}</dd><dt>${Y[Y.length - 1]}</dt><dd>${x.last.toFixed(1)}</dd></dl>
            <p>Deaths per 100,000 people, age-adjusted.</p></article>`).join('');
    }

    function renderCdc(M) {
        const c = ARC.themeColors();
        draw('cdcChart', {
            type: 'line',
            data: { labels: M.cdcYears, datasets: M.cdc.map((x, i) => ({ label: x.label, data: x.values, borderColor: CAUSE_COLORS[i], backgroundColor: CAUSE_COLORS[i], borderWidth: 2.2, pointRadius: 2, tension: .3 })) },
            options: { responsive: true, maintainAspectRatio: false, animation: { duration: 300 }, interaction: { mode: 'index', intersect: false },
                plugins: { legend: { position: 'bottom', labels: { color: c.ink2, usePointStyle: true, boxWidth: 8 } } },
                scales: { x: axis(c), y: { ...axis(c, 'Deaths per 100,000 (age-adjusted)'), type: 'logarithmic', ticks: { color: c.ink3, callback: (v) => ([10, 20, 50, 100, 200].includes(v) ? v : '') } } } }
        });
    }

    /* ---------- Assistant knowledge generated from the data ---------- */
    function addKnowledge(M) {
        if (!window.ARC || !ARC.KB) return;
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
                a: `**${label(c)} — where interest is highest** (${D.years[0]}–${D.years[D.years.length - 1]} average, 0–100 scale)\n\n` +
                   `- **Top states:** ${r.slice(0, 3).map((s) => `${STATE_NAMES[s]} (${M.stateScore(s, ci, null).toFixed(0)})`).join(', ')}\n` +
                   `- **Lowest states:** ${r.slice(-2).map((s) => `${STATE_NAMES[s]} (${M.stateScore(s, ci, null).toFixed(0)})`).join(', ')}\n` +
                   `- **Top metro area:** ${metros[0].m.name} (${metros[0].v.toFixed(0)})\n` +
                   `- **Searched together with:** ${rel.join(', ')}\n\n` +
                   `Scores compare places *within* ${label(c).toLowerCase()}; they can't be compared with other conditions.`,
                actions: [{ label: 'Open the map', action: 'scroll:#explore' }] });
        });
        M.states.forEach((st) => {
            const vals = C.map((_, ci) => ({ c: C[ci], s: M.stateScore(st, ci, null) })).filter((x) => x.s != null).map((x) => ({ c: x.c, d: x.s - M.national[C.indexOf(x.c)] })).sort((a, b) => b.d - a.d);
            if (vals.length < 4) return;
            const n = M.metrosByState[st].length;
            ARC.KB.push({ id: `gh-s-${st}`, topic: 'project', title: `${STATE_NAMES[st]} health searches`,
                q: [`what does ${STATE_NAMES[st].toLowerCase()} search for`, `${STATE_NAMES[st].toLowerCase()} health trends`, `tell me about ${STATE_NAMES[st].toLowerCase()}`],
                k: [STATE_NAMES[st].toLowerCase(), 'state', 'profile'],
                a: `**${STATE_NAMES[st]}** — ${n} Google metro area${n > 1 ? 's' : ''} in the data.\n\n` +
                   `- **Strongest relative interest:** ${vals.slice(0, 2).map((x) => `${label(x.c)} (${x.d >= 0 ? '+' : ''}${x.d.toFixed(1)})`).join(', ')}\n` +
                   `- **Weakest relative interest:** ${vals.slice(-2).reverse().map((x) => `${label(x.c)} (${x.d >= 0 ? '+' : ''}${x.d.toFixed(1)})`).join(', ')}\n\n` +
                   `Numbers are points above (+) or below (−) the average of all metro areas` + (vals[0].d < 0 ? ` — ${STATE_NAMES[st]} is below average for every condition, as large metros tend to be.` : '.') + ` ` +
                   `Google's 0–100 relative-interest scale, averaged over ${D.years[0]}–${D.years[D.years.length - 1]}.`,
                actions: [{ label: 'See the state profile', action: 'scroll:#states' }] });
        });
        const pr = M.pairs;
        ARC.KB.push({ id: 'gh-corr', topic: 'project', title: 'Which conditions are searched together?',
            q: ['which conditions are correlated', 'is diabetes correlated with depression', 'which searches go together', 'correlation between conditions'],
            k: ['correlation', 'correlated', 'related', 'together', 'relationship', 'pearson', 'heatmap'],
            a: `Correlation of search interest across the ${D.metros.length - M.sparse.length} metro areas with enough data (${D.years.length}-year averages):\n\n**Strongest pairs**\n${pr.slice(0, 4).map((p) => `- ${label(C[p.a])} & ${label(C[p.b])}: r = ${p.r.toFixed(2)}`).join('\n')}\n\n**Weakest pairs**\n${pr.slice(-3).reverse().map((p) => `- ${label(C[p.a])} & ${label(C[p.b])}: r = ${p.r.toFixed(2)}`).join('\n')}\n\nPlaces with high interest in one tend to have high interest in the other — this is geographic co-occurrence, not evidence that one condition causes another.`,
            actions: [{ label: 'Open the heatmap', action: 'scroll:#correlations' }] });
        const s = [...M.cdc].sort((a, b) => b.change - a.change);
        ARC.KB.push({ id: 'gh-cdc', topic: 'project', title: 'CDC leading causes of death',
            q: ['how did death rates change', 'cdc leading causes of death', 'which causes of death increased', 'cdc mortality trends'],
            k: ['cdc', 'death', 'deaths', 'mortality', 'causes', 'died', 'leading causes'],
            a: `US age-adjusted death rates per 100,000, ${M.cdcYears[0]} → ${M.cdcYears[M.cdcYears.length - 1]}:\n\n**Rising:** ${s.slice(0, 3).map((x) => `${x.label} ${pct(x.change)}`).join(', ')}\n**Falling most:** ${s.slice(-3).reverse().map((x) => `${x.label} ${pct(x.change)}`).join(', ')}\n\nHeart disease and cancer remain the two leading causes. (The 2017 cancer rate was corrected from a typo of 52.5 to the CDC's 152.5.)`,
            actions: [{ label: 'See the chart', action: 'scroll:#cdc' }] });
    }

    /* ---------- Data page ---------- */
    function initData() {
        let M;
        try { M = load(); } catch { failAll(); return; }
        const { D, C, Y } = M;
        const rows = [];
        D.metros.forEach((m, i) => Y.forEach((y, yi) => {
            const r = { metro: m.name, state: m.state, year: y };
            C.forEach((c, ci) => { r[c] = D.values[i][yi][ci]; });
            rows.push(r);
        }));
        const k = (id, v) => { const e = document.getElementById(id); if (e) e.textContent = v; };
        DataTable.mount(document.getElementById('searchTable'), {
            id: 'gh', rows, fileName: 'google-health-search-interest', pageSize: 25, caption: 'Google Trends search interest by metro area and year',
            columns: [
                { key: 'metro', label: 'Metro area' },
                { key: 'state', label: 'State', filter: true, filterLabel: 'states' },
                { key: 'year', label: 'Year', type: 'number', filter: true, filterLabel: 'years' },
                ...C.map((c) => ({ key: c, label: label(c), type: 'number' }))
            ],
            onChange: (view) => {
                k('kRows', view.length.toLocaleString());
                k('kMetros', new Set(view.map((r) => r.metro)).size);
                k('kStates', new Set(view.map((r) => r.state)).size);
                k('kYears', new Set(view.map((r) => r.year)).size);
            }
        });
        DataTable.mount(document.getElementById('cdcTable'), {
            id: 'cdc', fileName: 'cdc-leading-causes-of-death', pageSize: 25, caption: 'CDC age-adjusted death rates per 100,000',
            rows: M.cdcYears.map((y, yi) => Object.fromEntries([['year', y], ...M.cdc.map((x) => [x.key, x.values[yi]])])),
            columns: [{ key: 'year', label: 'Year', type: 'number' }, ...M.cdc.map((x) => ({ key: x.key, label: x.label, type: 'number' }))]
        });
    }

    return { load, initOverview, initData, LABELS, addKnowledge: () => addKnowledge(load()) };
})();
