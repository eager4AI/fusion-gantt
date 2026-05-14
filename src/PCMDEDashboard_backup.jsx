import React, { useMemo, useState } from "react";
import Papa from "papaparse";
import {
  Upload,
  Search,
  ChevronDown,
  ChevronRight,
  ListTree,
  AlertTriangle,
  CheckCircle2,
  Clock3,
  ExternalLink,
  Maximize2,
  Minimize2,
  FolderKanban,
  Layers3,
  SquareCheckBig,
  ListChecks,
  CircleDot,
} from "lucide-react";

// PCMDE Jira CSV Dashboard
// Workflow: Jira export CSV -> Upload here -> Dashboard rebuilds automatically.
// No CSV manipulation required.

const JIRA_BASE_URL = "https://compass-group-team-mnjkym0e.atlassian.net/browse/";
const LEFT_GRID = "620px 1fr";
const LEFT_COLUMNS = "1fr 150px 125px";
const STATUS_ORDER = ["To-Do", "In Progress", "Blocked", "At Risk", "Done", "Closed"];

function normaliseKey(name) {
  return String(name || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

function pick(row, aliases) {
  const byNormalised = Object.fromEntries(
    Object.entries(row).map(([k, v]) => [normaliseKey(k), v])
  );

  for (const alias of aliases) {
    const value = byNormalised[normaliseKey(alias)];
    if (value !== undefined && value !== null && String(value).trim() !== "") return String(value).trim();
  }

  return "";
}

function parseDate(value) {
  if (!value) return null;
  const cleaned = String(value).trim();
  const parsed = new Date(cleaned);
  if (!Number.isNaN(parsed.getTime())) return parsed;

  const fallback = Date.parse(cleaned.replace(/-/g, " "));
  return Number.isNaN(fallback) ? null : new Date(fallback);
}

function formatDate(date) {
  if (!date) return "—";
  return date.toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "2-digit" });
}

