"use strict";
const KEY = location.pathname + ":kmlog:runs";
const ACCENT = "#82c91e";
const MARK = "#66a80f";
const $ = id => document.getElementById(id);
const fmt = n => n.toFixed(1);

function loadRuns() {
  try {
    const raw = localStorage.getItem(KEY);
    const arr = raw ? JSON.parse(raw) : null;
    if (Array.isArray(arr)) return arr;
  } catch (e) { return null; }
  return null;
}
function saveRuns(runs) { localStorage.setItem(KEY, JSON.stringify(runs)); }

function iso(d) { return d.toISOString().slice(0, 10); }
function fromISO(s) { return new Date(s + "T00:00:00"); }
function addDays(d, n) { const x = new Date(d); x.setDate(x.getDate() + n); return x; }
function weekStart(dateStr) {
  const d = fromISO(dateStr);
  const dow = (d.getDay() + 6) % 7;
  return iso(addDays(d, -dow));
}
function daysAgoISO(n) { return iso(addDays(new Date(), -n)); }

function seed() {
  let s = 42;
  const rand = () => { s = (s * 1103515245 + 12345) % 2147483648; return s / 2147483648; };
  const runs = [];
  for (let w = 12; w >= 1; w--) {
    const count = 3 + Math.floor(rand() * 2);
    const slots = [0, 2, 4, 6];
    for (let i = 0; i < count; i++) {
      const ws = weekStart(daysAgoISO(w * 7 - 1));
      const slot = slots[i];
      const date = iso(addDays(fromISO(ws), slot));
      const base = 5 + w * 0.3 + rand() * 3;
      let km = base + (slot === 6 ? 4 : 0);
      km = Math.max(3, Math.round(km * 10) / 10);
      const pace = 5.4 + rand() * 0.9;
      const min = Math.round(km * pace);
      runs.push({ id: "seed-" + w + "-" + i, date, km, min });
    }
  }
  const recent = [[0, 5.2, 27], [1, 8.0, 42], [2, 4.5, 24], [3, 6.1, 31], [4, 4.8, 25], [5, 7.4, 38]];
  for (const r of recent) {
    runs.push({ id: "recent-" + r[0], date: daysAgoISO(r[0]), km: r[1], min: r[2] });
  }
  return runs;
}

/* ---- stats ---- */
function weekKm(runs, ws) {
  let sum = 0;
  for (const r of runs) if (weekStart(r.date) === ws) sum += r.km;
  return sum;
}
function currentStreak(runs) { return streakDates(runs).length; }
function streakDates(runs) {
  const days = new Set(runs.map(r => r.date));
  const out = [];
  let d = daysAgoISO(0);
  if (!days.has(d)) d = daysAgoISO(1);
  if (!days.has(d)) return out;
  while (days.has(d)) {
    out.push(d);
    d = iso(addDays(fromISO(d), -1));
  }
  return out.reverse(); // oldest → newest
}
function bestStreak(runs) {
  const days = [...new Set(runs.map(r => r.date))].sort();
  let best = 0, cur = 0, prev = null;
  for (const date of days) {
    if (prev !== null && (fromISO(date) - fromISO(prev)) === 86400000) cur++;
    else cur = 1;
    if (cur > best) best = cur;
    prev = date;
  }
  return best;
}

