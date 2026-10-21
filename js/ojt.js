// js/ojt.js — renders the OJT Journal page (ojt.html).
// All content comes from data/ojt.js, so you only ever edit that one file.
// ✏️ You normally don't need to edit this file.
import { ojtEntries, ojtMeta, ojtFileName } from "../data/ojt.js";

// ---------- Helpers ----------
function esc(text) {
return String(text)
.replace(/&/g, "&amp;")
.replace(/</g, "&lt;")
.replace(/>/g, "&gt;")
.replace(/"/g, "&quot;");
}

function longDate(iso) {
const date = new Date(`${iso}T00:00:00`);
return date.toLocaleDateString("en-US", {
weekday: "short",
month: "short",
day: "numeric",
year: "numeric"
});
}

// 5 working days per "week" of the immersion (Mon–Fri).
function weekOf(entry) {
return Math.floor((entry.day - 1) / 5) + 1;
}

function weekLabel(week) {
const first = ojtEntries.find((e) => weekOf(e) === week);
const last = [...ojtEntries].reverse().find((e) => weekOf(e) === week);
if (!first) return `Week ${week}`;
const start = new Date(`${first.date}T00:00:00`);
const end = new Date(`${last.date}T00:00:00`);
const sameMonth = start.getMonth() === end.getMonth();
const month = start.toLocaleDateString("en-US", { month: "short" });
const startDay = start.getDate();
const endDay = end.getDate();
const range = sameMonth ? `${month} ${startDay}–${endDay}` : `${month} ${startDay} – ${end.toLocaleDateString("en-US", { month: "short" })} ${endDay}`;
return `Week ${week} · ${range}`;
}

// ---------- Stats ----------
function renderStats() {
const tasks = ojtEntries.reduce((sum, e) => sum + e.tasks.length, 0);
const lessons = ojtEntries.reduce((sum, e) => sum + e.learnings.length, 0);
const tools = new Set(ojtEntries.flatMap((e) => e.tools));
const stats = [
{ value: ojtEntries.length, label: "Days logged" },
{ value: tasks, label: "Tasks done" },
{ value: lessons, label: "Lessons learned" },
{ value: tools.size, label: "Tools used" }
];
const box = document.getElementById("ojt-stats");
if (!box) return;
box.innerHTML = stats
.map(
(s) => `<div class="stat"><span class="stat-value">${s.value}</span>` +
`<span class="stat-label">${esc(s.label)}</span></div>`
)
.join("");
}

// ---------- Tools used ----------
function renderTools() {
const counts = new Map();
ojtEntries.forEach((e) => e.tools.forEach((t) => counts.set(t, (counts.get(t) || 0) + 1)));
const sorted = [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
const box = document.getElementById("ojt-tools");
if (!box) return;
box.innerHTML = sorted
.map(
([tool, count]) =>
`<li class="tool-chip"><span>${esc(tool)}</span><b>${count}</b></li>`
)
.join("");
}

// ---------- Filters ----------
let activeWeek = "all";
let searchText = "";

function buildFilters() {
const box = document.getElementById("ojt-filters");
if (!box) return;
const weeks = [...new Set(ojtEntries.map(weekOf))].sort((a, b) => a - b);
const buttons = [`<button type="button" class="filter-btn is-active" data-week="all">All days</button>`];
weeks.forEach((week) => {
buttons.push(
`<button type="button" class="filter-btn" data-week="${week}">${esc(weekLabel(week))}</button>`
);
});
box.innerHTML = buttons.join("");
box.querySelectorAll(".filter-btn").forEach((btn) => {
btn.addEventListener("click", function () {
activeWeek = btn.dataset.week;
box.querySelectorAll(".filter-btn").forEach((b) => b.classList.remove("is-active"));
btn.classList.add("is-active");
renderEntries();
});
});
}

function matches(entry) {
if (activeWeek !== "all" && String(weekOf(entry)) !== activeWeek) return false;
if (!searchText) return true;
const haystack = [
entry.title,
entry.focus,
entry.date,
entry.tools.join(" "),
entry.tasks.join(" "),
entry.learnings.join(" "),
entry.next || ""
]
.join(" ")
.toLowerCase();
return haystack.includes(searchText);
}

// ---------- Entries ----------
function renderEntries() {
const box = document.getElementById("ojt-entries");
if (!box) return;

const visible = ojtEntries.filter(matches);
const counter = document.getElementById("ojt-count");
if (counter) {
counter.textContent =
visible.length === ojtEntries.length
? `Showing all ${ojtEntries.length} entries`
: `Showing ${visible.length} of ${ojtEntries.length} entries`;
}

if (visible.length === 0) {
box.innerHTML = `<p class="ojt-empty">Walang entry na tumutugma sa haping "ojt".</p>`;
return;
}

// Newest entry first — that is what people want to see.
box.innerHTML = visible
.slice()
.sort((a, b) => b.day - a.day)
.map((entry) => {
const file = ojtFileName(entry);
const ghUrl = `${ojtMeta.repoUrl}/blob/main/days/${file}`;
return `
<article class="journal-entry reveal-visible" data-week="${weekOf(entry)}" data-day="${entry.day}">
<div class="journal-head">
<span class="day-badge">Day ${entry.day}</span>
<time class="journal-date" datetime="${esc(entry.date)}">${esc(longDate(entry.date))}</time>
</div>
<h3>${esc(entry.title)}</h3>
<p class="journal-focus">${esc(entry.focus)}</p>
<div class="journal-cols">
<div class="journal-col">
<h4><span aria-hidden="true">✅</span> What I did</h4>
<ul>${entry.tasks.map((t) => `<li>${esc(t)}</li>`).join("")}</ul>
</div>
<div class="journal-col">
<h4><span aria-hidden="true">💡</span> What I learned</h4>
<ul>${entry.learnings.map((t) => `<li>${esc(t)}</li>`).join("")}</ul>
</div>
</div>
<div class="journal-foot">
<ul class="tags">${entry.tools.map((t) => `<li>${esc(t)}</li>`).join("")}</ul>
${entry.next ? `<p class="journal-next"><b>Next:</b> ${esc(entry.next)}</p>` : ""}
<a class="journal-gh" href="${ghUrl}" target="_blank" rel="noopener">Markdown on GitHub ↗</a>
</div>
</article>`;
})
.join("");
}

// ---------- Preview (home page) ----------
function renderPreview() {
const box = document.getElementById("ojt-preview");
if (!box) return;
const latest = ojtEntries.slice().sort((a, b) => b.day - a.day).slice(0, 3);
box.innerHTML = latest.map((entry) => `
<a class="preview-entry" href="ojt.html#journal">
<span class="day-badge">Day ${entry.day}</span>
<div class="preview-body">
<h3>${esc(entry.title)}</h3>
<p>${esc(entry.focus)}</p>
<ul class="tags">${entry.tools.map((t) => `<li>${esc(t)}</li>`).join("")}</ul>
</div>
<span class="preview-arrow" aria-hidden="true">→</span>
</a>`).join("");
}

// ---------- Go ----------
function init() {
renderStats();
renderTools();
buildFilters();
renderEntries();
renderPreview();

const search = document.getElementById("ojt-search");
if (search) {
search.addEventListener("input", function () {
searchText = search.value.trim().toLowerCase();
renderEntries();
});
}

const meta = document.getElementById("ojt-meta");
if (meta) {
meta.innerHTML = [
`<span>${esc(ojtMeta.role)}</span>`,
`<span>${esc(ojtMeta.team)}</span>`,
`<span>${esc(ojtMeta.period)}</span>`
].join('<i aria-hidden="true">·</i>');
}

const intro = document.getElementById("ojt-intro");
if (intro) intro.textContent = ojtMeta.intro;

const note = document.getElementById("ojt-note");
if (note) note.textContent = ojtMeta.note;

const repoLinks = document.querySelectorAll("[data-ojt-repo]");
repoLinks.forEach((a) => {
a.href = ojtMeta.repoUrl;
});
}

if (document.readyState === "loading") {
document.addEventListener("DOMContentLoaded", init);
} else {
init();
}