function monthStart(date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function addMonths(date, months) {
  return new Date(date.getFullYear(), date.getMonth() + months, 1);
}

function monthLabel(date) {
  return date.toLocaleDateString(undefined, { month: "short", year: "numeric" });
}

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

function statusTone(status) {
  const s = String(status || "").toLowerCase();
  if (s.includes("done") || s.includes("closed") || s.includes("complete")) return "done";
  if (s.includes("block")) return "blocked";
  if (s.includes("risk")) return "risk";
  if (s.includes("progress")) return "progress";
  if (s.includes("to-do") || s.includes("todo") || s.includes("open")) return "todo";
  return "neutral";
}

function barClass(row) {
  if (row.kind === "project") return "bg-slate-900 h-3 opacity-90";
  if (row.kind === "initiative") return "bg-orange-500 h-4 opacity-90";

  const tone = statusTone(row.status);
  if (tone === "done") return "bg-emerald-500 h-4";
  if (tone === "blocked") return "bg-red-500 h-4";
  if (tone === "risk") return "bg-amber-500 h-4";
  if (tone === "todo") return "bg-slate-400 h-4";
  if (tone === "progress") return "bg-blue-500 h-4";
  return "bg-slate-500 h-4";
}

function badgeClass(status) {
  const tone = statusTone(status);
  if (tone === "done") return "bg-emerald-50 text-emerald-700 ring-emerald-200";
  if (tone === "blocked") return "bg-red-50 text-red-700 ring-red-200";
  if (tone === "risk") return "bg-amber-50 text-amber-700 ring-amber-200";
  if (tone === "todo") return "bg-slate-100 text-slate-700 ring-slate-200";
  if (tone === "progress") return "bg-blue-50 text-blue-700 ring-blue-200";
  return "bg-slate-100 text-slate-600 ring-slate-200";
}

function rowTextClass(row) {
  if (row.kind === "project") return "font-bold text-slate-950";
  if (row.kind === "initiative") return "font-semibold text-slate-900";
  if (row.kind === "subtask") return "text-slate-600";
  return "text-slate-800";
}

function nodeIcon(row) {
  const type = String(row.issueType || "").toLowerCase();

  if (row.kind === "project") {
    return (
      <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-slate-900 text-[11px] font-bold text-white" title="Programme / Project">
        P
      </span>
    );
  }

  if (row.kind === "initiative") {
    return <Layers3 size={17} className="shrink-0 text-orange-600" aria-label="Initiative / Epic" />;
  }

  if (row.kind === "subtask" || type.includes("sub-task")) {
    return <ListChecks size={16} className="shrink-0 text-slate-500" aria-label="Sub-task" />;
  }

  if (type.includes("risk") || type.includes("issue")) {
    return <AlertTriangle size={16} className="shrink-0 text-red-500" aria-label="Risk / Issue" />;
  }

  if (type.includes("epic") || type.includes("initiative")) {
    return <FolderKanban size={16} className="shrink-0 text-orange-600" aria-label="Epic" />;
  }

  if (type.includes("action") || type.includes("task") || type.includes("activity")) {
    return <SquareCheckBig size={16} className="shrink-0 text-blue-600" aria-label="Action / Activity" />;
  }

  return <CircleDot size={14} className="shrink-0 text-slate-400" aria-label="Item" />;
}

function countLabel(row) {
  if (!row.children?.length) return "";

  if (row.kind === "project") {
    const initiatives = row.children.length;
    return `${initiatives} initiative${initiatives === 1 ? "" : "s"}`;
  }

  if (row.kind === "initiative") {
    const activities = row.activityCount || row.children.length;
    const subtasks = row.subtaskCount || 0;
    return subtasks > 0
      ? `${activities} activit${activities === 1 ? "y" : "ies"} · ${subtasks} sub-task${subtasks === 1 ? "" : "s"}`
      : `${activities} activit${activities === 1 ? "y" : "ies"}`;
  }

  if (row.kind === "activity") {
    const subtasks = row.subtaskCount || row.children.length;
    return `${subtasks} sub-task${subtasks === 1 ? "" : "s"}`;
  }

  return `${row.children.length} item${row.children.length === 1 ? "" : "s"}`;
}

function CountPill({ row }) {
  const label = countLabel(row);
  if (!label) return null;

  return (
    <span className="ml-2 shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600 ring-1 ring-slate-200" title="Contained Jira items">
      {label}
    </span>
  );
}

function normaliseIssue(row) {
  const key = pick(row, ["Issue key", "Key", "Issue id"]);
  const issueType = pick(row, ["Issue Type", "Issue type", "Type"]);
  const summary = pick(row, ["Summary", "Issue summary", "Title"]);
  const project = pick(row, ["Project name", "Project", "Project key"]) || "PCM Integration – Germany";
  const parentKey = pick(row, ["Parent key", "Parent", "Epic Link", "Epic link"]);
  const parentSummary = pick(row, ["Parent summary", "Parent Summary", "Epic Name", "Epic name"]);
  const status = pick(row, ["Status"]);
  const assignee = pick(row, ["Assignee"]);
  const priority = pick(row, ["Priority"]);
  const workstream = pick(row, ["Custom field (Workstream)", "Workstream"]);
  const l3Process = pick(row, ["Custom field (L3-Process)", "L3-Process", "L3 Process"]);
  const phase = pick(row, ["Custom field (Project Phase)", "Project Phase"]);

  const plannedStartRaw = pick(row, [
    "Custom field (Planned Start Date)",
    "Planned Start Date",
    "Start date",
    "Start Date",
    "Custom field (Start date)",
  ]);
  const createdRaw = pick(row, ["Created"]);
  const dueRaw = pick(row, ["Due date", "Due Date", "Due"]);
  const baselineDueRaw = pick(row, ["Custom field (Baseline Due Date)", "Baseline Due Date"]);
  const updatedRaw = pick(row, ["Updated", "Last updated"]);

  const plannedStart = parseDate(plannedStartRaw);
  const created = parseDate(createdRaw);
  const due = parseDate(dueRaw);
  const baselineDue = parseDate(baselineDueRaw);
  const updated = parseDate(updatedRaw);

  const fallbackStart = plannedStart || created || due || baselineDue || updated || new Date();
  const fallbackDue = due || baselineDue || (updated ? addDays(updated, 14) : null) || fallbackStart;

  return {
    key,
    issueType,
    summary,
    project,
    parentKey,
    parentSummary,
    status,
    assignee,
    priority,
    workstream,
    l3Process,
    phase,
    start: fallbackStart,
    due: fallbackDue,
    updated,
    raw: row,
  };
}

function addDays(date, days) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function buildTree(issues) {
  const projectMap = new Map();
  const issueMap = new Map();

  issues.forEach((issue) => {
    if (!issue.key) return;

    issueMap.set(issue.key, {
      ...issue,
      id: `issue:${issue.key}`,
      title: issue.summary || issue.key,
      kind: issue.issueType?.toLowerCase().includes("sub-task") ? "subtask" : "activity",
      children: [],
    });
  });

  function getProject(projectName) {
    const projectId = projectName || "PCM Integration – Germany";

    if (!projectMap.has(projectId)) {
      projectMap.set(projectId, {
        id: `project:${projectId}`,
        title: projectId,
        key: projectId,
        kind: "project",
        level: 0,
        status: "",
        assignee: "",
        start: null,
        due: null,
        children: [],
      });
    }

    return projectMap.get(projectId);
  }

  const initiativeMap = new Map();

  function getInitiative(project, name, key = "") {
    const safeName = name || "PCM Germany Core Activities";
    const mapKey = `${project.title}::${safeName}`;

    if (!initiativeMap.has(mapKey)) {
      const node = {
        id: `initiative:${mapKey}`,
        title: safeName,
        key,
        kind: "initiative",
        level: 1,
        status: "",
        assignee: "",
        start: null,
        due: null,
        children: [],
      };

      initiativeMap.set(mapKey, node);
      project.children.push(node);
    }

    return initiativeMap.get(mapKey);
  }

  issueMap.forEach((node) => {
    const project = getProject(node.project);
    const parentIsPCMDE = node.parentKey && node.parentKey.startsWith("PCMDE-");
    const parentExists = parentIsPCMDE && issueMap.has(node.parentKey);

    if (node.kind === "subtask" && parentExists) {
      const parent = issueMap.get(node.parentKey);
      parent.children.push(node);
      node.level = 3;
      return;
    }

    if (parentExists) {
      const initiative = getInitiative(project, node.parentSummary || "Grouped PCMDE Activities", node.parentKey);
      initiative.children.push(node);
      node.level = 2;
      return;
    }

    const initiative = getInitiative(project, "PCM Germany Core Activities");
    initiative.children.push(node);
    node.level = 2;
  });

  function rollup(node) {
    node.children.forEach(rollup);

    const dates = [node.start, node.due, ...node.children.flatMap((c) => [c.start, c.due])].filter(Boolean);

    if (dates.length) {
      node.start = new Date(Math.min(...dates.map((d) => d.getTime())));
      node.due = new Date(Math.max(...dates.map((d) => d.getTime())));
    }

    if (!node.status && node.children.length) {
      const statuses = node.children.map((c) => c.status).filter(Boolean);
      const open = statuses.filter((s) => !["Done", "Closed"].includes(s));
      node.status = open.includes("In Progress") ? "In Progress" : open[0] || statuses[0] || "";
    }

    node.descendantCount = node.children.reduce((sum, child) => sum + 1 + (child.descendantCount || 0), 0);
    node.activityCount = node.children.reduce(
      (sum, child) => sum + (child.kind === "activity" ? 1 : 0) + (child.activityCount || 0),
      0
    );
    node.subtaskCount = node.children.reduce(
      (sum, child) => sum + (child.kind === "subtask" ? 1 : 0) + (child.subtaskCount || 0),
      0
    );
  }

  const roots = [...projectMap.values()];
  roots.forEach(rollup);
  return roots;
}

function flatten(nodes, expanded, maxDepth, depth = 0) {
  const out = [];

  for (const node of nodes) {
    if (depth <= maxDepth) out.push({ ...node, depth });
    if (node.children?.length && expanded[node.id] !== false && depth < maxDepth) {
      out.push(...flatten(node.children, expanded, maxDepth, depth + 1));
    }
  }

  return out;
}

function collectIds(nodes) {
  const ids = [];
  function walk(node) {
    if (node.children?.length) ids.push(node.id);
    node.children?.forEach(walk);
  }
  nodes.forEach(walk);
  return ids;
}

function SummaryCard({ label, value, icon: Icon, tone = "blue" }) {
  const toneClass = {
    blue: "bg-blue-50 text-blue-700 ring-blue-100",
    green: "bg-emerald-50 text-emerald-700 ring-emerald-100",
    amber: "bg-amber-50 text-amber-700 ring-amber-100",
    red: "bg-red-50 text-red-700 ring-red-100",
    slate: "bg-slate-50 text-slate-700 ring-slate-100",
  }[tone];

  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm border border-slate-200 flex items-center justify-between">
      <div>
        <div className="text-xs font-medium text-slate-500">{label}</div>
        <div className="text-3xl font-bold text-slate-950 mt-1">{value}</div>
      </div>
      {Icon && (
        <div className={`rounded-2xl p-3 ring-1 ${toneClass}`}>
          <Icon size={22} />
        </div>
      )}
    </div>
  );
}