/* ---- chart ---- */
const WEEKS_SHOWN = 12;
function renderChart(runs) {
  const svg = $("chart");
  const W = 640, H = 220;
  const pad = { l: 34, r: 8, t: 14, b: 24 };
  const weeks = [];
  const curWS = weekStart(daysAgoISO(0));
  for (let i = WEEKS_SHOWN - 1; i >= 0; i--) {
    const ws = weekStart(daysAgoISO(i * 7));
    weeks.push({ ws, km: weekKm(runs, ws), count: runs.filter(r => weekStart(r.date) === ws).length });
  }
  const maxKm = Math.max(...weeks.map(w => w.km), 10);
  const niceMax = Math.ceil(maxKm / 10) * 10;
  const plotW = W - pad.l - pad.r;
  const plotH = H - pad.t - pad.b;
  const band = plotW / weeks.length;
  const barW = Math.min(24, band * 0.55);
  let out = [];
  for (let g = 0; g <= 2; g++) {
    const v = niceMax / 2 * g;
    const y = pad.t + plotH * (1 - v / niceMax);
    out.push('<line x1="' + pad.l + '" x2="' + (W - pad.r) + '" y1="' + y + '" y2="' + y + '" stroke="var(--line)" stroke-width="1"/>');
    out.push('<text x="' + (pad.l - 6) + '" y="' + (y + 3) + '" text-anchor="end" fill="var(--ink-3)" font-size="10">' + Math.round(v) + '</text>');
  }
  weeks.forEach(function (wk, i) {
    const x = pad.l + band * i + (band - barW) / 2;
    const h = niceMax ? wk.km / niceMax * plotH : 0;
    const y = pad.t + plotH - h;
    const cur = wk.ws === curWS;
    const fill = cur ? ACCENT : MARK;
    const r = Math.min(4, h / 2);
    if (wk.km > 0) {
      out.push('<rect x="' + x.toFixed(1) + '" y="' + y.toFixed(1) + '" width="' + barW.toFixed(1) + '" height="' + Math.max(0, h).toFixed(1) + '" rx="' + r.toFixed(1) + '" fill="' + fill + '"/>');
    } else {
      out.push('<line x1="' + x.toFixed(1) + '" x2="' + (x + barW).toFixed(1) + '" y1="' + (pad.t + plotH) + '" y2="' + (pad.t + plotH) + '" stroke="var(--ink-3)" stroke-width="2"/>');
    }
    if (cur) {
      out.push('<text x="' + (x + barW / 2).toFixed(1) + '" y="' + (y - 5).toFixed(1) + '" text-anchor="middle" fill="var(--ink-2)" font-size="10" font-weight="600">' + fmt(wk.km) + '</text>');
    }
    out.push('<text x="' + (pad.l + band * i + band / 2).toFixed(1) + '" y="' + (H - 8) + '" text-anchor="middle" fill="var(--ink-3)" font-size="10">' + (wk.ws.slice(5).replace("-", "/")) + '</text>');
    out.push('<rect class="hit" data-i="' + i + '" x="' + (pad.l + band * i).toFixed(1) + '" y="' + pad.t + '" width="' + band.toFixed(1) + '" height="' + plotH + '" fill="transparent"/>');
  });
  svg.innerHTML = out.join("");
  renderTooltip(runs, weeks);
}

/* ---- tooltip ---- */
function renderTooltip(runs, weeks) {
  if ($("chart").dataset.tipBound) return;
  $("chart").dataset.tipBound = "1";
  const tip = $("tooltip");
  const svg = $("chart");
  const list = svg.querySelectorAll(".hit");
  const svgEl = svg;
  const svgPos = function () { return svgEl.getBoundingClientRect(); }
  svg.addEventListener("mousemove", function (e) {
    const t = e.target;
    if (t.classList && t.classList.contains("hit")) {
      const wk = weeks[+t.getAttribute("data-i")];
      const label = wk.ws + " → +6d";
      tip.innerHTML = '<div class="t-label">' + label + '</div>' +
        '<div class="t-value"><em>' + fmt(wk.km) + ' km</em> · ' + wk.count + ' runs</div>';
      const r = svgPos();
      tip.style.left = (e.clientX + 12) + "px";
      tip.style.position = "fixed";
      tip.style.top = (e.clientY - 14) + "px";
      tip.style.display = "block";
    } else {
      tip.style.display = "none";
    }
  });
  svg.addEventListener("mouseleave", function () { tip.style.display = "none"; });
  void list; void runs;
}

