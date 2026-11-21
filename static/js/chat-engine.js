/* Health Analytics Assistant — runs entirely in the browser (no server, no database).
 *
 * This is a port of the old Python /api/chat endpoint. It answers from the pre-computed dataset in
 * static/data/allsearchrecord.json (built by tools/build_static.py), so every number it states is
 * calculated from the project data rather than written by hand.
 *
 * Usage: const reply = await HealthChatEngine.ask('Tell me about diabetes');
 * `reply` has the same shape the old endpoint returned ({ success, response, entities, ... }).
 */
'use strict';
(function (root) {
    // Resolve the data folder relative to this script, so it works from any page depth and on any host.
    const SCRIPT_SRC = (document.currentScript && document.currentScript.src) || root.location.href;
    const DATA_URL = new URL('../data/allsearchrecord.json', SCRIPT_SRC).href;

    // Column names as they appear in the data (Cancer is capitalised in the source table).
    const CONDITIONS = {
        cancer: 'Cancer', cardiovascular: 'cardiovascular', stroke: 'stroke', depression: 'depression',
        rehab: 'rehab', vaccine: 'vaccine', diarrhea: 'diarrhea', obesity: 'obesity', diabetes: 'diabetes'
    };
    const COND_KEYS = Object.keys(CONDITIONS);
    const ALIASES = {
        cancer: ['cancer', 'tumor', 'malignancy', 'oncology'],
        cardiovascular: ['cardiovascular', 'heart', 'cardiac'],
        stroke: ['stroke', 'cerebrovascular', 'brain attack'],
        depression: ['depression', 'mental health', 'mood'],
        obesity: ['obesity', 'overweight', 'bmi'],
        diabetes: ['diabetes', 'blood sugar', 'diabetic'],
        vaccine: ['vaccine', 'vaccination', 'immunization'],
        rehab: ['rehab', 'rehabilitation'],
        diarrhea: ['diarrhea', 'gastrointestinal']
    };

    const DEFINITIONS = {
        cancer: { definition: 'A group of diseases involving abnormal cell growth with the potential to invade or spread to other parts of the body.', risk: 'Age, family history, tobacco use, alcohol, obesity, radiation exposure' },
        diabetes: { definition: 'A metabolic disease that causes high blood sugar because the body makes too little insulin or cannot use it effectively.', risk: 'Family history, excess weight, physical inactivity, age' },
        depression: { definition: 'A common mental disorder characterised by persistent sadness, loss of interest and decreased energy.', risk: 'Family history, major life changes, trauma, chronic illness' },
        obesity: { definition: 'A complex disease involving excessive body fat that increases the risk of other health problems.', risk: 'Diet, physical inactivity, genetics, some medications' },
        cardiovascular: { definition: 'Diseases of the heart and blood vessels, including coronary artery disease and heart failure.', risk: 'High blood pressure, high cholesterol, smoking, diabetes' },
        stroke: { definition: 'Interrupted blood supply to part of the brain, which damages brain tissue.', risk: 'High blood pressure, smoking, diabetes, heart disease' },
        vaccine: { definition: 'Searches related to vaccination and immunisation.' },
        rehab: { definition: 'Searches related to rehabilitation and recovery services.' },
        diarrhea: { definition: 'Searches related to diarrhoea and gastrointestinal illness.' }
    };

    const TEAM = {
        'Ermias Gaga': {
            keys: ['ermias', 'gaga'], role: 'Data Scientist & Researcher (Project Lead)',
            expertise: ['Data Analytics', 'Cognitive Science', 'Psychology', 'Quantitative Methods'],
            contribution: ['Data processing', 'Statistical analysis', 'Visualization development', 'Project coordination'],
            tools: ['Python', 'SQL', 'D3.js', 'Tableau'],
            bio: 'Data-driven researcher with expertise in analytics, cognitive science, and psychology.',
            linkedin: 'https://www.linkedin.com/in/ermiasgaga/', github: 'https://github.com/ErmiasGaga'
        },
        'Amanda Qianyue Ma': {
            keys: ['amanda', 'qianyue'], role: 'Economics & Analytics Specialist',
            expertise: ['Economics', 'Psychology', 'Philosophy', 'Data Analysis'],
            contribution: ['Economic analysis', 'Data interpretation', 'Research methodology', 'Documentation'],
            tools: ['Python', 'R', 'Excel', 'Statistical Analysis'],
            bio: 'Economics and psychology background with strong analytical and critical thinking skills.',
            linkedin: 'https://www.linkedin.com/in/amandaqianyuema/', github: 'https://github.com/AmandaMa77'
        },
        'Amos Johnson': {
            keys: ['amos', 'johnson'], role: 'Data Journalist & Analyst',
            expertise: ['Data Journalism', 'Storytelling', 'Research', 'Writing'],
            contribution: ['Data storytelling', 'Report writing', 'User experience design', 'Content creation'],
            tools: ['Python', 'SQL', 'D3.js', 'Data Visualization'],
            bio: 'Journalism graduate specializing in data storytelling and visualization.',
            linkedin: 'https://www.linkedin.com/in/amosjohnson/', github: 'https://github.com/AmosJohnson'
        },
        'Adedamola Atekoja': {
            keys: ['damola', 'atekoja', 'adedamola'], role: 'Chartered Accountant & Data Analyst',
            expertise: ['Financial Analysis', 'Accounting', 'Data Analytics', 'Project Management'],
            contribution: ['Financial modeling', 'Data validation', 'Quality assurance', 'Project planning'],
            tools: ['Excel', 'VBA', 'Python', 'SQL'],
            bio: 'Chartered accountant with consulting experience at Big Four firms.',
            linkedin: 'https://www.linkedin.com/in/damola-atekoja/', github: 'https://github.com/DamolaAtekoja'
        },
        'Maria Lorena': {
            keys: ['maria', 'lorena'], role: 'Project Manager & Data Analyst',
            expertise: ['Project Management', 'Data Analysis', 'Multilingual Communication', 'Customer Service'],
            contribution: ['Project coordination', 'Team management', 'Stakeholder communication', 'Process optimization'],
            tools: ['Project Management Tools', 'Python', 'SQL', 'Data Analysis'],
            bio: 'An experienced trilingual Project Manager focusing on data analysis projects at the University of Toronto, and working at JP Morgan Chase.',
            linkedin: 'https://www.linkedin.com/in/marialorena-nunez/', github: 'https://github.com/MariaLoren'
        }
    };

    // ---------- Data & statistics (computed once, on first question) ----------
    let statsPromise = null;
    const loadStats = () => statsPromise || (statsPromise = fetch(DATA_URL)
        .then((r) => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
        .then((json) => computeStats(json.data))
        .catch((e) => { statsPromise = null; throw e; }));

    const sum = (a) => a.reduce((s, v) => s + v, 0);
    const fmt = (n) => Math.round(n).toLocaleString('en-US');
    const pct = (n) => `${n.toFixed(1)}%`;
    const title = (s) => s.charAt(0).toUpperCase() + s.slice(1);

    function pearson(xs, ys) {
        const n = xs.length, mx = sum(xs) / n, my = sum(ys) / n;
        let num = 0, dx = 0, dy = 0;
        for (let i = 0; i < n; i++) { const a = xs[i] - mx, b = ys[i] - my; num += a * b; dx += a * a; dy += b * b; }
        return dx && dy ? num / Math.sqrt(dx * dy) : 0;
    }

    function computeStats(rows) {
        const val = (r, c) => Number(r[CONDITIONS[c]]) || 0;
        const rowTotal = (r) => sum(COND_KEYS.map((c) => val(r, c)));
        const years = [...new Set(rows.map((r) => r.year))].sort((a, b) => a - b);
        const states = [...new Set(rows.map((r) => r.state))].sort();
        const cities = new Set(rows.map((r) => r.city));

        const totals = {}; COND_KEYS.forEach((c) => { totals[c] = sum(rows.map((r) => val(r, c))); });
        const grand = sum(Object.values(totals));

        const byState = {};      // state -> { total, cond: {c: n}, years: {y: n} }
        const byYearCond = {};   // c -> { y: n }
        COND_KEYS.forEach((c) => { byYearCond[c] = {}; });
        rows.forEach((r) => {
            const s = byState[r.state] || (byState[r.state] = { total: 0, cond: {}, years: {}, yearsCond: {} });
            COND_KEYS.forEach((c) => {
                const v = val(r, c);
                s.cond[c] = (s.cond[c] || 0) + v;
                byYearCond[c][r.year] = (byYearCond[c][r.year] || 0) + v;
                const yc = s.yearsCond[c] || (s.yearsCond[c] = {});
                yc[r.year] = (yc[r.year] || 0) + v;
            });
            const t = rowTotal(r);
            s.total += t;
            s.years[r.year] = (s.years[r.year] || 0) + t;
        });
        const yearTotals = years.map((y) => sum(COND_KEYS.map((c) => byYearCond[c][y] || 0)));

        const corr = {};
        COND_KEYS.forEach((a) => COND_KEYS.forEach((b) => {
            if (a < b) corr[`${a}|${b}`] = pearson(rows.map((r) => val(r, a)), rows.map((r) => val(r, b)));
        }));

        return { rows, years, states, cityCount: cities.size, totals, grand, byState, byYearCond, yearTotals, corr };
    }

    const correlation = (S, a, b) => (a === b ? 1 : S.corr[a < b ? `${a}|${b}` : `${b}|${a}`]);
    const rankStates = (S, cond) => S.states
        .map((st) => ({ state: st, value: cond ? S.byState[st].cond[cond] : S.byState[st].total }))
        .sort((x, y) => y.value - x.value);
    const growth = (first, last) => (first > 0 ? ((last - first) / first) * 100 : null);

    // ---------- Understanding the question ----------
    const has = (q, words) => words.some((w) => new RegExp(`\\b${w}\\b`).test(q));

    function extractEntities(question, S) {
        const q = question.toLowerCase();
        const e = { condition: null, condition2: null, state: null, year: null, member: null, intent: null };
        if (has(q, ['hi', 'hello', 'hey', 'greetings'])) e.intent = 'greeting';
        if (has(q, ['thanks', 'thank', 'appreciate', 'thx'])) e.intent = 'thanks';
        if (has(q, ['bye', 'goodbye', 'farewell']) || q.includes('see you')) e.intent = 'farewell';
        if (has(q, ['help']) || q.includes('what can you')) e.intent = 'help';

        const found = [];
        COND_KEYS.forEach((c) => {
            const i = Math.min(...ALIASES[c].map((a) => { const m = q.search(new RegExp(`\\b${a}`)); return m < 0 ? Infinity : m; }));
            if (i !== Infinity) found.push([i, c]);
        });
        found.sort((a, b) => a[0] - b[0]);
        if (found[0]) e.condition = found[0][1];
        if (found[1]) e.condition2 = found[1][1];

        if (S) {
            // Longest name first so "West Virginia" wins over "Virginia".
            const st = [...S.states].sort((a, b) => b.length - a.length).find((s) => q.includes(s.toLowerCase()));
            if (st) e.state = st;
        }
        const y = question.match(/\b(200[4-9]|201[0-7])\b/);
        if (y) e.year = y[0];
        const member = Object.entries(TEAM).find(([, m]) => has(q, m.keys));
        if (member) e.member = member[0];
        return e;
    }

    function responseType(question, e) {
        const q = question.toLowerCase();
        const asksCorrelation = has(q, ['correlation', 'correlate', 'correlated', 'relationship', 'related', 'compare', 'vs', 'versus', 'link', 'linked', 'pearson']);
        const asksTopStates = has(q, ['top', 'highest', 'most', 'rank', 'ranking', 'which']) && has(q, ['state', 'states', 'region', 'regions']);
        if (e.member) return 'specific_member';
        if (e.condition && e.condition2 && asksCorrelation) return 'correlation';
        if (e.condition && e.state) return 'state_analysis';
        if (asksTopStates && !e.state) return 'top_states';
        if (e.condition) return 'specific_condition';
        if (e.state) return 'state_analysis';
        if (asksCorrelation) return 'correlation';
        if (has(q, ['team', 'members', 'who', 'contributors', 'people', 'creators'])) return 'team_members';
        if (has(q, ['trend', 'over time', 'yearly', 'growth', 'timeline', 'year'])) return 'time_series';
        if (has(q, ['source', 'sources', 'dataset', 'cdc', 'google trends', 'collected', 'origin'])) return 'data_sources';
        if (has(q, ['methodology', 'method', 'approach', 'technical', 'process', 'how'])) return 'methodology';
        if (has(q, ['finding', 'findings', 'result', 'results', 'insight', 'insights', 'discover', 'conclusion'])) return 'key_findings';
        if (has(q, ['conditions', 'diseases', 'topics', 'list'])) return 'health_conditions';
        if (e.intent) return e.intent;
        if (has(q, ['project', 'overview', 'about', 'purpose', 'goal', 'dashboard'])) return 'project_overview';
        return 'general';
    }

    // ---------- Answers ----------
    const A = {};
    const pick = (a) => a[Math.floor(Math.random() * a.length)];

    A.greeting = () => pick([
        "Hello! 👋 I'm your Health Analytics Assistant. How can I help you explore the health search data today?",
        'Hi there! 🏥 Ready to dive into health analytics? Ask me about a condition, a state, or the project.',
        "Greetings! 🦅 Welcome to Eagle Health Analytics. I'm here to help you understand health search patterns and trends."
    ]);
    A.thanks = () => "You're welcome! 😊 Feel free to ask if you have more questions about the project.";
    A.farewell = () => pick(['Goodbye! 👋 Thanks for exploring health analytics with me.', 'See you later! 🏥 Hope the insights were useful.', 'Take care! 🦅 Stay healthy and curious about data!']);

    A.help = () => `**🦅 Eagle Health Analytics Assistant — Help**

**I can help you with:**
📊 **The project** — overview, data sources, methodology, key findings
🏥 **Conditions** — cancer, diabetes, depression, obesity, cardiovascular, stroke, vaccine, rehab, diarrhea
🗺️ **States** — totals, trends and top conditions for any state in the data
🔗 **Correlations** — how strongly two conditions move together
👥 **The team** — who worked on the project

**Try asking:**
• "Tell me about cancer"
• "Show me California health trends"
• "Is diabetes correlated with depression?"
• "Which states search most for obesity?"
• "What are the key findings?"`;

    A.specific_condition = (S, e) => {
        const c = e.condition, def = DEFINITIONS[c] || {};
        const rank = Object.entries(S.totals).sort((a, b) => b[1] - a[1]).findIndex(([k]) => k === c) + 1;
        const top = rankStates(S, c).slice(0, 3);
        const series = S.years.map((y) => S.byYearCond[c][y] || 0);
        const g = growth(series[0], series[series.length - 1]);
        const partners = COND_KEYS.filter((k) => k !== c).map((k) => [k, correlation(S, c, k)]).sort((a, b) => b[1] - a[1]);
        let r = `**${title(c)} — Health Search Analysis** 🏥\n\n`;
        if (def.definition) r += `**Definition:** ${def.definition}\n\n`;
        r += `**📊 Search interest (${S.years[0]}–${S.years[S.years.length - 1]}):**\n`;
        r += `• Total interest score: **${fmt(S.totals[c])}** (${pct((S.totals[c] / S.grand) * 100)} of all searches tracked)\n`;
        r += `• Rank: **#${rank} of ${COND_KEYS.length}** conditions\n`;
        if (g !== null) r += `• Change ${S.years[0]}→${S.years[S.years.length - 1]}: **${g >= 0 ? '+' : ''}${pct(g)}**\n`;
        r += `\n**🗺️ Top states:**\n`;
        top.forEach((t, i) => { r += `${i + 1}. ${t.state}: ${fmt(t.value)}\n`; });
        r += `\n**🔗 Most closely related searches:**\n`;
        partners.slice(0, 2).forEach(([k, v]) => { r += `• ${title(k)} (r = ${v.toFixed(2)})\n`; });
        if (def.risk) r += `\n**⚠️ Risk factors:** ${def.risk}\n`;
        r += `\n_Values are Google Trends interest scores (0–100 per metro area per year), summed._`;
        return r;
    };

    A.state_analysis = (S, e) => {
        const st = e.state, s = S.byState[st], c = e.condition;
        const yearsOf = (obj) => S.years.map((y) => obj[y] || 0);
        const series = c ? yearsOf(s.yearsCond[c]) : yearsOf(s.years);
        const total = sum(series);
        const g = growth(series[0], series[series.length - 1]);
        const rank = rankStates(S, c).findIndex((x) => x.state === st) + 1;
        let r = `**${st}${c ? ` — ${title(c)}` : ''} — Health Search Analysis** 🗺️\n\n`;
        r += `**📊 Summary:**\n`;
        r += `• Total interest score: **${fmt(total)}** (${pct((total / (c ? S.totals[c] : S.grand)) * 100)} of the national total)\n`;
        r += `• Rank: **#${rank} of ${S.states.length}** states\n`;
        r += `• Average per year: **${fmt(total / S.years.length)}**\n`;
        if (g !== null) r += `• Change ${S.years[0]}→${S.years[S.years.length - 1]}: **${g >= 0 ? '+' : ''}${pct(g)}**\n`;
        r += `\n**📈 Last 3 years:**\n`;
        S.years.slice(-3).forEach((y, i) => { r += `• **${y}**: ${fmt(series[series.length - 3 + i])}\n`; });
        if (!c) {
            const topC = Object.entries(s.cond).sort((a, b) => b[1] - a[1]).slice(0, 3);
            r += `\n**🏥 Most searched conditions:**\n`;
            topC.forEach(([k, v], i) => { r += `${i + 1}. ${title(k)}: ${fmt(v)}\n`; });
        }
        return r;
    };

    A.correlation = (S, e) => {
        if (e.condition && e.condition2) {
            const v = correlation(S, e.condition, e.condition2);
            const strength = Math.abs(v) >= 0.7 ? 'strong' : Math.abs(v) >= 0.4 ? 'moderate' : 'weak';
            return `**🔗 ${title(e.condition)} vs ${title(e.condition2)}**\n\n` +
                `Pearson correlation across ${fmt(S.rows.length)} metro-area-years: **r = ${v.toFixed(2)}** (${strength}, ${v >= 0 ? 'positive' : 'negative'}).\n\n` +
                `This means places and years with more interest in ${e.condition} ${v >= 0 ? 'tend to also show more' : 'tend to show less'} interest in ${e.condition2}. ` +
                `Correlation shows the searches move together — not that one causes the other.`;
        }
        const pairs = Object.entries(S.corr).sort((a, b) => b[1] - a[1]);
        const line = ([k, v]) => { const [a, b] = k.split('|'); return `• ${title(a)} & ${title(b)}: r = ${v.toFixed(2)}`; };
        return `**🔗 Correlation Analysis**\n\nPearson correlations between search interest for each pair of conditions (${fmt(S.rows.length)} metro-area-years).\n\n` +
            `**Strongest pairs:**\n${pairs.slice(0, 3).map(line).join('\n')}\n\n**Weakest pairs:**\n${pairs.slice(-3).reverse().map(line).join('\n')}\n\n` +
            `Ask about a specific pair, e.g. "Is diabetes correlated with depression?"`;
    };

    A.top_states = (S, e) => {
        const top = rankStates(S, e.condition).slice(0, 5);
        const base = e.condition ? S.totals[e.condition] : S.grand;
        return `**🗺️ Top states${e.condition ? ` for ${title(e.condition)}` : ''}**\n\n` +
            top.map((t, i) => `${i + 1}. **${t.state}** — ${fmt(t.value)} (${pct((t.value / base) * 100)})`).join('\n') +
            `\n\n_States with more metro areas in the data naturally score higher in total._`;
    };

    A.time_series = (S) => {
        const first = S.yearTotals[0], last = S.yearTotals[S.yearTotals.length - 1];
        const peakI = S.yearTotals.indexOf(Math.max(...S.yearTotals));
        const changes = COND_KEYS.map((c) => [c, growth(S.byYearCond[c][S.years[0]], S.byYearCond[c][S.years[S.years.length - 1]])])
            .filter(([, g]) => g !== null).sort((a, b) => b[1] - a[1]);
        return `**📈 Search trends over time (${S.years[0]}–${S.years[S.years.length - 1]})**\n\n` +
            `• Overall change: **${growth(first, last) >= 0 ? '+' : ''}${pct(growth(first, last))}**\n` +
            `• Peak year: **${S.years[peakI]}**\n\n**Fastest growing:**\n` +
            changes.slice(0, 3).map(([c, g]) => `• ${title(c)}: ${g >= 0 ? '+' : ''}${pct(g)}`).join('\n') +
            `\n\n**Slowest growing / declining:**\n` + changes.slice(-3).reverse().map(([c, g]) => `• ${title(c)}: ${g >= 0 ? '+' : ''}${pct(g)}`).join('\n');
    };

    A.key_findings = (S) => {
        const ranked = Object.entries(S.totals).sort((a, b) => b[1] - a[1]);
        const [topPair, topR] = Object.entries(S.corr).sort((a, b) => b[1] - a[1])[0];
        const [p1, p2] = topPair.split('|');
        const states = rankStates(S);
        const g = growth(S.yearTotals[0], S.yearTotals[S.yearTotals.length - 1]);
        return `**📊 Key Findings & Insights** 🎯\n\n` +
            `1. **${title(ranked[0][0])}** is the most searched condition (${pct((ranked[0][1] / S.grand) * 100)} of all interest), followed by ${title(ranked[1][0])} and ${title(ranked[2][0])}.\n` +
            `2. **${title(ranked[ranked.length - 1][0])}** has the least search interest.\n` +
            `3. **${title(p1)} & ${title(p2)}** searches are the most closely linked (r = ${topR.toFixed(2)}).\n` +
            `4. **${states[0].state}, ${states[1].state} and ${states[2].state}** have the highest total search interest.\n` +
            `5. Overall search interest changed **${g >= 0 ? '+' : ''}${pct(g)}** from ${S.years[0]} to ${S.years[S.years.length - 1]}.\n\n` +
            `**🏥 Why it matters:** search behaviour can act as an early, low-cost signal of public health concern, ` +
            `and regional patterns can help target health campaigns. Compare these trends with CDC leading causes of death on the Analytics dashboard.`;
    };

    A.project_overview = (S) => `**🏥 Eagle Health Analytics — Project Overview** 🦅\n\n` +
        `**🎯 Scope:**\n• **${S.years.length} years** of data (${S.years[0]}–${S.years[S.years.length - 1]})\n• **${COND_KEYS.length} health conditions**\n` +
        `• **${S.states.length} US states**, **${S.cityCount} metro areas**\n• **${fmt(S.rows.length * COND_KEYS.length)} data points**\n\n` +
        `**📊 Objectives:**\n1. Compare Google search trends with CDC health statistics\n2. Identify regional health concerns\n3. Track public health awareness over time\n4. Provide insights for public health planning\n\n` +
        `**💡 Why it matters:** it shows how public interest in health topics relates to real health outcomes.`;

    A.data_sources = (S) => `**📊 Data Sources** 🔗\n\n` +
        `1. **Google Trends** — search interest for ${COND_KEYS.length} conditions across ${S.cityCount} US metro areas, ${S.years[0]}–${S.years[S.years.length - 1]}\n` +
        `2. **CDC** — age-adjusted death rates for the 10 leading causes of death\n3. **Geographic data** — city/state names and coordinates for mapping\n\n` +
        `**🔄 Pipeline:** Python & Pandas for cleaning → PostgreSQL for storage → JSON for the dashboards.\n\n` +
        `**🔧 Stack:** Python, Pandas, SQL, JavaScript, Plotly, D3.js, Highcharts, Bootstrap.\n\n` +
        `The raw data is available under **API Links** in the menu.`;

    A.methodology = () => `**🔬 Methodology** 🛠️\n\n` +
        `**1. 📥 Collect** — Google Trends search interest and CDC mortality data.\n` +
        `**2. 🧹 Clean** — Python/Pandas: reshape, fix missing values, join with locations.\n` +
        `**3. 🗄️ Store** — PostgreSQL schema (location, search_condition, leading_causes_of_death).\n` +
        `**4. 📊 Analyse** — totals by year/state/city, Pearson correlations between conditions, trend comparison with CDC rates.\n` +
        `**5. 🎨 Visualise** — interactive Plotly, D3 and Highcharts dashboards.\n\n` +
        `This assistant computes its answers live in your browser from the same dataset.`;

    A.health_conditions = (S) => {
        const ranked = Object.entries(S.totals).sort((a, b) => b[1] - a[1]);
        return `**🏥 Health Conditions Analysed** 📊\n\nRanked by total search interest:\n\n` +
            ranked.map(([c, v], i) => `${i + 1}. **${title(c)}** — ${fmt(v)} (${pct((v / S.grand) * 100)})`).join('\n') +
            `\n\n💡 Ask about any condition for details, e.g. "Tell me about obesity".`;
    };

    A.team_members = () => `**👥 Eagle Health Analytics Team**\n\n` +
        Object.entries(TEAM).map(([n, m]) => `**${n}**\n• Role: ${m.role}\n• Expertise: ${m.expertise.slice(0, 2).join(', ')}\n• Key contribution: ${m.contribution[0]}`).join('\n\n') +
        `\n\nAsk about a specific member, e.g. "Tell me about Ermias".`;

    A.specific_member = (S, e) => {
        const m = TEAM[e.member];
        return `**${e.member} — Team Member Profile** 👥\n\n**🎯 Role:** ${m.role}\n\n**📝 Bio:** ${m.bio}\n\n` +
            `**🔧 Expertise:**\n${m.expertise.map((x) => `• ${x}`).join('\n')}\n\n**🛠️ Tools:**\n${m.tools.map((x) => `• ${x}`).join('\n')}\n\n` +
            `**🎖️ Contributions:**\n${m.contribution.slice(0, 3).map((x, i) => `${i + 1}. ${x}`).join('\n')}\n\n` +
            `**🔗 Connect:**\n• LinkedIn: ${m.linkedin}\n• GitHub: ${m.github}`;
    };

    A.general = () => `**🤖 Health Analytics Assistant** 🦅\n\nI can answer questions about health conditions, states, correlations, trends, the methodology and the team.\n\n` +
        `**💡 Examples:**\n• "Tell me about cancer"\n• "Show me Texas health trends"\n• "Which conditions are most correlated?"\n• "What are the key findings?"`;

    const CATEGORY = {
        greeting: 'greeting', thanks: 'greeting', farewell: 'greeting', help: 'general', general: 'general',
        team_members: 'team', specific_member: 'team', correlation: 'analysis', time_series: 'analysis', top_states: 'analysis'
    };

    function followups(type, e) {
        if (type === 'specific_condition') return [`Which states search most for ${e.condition}?`, `How has ${e.condition} interest changed over time?`, `What is ${e.condition} most correlated with?`, 'Show me health conditions list'];
        if (type === 'state_analysis') return [`What are the top conditions in ${e.state}?`, `Tell me about diabetes in ${e.state}`, 'Which states have the highest search interest?', 'What are the key findings?'];
        if (type === 'team_members' || type === 'specific_member') return ['Who was the project lead?', 'Tell me about Maria', 'Explain the methodology', 'What are the key findings?'];
        if (type === 'correlation') return ['Is obesity correlated with diabetes?', 'Is cancer correlated with stroke?', 'What are the key findings?', 'Show search trends over time'];
        return ['What are the key findings?', 'Which conditions are most correlated?', 'Show me California health trends', 'Who worked on this project?'];
    }

    async function ask(question) {
        question = String(question || '').trim();
        if (!question) return { success: false, response: 'Please ask a question, e.g. "What is this project about?"' };
        let S;
        try { S = await loadStats(); } catch (err) {
            return { success: false, response: 'Sorry — the project data could not be loaded. Please check your connection and try again.' };
        }
        const e = extractEntities(question, S);
        if (e.intent && ['greeting', 'thanks', 'farewell'].includes(e.intent) && question.split(/\s+/).length <= 4) {
            return pack(e.intent, A[e.intent](S, e), e);
        }
        const type = responseType(question, e);
        return pack(type, (A[type] || A.general)(S, e), e);
    }

    function pack(type, text, e) {
        const words = text.split(/\s+/).length;
        const { intent, ...entities } = e;
        return {
            success: true, response: text, category: CATEGORY[type] || 'project', title: type,
            entities, data_available: false,
            suggested_questions: followups(type, e).map((q) => ({ category: 'followup', question: q })),
            metadata: { word_count: words, estimated_reading_time: Math.ceil(words / 200), response_type: type, timestamp: new Date().toISOString() }
        };
    }

    root.HealthChatEngine = { ask, loadStats, _extractEntities: extractEntities, _responseType: responseType };
})(typeof window !== 'undefined' ? window : globalThis);