export default function PCMDEDashboard() {
  const [rows, setRows] = useState([]);
  const [fileName, setFileName] = useState("");
  const [query, setQuery] = useState("");
  const [level, setLevel] = useState("activities");
  const [statusFilter, setStatusFilter] = useState("all");
  const [expanded, setExpanded] = useState({});
  const [parseError, setParseError] = useState("");

  const issues = useMemo(() => rows.map(normaliseIssue).filter((i) => i.key || i.summary), [rows]);
  const tree = useMemo(() => buildTree(issues), [issues]);

  const maxDepth = { programme: 0, initiatives: 1, activities: 2, detailed: 3 }[level];

  const statusValues = useMemo(() => {
    const values = new Set(issues.map((i) => i.status).filter(Boolean));
    return [...values].sort((a, b) => {
      const ai = STATUS_ORDER.indexOf(a);
      const bi = STATUS_ORDER.indexOf(b);
      return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi);
    });
  }, [issues]);

  const filteredTree = useMemo(() => {
    const q = query.trim().toLowerCase();

    function nodeText(node) {
      return `${node.title || node.summary || ""} ${node.key || ""} ${node.status || ""} ${node.assignee || ""} ${node.workstream || ""} ${node.l3Process || ""}`.toLowerCase();
    }

    function childMatchesStatus(node) {
      return node.status === statusFilter || node.children?.some(childMatchesStatus);
    }

    function matches(node) {
      const queryOk = !q || nodeText(node).includes(q);
      const statusOk = statusFilter === "all" || node.status === statusFilter || node.children?.some(childMatchesStatus);
      return queryOk && statusOk;
    }

    function filterNode(node) {
      const children = (node.children || []).map(filterNode).filter(Boolean);
      if (matches(node) || children.length) return { ...node, children };
      return null;
    }

    return tree.map(filterNode).filter(Boolean);
  }, [tree, query, statusFilter]);

  const flatRows = useMemo(() => flatten(filteredTree, expanded, maxDepth), [filteredTree, expanded, maxDepth]);

  const timeline = useMemo(() => {
    const dates = flatRows.flatMap((r) => [r.start, r.due]).filter(Boolean);
    const min = dates.length ? monthStart(new Date(Math.min(...dates.map((d) => d.getTime())))) : monthStart(new Date());
    const max = dates.length ? monthStart(new Date(Math.max(...dates.map((d) => d.getTime())))) : addMonths(min, 6);
    const months = [];
    let current = min;

    while (current <= addMonths(max, 1)) {
      months.push(current);
      current = addMonths(current, 1);
    }

    return { start: min, end: addMonths(max, 1), months };
  }, [flatRows]);

  const totalDays = Math.max(1, (timeline.end - timeline.start) / 86400000);

  const stats = useMemo(() => {
    const now = new Date();
    const done = issues.filter((i) => ["done", "closed"].some((s) => String(i.status).toLowerCase().includes(s))).length;
    const open = issues.length - done;

    return {
      issues: issues.length,
      open,
      done,
      overdue: issues.filter((i) => i.due && i.due < now && !String(i.status).toLowerCase().includes("done") && !String(i.status).toLowerCase().includes("closed")).length,
      inProgress: issues.filter((i) => String(i.status).toLowerCase().includes("progress")).length,
    };
  }, [issues]);

  function handleFile(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setParseError("");

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => header.trim(),
      complete: (result) => {
        if (result.errors?.length) setParseError(result.errors[0].message);
        setRows(result.data || []);
        setExpanded({});
      },
      error: (error) => setParseError(error.message),
    });
  }

  function toggle(id) {
    setExpanded((prev) => ({ ...prev, [id]: prev[id] === false }));
  }

  function expandAll() {
    setExpanded({});
  }

  function collapseAll() {
    const ids = collectIds(filteredTree);
    setExpanded(Object.fromEntries(ids.map((id) => [id, false])));
  }

  function barStyle(row) {
    if (!row.start || !row.due) return { display: "none" };
    const left = clamp(((row.start - timeline.start) / 86400000 / totalDays) * 100, 0, 100);
    const width = clamp(((row.due - row.start) / 86400000 / totalDays) * 100, 1.2, 100 - left);
    return { left: `${left}%`, width: `${width}%` };
  }

  const today = new Date();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 p-5">
      <div className="mx-auto max-w-[1900px] space-y-5">
        <header className="rounded-2xl bg-white shadow-sm border border-slate-200 p-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">PCM Germany Programme Dashboard</h1>
            <p className="text-sm text-slate-500 mt-1">Live Jira programme visualization for PCM Germany delivery tracking.</p>
          </div>

          <label className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-white font-semibold shadow-sm cursor-pointer hover:bg-blue-700 transition">
            <Upload size={18} /> Upload Jira CSV
            <input type="file" accept=".csv,text/csv" className="hidden" onChange={handleFile} />
          </label>
        </header>

        <section className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          <SummaryCard label="Open items" value={stats.open} icon={ListTree} tone="blue" />
          <SummaryCard label="In progress" value={stats.inProgress} icon={Clock3} tone="blue" />
          <SummaryCard label="Done" value={stats.done} icon={CheckCircle2} tone="green" />
          <SummaryCard label="Overdue" value={stats.overdue} icon={AlertTriangle} tone="red" />
        </section>

        <section className="rounded-2xl bg-white shadow-sm border border-slate-200 p-4 space-y-4">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex flex-wrap items-center gap-3">
              <div className="text-sm font-medium text-slate-500">{fileName ? `Loaded: ${fileName}` : "No file loaded yet"}</div>
              <div className="text-sm text-slate-400">{stats.issues} Jira rows loaded</div>
              {parseError && <div className="text-sm text-red-600">CSV warning: {parseError}</div>}
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button onClick={expandAll} className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
                <Maximize2 size={15} /> Expand all
              </button>
              <button onClick={collapseAll} className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
                <Minimize2 size={15} /> Collapse all
              </button>

              <div className="relative">
                <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
                <input
                  className="w-80 rounded-xl border border-slate-300 pl-9 pr-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-200"
                  placeholder="Search key, summary, owner..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </div>

              <select className="rounded-xl border border-slate-300 px-3 py-2 text-sm bg-slate-50" value={level} onChange={(e) => setLevel(e.target.value)}>
                <option value="programme">Programme view</option>
                <option value="initiatives">Initiative view</option>
                <option value="activities">Activity view</option>
                <option value="detailed">Detailed view incl. sub-tasks</option>
              </select>

              <select className="rounded-xl border border-slate-300 px-3 py-2 text-sm bg-slate-50" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <option value="all">All statuses</option>
                {statusValues.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="overflow-auto rounded-xl border border-slate-200 max-h-[72vh]">
            <div className="min-w-[1700px]">
              <div className="grid bg-slate-100 border-b border-slate-200 sticky top-0 z-30" style={{ gridTemplateColumns: LEFT_GRID }}>
                <div className="grid text-xs font-bold text-slate-600 sticky left-0 z-40 bg-slate-100 border-r border-slate-200" style={{ gridTemplateColumns: LEFT_COLUMNS }}>
                  <div className="p-3">Task</div>
                  <div className="p-3">Owner</div>
                  <div className="p-3">Status</div>
                </div>

                <div className="grid" style={{ gridTemplateColumns: `repeat(${timeline.months.length}, minmax(120px, 1fr))` }}>
                  {timeline.months.map((m) => {
                    const isCurrent = m.getMonth() === today.getMonth() && m.getFullYear() === today.getFullYear();
                    return (
                      <div key={m.toISOString()} className={`p-3 text-xs font-bold border-l border-slate-200 ${isCurrent ? "bg-blue-50 text-blue-700" : "text-slate-600"}`}>
                        {monthLabel(m)}
                      </div>
                    );
                  })}
                </div>
              </div>

              {flatRows.length === 0 && (
                <div className="p-12 text-center text-slate-500">Upload the PCMDE Jira CSV export to populate the dashboard.</div>
              )}

              {flatRows.map((row) => {
                const hasChildren = row.children?.length > 0;
                const title = row.title || row.summary || "Untitled";
                const rowHeight = row.kind === "project" ? "min-h-[50px]" : row.kind === "initiative" ? "min-h-[48px]" : "min-h-[54px]";
                const jiraLink = row.key?.startsWith("PCMDE-") ? `${JIRA_BASE_URL}${row.key}` : "";

                return (
                  <div key={row.id || row.key || title} className={`grid border-b border-slate-100 hover:bg-slate-50 ${rowHeight}`} style={{ gridTemplateColumns: LEFT_GRID }}>
                    <div className="grid text-xs items-center sticky left-0 z-20 bg-white hover:bg-slate-50 border-r border-slate-100" style={{ gridTemplateColumns: LEFT_COLUMNS }}>
                      <div className="p-2 flex items-center gap-1" style={{ paddingLeft: `${18 + row.depth * 30}px` }}>
                        {hasChildren ? (
                          <button onClick={() => toggle(row.id)} className="p-1 rounded hover:bg-slate-200 shrink-0">
                            {expanded[row.id] === false ? <ChevronRight size={15} /> : <ChevronDown size={15} />}
                          </button>
                        ) : (
                          <span className="w-7 shrink-0" />
                        )}

                        {nodeIcon(row)}

                        <span className={`${rowTextClass(row)} leading-snug line-clamp-2`}>{title}</span>
                        <CountPill row={row} />

                        {jiraLink && (
                          <a href={jiraLink} target="_blank" rel="noreferrer" className="ml-1 inline-flex items-center gap-1 text-blue-500 hover:text-blue-700 shrink-0" title={`Open ${row.key} in Jira`}>
                            {row.key}
                            <ExternalLink size={12} />
                          </a>
                        )}

                        {!jiraLink && row.key && row.kind !== "project" && (
                          <span className="ml-1 text-slate-400 shrink-0">{row.key}</span>
                        )}
                      </div>

                      <div className="p-2 truncate text-slate-600" title={row.assignee || ""}>{row.assignee || "—"}</div>

                      <div className="p-2">
                        {row.status ? (
                          <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ${badgeClass(row.status)}`}>
                            {row.status}
                          </span>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </div>
                    </div>

                    <div className="relative grid" style={{ gridTemplateColumns: `repeat(${timeline.months.length}, minmax(120px, 1fr))` }}>
                      {timeline.months.map((m) => {
                        const isCurrent = m.getMonth() === today.getMonth() && m.getFullYear() === today.getFullYear();
                        return <div key={m.toISOString()} className={`border-l ${isCurrent ? "bg-blue-50/40 border-blue-100" : "border-slate-100"}`} />;
                      })}

                      <div
                        className={`absolute top-1/2 -translate-y-1/2 rounded-full shadow-sm ${barClass(row)}`}
                        style={barStyle(row)}
                        title={`${title}: ${formatDate(row.start)} → ${formatDate(row.due)}`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