/* ---- run list ---- */
function paceStr(r) {
  const p = r.min / r.km;
  const m = Math.floor(p);
  return m + ":" + String(Math.round((p - m) * 60)).padStart(2, "0") + "/km";
}
function timeStr(min) {
  const h = Math.floor(min / 60);
  const m = Math.round(min % 60);
  return h ? h + ":" + String(m).padStart(2, "0") + "h" : m + "m";
}
function renderList(runs) {
  const el = $("runList");
  const sorted = runs.slice().sort(function (a, b) { return b.date < a.date ? -1 : b.date > a.date ? 1 : b.id < a.id ? -1 : 1; });
  const show = sorted.slice(0, 15);
  if (!show.length) {
    el.innerHTML = '<div class="empty">no runs yet — log one below</div>';
  } else {
    el.innerHTML = show.map(function (r) {
      return '<div class="run">' +
        '<span class="d">' + r.date.slice(5).replace("-", "/") + '</span>' +
        '<span class="km">' + fmt(r.km) + '</span>' +
        '<span class="time">' + timeStr(r.min) + '</span>' +
        '<span class="pace">' + paceStr(r) + '</span>' +
        '<button class="del" data-id="' + r.id + '" aria-label="delete run">DEL</button>' +
        '</div>';
    }).join("");
  }
}

/* ---- init + events ---- */
function renderAll(runs) {
  const today = daysAgoISO(0);
  const curWS = weekStart(today);
  const lastWS = weekStart(daysAgoISO(7));
  const wk = weekKm(runs, curWS);
  const lw = weekKm(runs, lastWS);
  $("weekKm").textContent = fmt(wk);
  const sub = $("weekSub");
  if (lw > 0) {
    const diff = wk - lw;
    const sign = diff >= 0 ? "+" : "−";
    sub.textContent = sign + fmt(Math.abs(diff)) + " km vs last week";
    sub.className = "sub" + (diff >= 0 ? " up" : "");
    sub.textContent = sub.textContent;
  } else {
    sub.textContent = "no data for last week";
  }
  const streakDays = streakDates(runs);
  $("streakBig").textContent = streakDays.length;
  $("bestStreak").textContent = bestStreak(runs);
  $("streakBest").innerHTML = "best: <b>" + bestStreak(runs) + "</b> days";
  const strip = $("streakStrip");
  if (!streakDays.length) {
    strip.innerHTML = '<span class="none">no active streak — log a run today to start one</span>';
  } else {
    strip.innerHTML = streakDays.map(function (date) {
      const d = fromISO(date);
      const dw = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"][d.getDay()];
      const isToday = date === today;
      return '<div class="day' + (isToday ? " today" : "") + '">' +
        '<div class="dw">' + dw + '</div>' +
        '<div class="dn">' + date.slice(8) + '</div>' +
        '</div>';
    }).join("");
  }
  $("streakSpan").textContent = streakDays.length
    ? streakDays[0].slice(5).replace("-", "/") + " → " + streakDays[streakDays.length - 1].slice(5).replace("-", "/")
    : "—";
  let avg = 0;
  for (let i = 1; i <= 4; i++) avg += weekKm(runs, weekStart(daysAgoISO(i * 7)));
  $("avgKm").textContent = fmt(avg / 4);
  const total = runs.reduce(function (s, r) { return s + r.km; }, 0);
  $("totalKm").textContent = fmt(total);
  $("totalSub").textContent = runs.length + " runs";
  $("today").textContent = iso(new Date()) + " UTC+" + (-new Date().getTimezoneOffset() / 60);
  $("chartRange").textContent = WEEKS_SHOWN + " weeks";
  renderChart(runs);
  renderList(runs);
}

function init() {
  let runs = loadRuns();
  if (!runs) {
    runs = seed();
    saveRuns(runs);
  }
  renderAll(runs);
  $("addForm").addEventListener("submit", function (e) {
    e.preventDefault();
    const date = $("fDate").value;
    const km = parseFloat($("fKm").value);
    const min = parseFloat($("fMin").value);
    const msg = $("msg");
    if (!date || !(km > 0) || !(min > 0)) {
      msg.textContent = "fill date, km, minutes";
      msg.className = "msg err";
      return;
  }
    runs.push({ id: "run-" + Date.now(), date, km: Math.round(km * 10) / 10, min: Math.round(min) });
    saveRuns(runs);
    renderAll(runs);
    msg.textContent = "run added";
    msg.className = "msg ok";
    $("fKm").value = "";
    $("fMin").value = "";
  });
  $("runList").addEventListener("click", function (e) {
    const btn = e.target.closest(".del");
    if (!btn) return;
    runs = runs.filter(function (r) { return r.id !== btn.dataset.id; });
    saveRuns(runs);
    renderAll(runs);
  });
}

init();
