import React, { useMemo, useState } from "react";
import { ChevronRight, ChevronDown, Search, Calendar } from "lucide-react";
import { loadExcel } from "./dataLoader";
import "./App.css";

const sampleData = [
  { level: "Project", project: "S/4 Conversion", subproject: "", activity: "", projectTag: "S/4", owner: "", status: "In Progress", risk: "", start: "2026-03-02", end: "2027-02-28" },
  { level: "Subproject", project: "S/4 Conversion", subproject: "S10 Analysis", activity: "", projectTag: "S/4", owner: "Basis Lead", status: "In Progress", risk: "", stageGate: "Gate 1", start: "2026-03-02", end: "2026-03-31" },
  { level: "Activity", project: "S/4 Conversion", subproject: "S10 Analysis", activity: "Analyse S10 sandbox", projectTag: "S/4", owner: "Basis", status: "In Progress", risk: "", start: "2026-03-02", end: "2026-03-15" },
  { level: "Activity", project: "S/4 Conversion", subproject: "S10 Analysis", activity: "Validate custom code", projectTag: "S/4", owner: "Basis / Dev", status: "In Progress", risk: "", start: "2026-03-10", end: "2026-03-25" },
  { level: "Activity", project: "S/4 Conversion", subproject: "S10 Analysis", activity: "Validate SPAU/SPDD impact", projectTag: "S/4", owner: "Basis", status: "In Progress", risk: "", start: "2026-03-10", end: "2026-03-25" },
  { level: "Activity", project: "S/4 Conversion", subproject: "S10 Analysis", activity: "Identify conversion blockers", projectTag: "S/4", owner: "Architecture", status: "In Progress", risk: "", start: "2026-03-20", end: "2026-03-31" },

  { level: "Project", project: "VIM Customizing", subproject: "", activity: "", projectTag: "Enhancements", owner: "", status: "Not Started", risk: "", start: "2026-03-01", end: "2026-05-05" },
  { level: "Subproject", project: "VIM Customizing", subproject: "Ramp Phase", activity: "", projectTag: "Enhancements", owner: "", status: "Not Started", risk: "", stageGate: "Gate 1", start: "2026-03-01", end: "2026-03-10" },
  { level: "Activity", project: "VIM Customizing", subproject: "Ramp Phase", activity: "Solution Workshop", projectTag: "Enhancements", owner: "", status: "Not Started", risk: "", start: "2026-03-01", end: "2026-03-10" },
  { level: "Subproject", project: "VIM Customizing", subproject: "Implementation Phase", activity: "", projectTag: "Enhancements", owner: "", status: "Not Started", risk: "", stageGate: "Gate 2", start: "2026-03-10", end: "2026-03-25" },
  { level: "Activity", project: "VIM Customizing", subproject: "Implementation Phase", activity: "Code customization", projectTag: "Enhancements", owner: "", status: "Not Started", risk: "", start: "2026-03-10", end: "2026-03-20" },
  { level: "Activity", project: "VIM Customizing", subproject: "Implementation Phase", activity: "Code deployment", projectTag: "Enhancements", owner: "", status: "Not Started", risk: "", start: "2026-03-20", end: "2026-03-25" },
  { level: "Subproject", project: "VIM Customizing", subproject: "Testing", activity: "", projectTag: "Enhancements", owner: "", status: "Not Started", risk: "", stageGate: "Gate 3", start: "2026-03-25", end: "2026-04-25" },
  { level: "Activity", project: "VIM Customizing", subproject: "Testing", activity: "SIT", projectTag: "Enhancements", owner: "", status: "Not Started", risk: "", start: "2026-03-25", end: "2026-04-10" },
  { level: "Activity", project: "VIM Customizing", subproject: "Testing", activity: "UAT", projectTag: "Enhancements", owner: "", status: "Not Started", risk: "", start: "2026-04-10", end: "2026-04-20" },
  { level: "Activity", project: "VIM Customizing", subproject: "Testing", activity: "Remediation", projectTag: "Enhancements", owner: "", status: "Not Started", risk: "", start: "2026-04-20", end: "2026-04-25" },
  { level: "Subproject", project: "VIM Customizing", subproject: "Go-Live & Hypercare", activity: "", projectTag: "Enhancements", owner: "", status: "Not Started", risk: "", stageGate: "Gate 4", start: "2026-04-25", end: "2026-05-05" },
  { level: "Activity", project: "VIM Customizing", subproject: "Go-Live & Hypercare", activity: "Code remediation", projectTag: "Enhancements", owner: "", status: "Not Started", risk: "", start: "2026-04-25", end: "2026-05-05" },
];

const projectColors = [
  "#4f46e5",
  "#0891b2",
  "#16a34a",
  "#f59e0b",
  "#dc2626",
  "#9333ea",
  "#2563eb",
  "#c2410c",
];

const statusColor = (status) => {
  if (status === "Completed") return "#16a34a";
  if (status === "In Progress") return "#f59e0b";
  if (status === "At Risk") return "#dc2626";
  if (status === "Not Started") return "#94a3b8";
  return "#60a5fa";
};

function toDate(value) {
  return new Date(`${value}T00:00:00`);
}

function fmtMonth(date) {
  return date.toLocaleString("en-GB", { month: "short", year: "numeric" });
}

function fmtShort(date) {
  return date.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "2-digit",
  });
}

function buildTree(rows) {
  const projects = [];
  const projectMap = new Map();

  rows.forEach((row, index) => {
    if (row.level === "Project") {
      const node = { ...row, id: `p-${index}`, children: [] };
      projects.push(node);
      projectMap.set(row.project, node);
    }
  });

  rows.forEach((row, index) => {
    if (row.level === "Subproject") {
      const parent = projectMap.get(row.project);
      if (!parent) return;
      const node = { ...row, id: `s-${index}`, children: [] };
      parent.children.push(node);
    }
  });

  rows.forEach((row, index) => {
    if (row.level === "Activity") {
      const project = projectMap.get(row.project);
      const sub = project?.children.find((x) => x.subproject === row.subproject);
      if (!sub) return;
      sub.children.push({ ...row, id: `a-${index}` });
    }
  });

  projects.forEach((project) => {
    project.children.forEach((sub) => {
      const datedChildren = sub.children.filter((c) => c.start && c.end);
      if (datedChildren.length > 0) {
        const minStart = new Date(
          Math.min(...datedChildren.map((c) => toDate(c.start).getTime()))
        );
        const maxEnd = new Date(
          Math.max(...datedChildren.map((c) => toDate(c.end).getTime()))
        );
        sub.start = minStart.toISOString().slice(0, 10);
        sub.end = maxEnd.toISOString().slice(0, 10);
      }
    });

    const datedSubs = project.children.filter((s) => s.start && s.end);
    if (datedSubs.length > 0) {
      const minStart = new Date(
        Math.min(...datedSubs.map((s) => toDate(s.start).getTime()))
      );
      const maxEnd = new Date(
        Math.max(...datedSubs.map((s) => toDate(s.end).getTime()))
      );
      project.start = minStart.toISOString().slice(0, 10);
      project.end = maxEnd.toISOString().slice(0, 10);
    }
  });

  return projects;
}

function flattenTree(tree, expandedProjects, expandedSubs, search) {
  const out = [];

  tree.forEach((project) => {
    const projectHit = project.project.toLowerCase().includes(search);
    const visibleSubs = project.children.filter((sub) => {
      const subHit = sub.subproject.toLowerCase().includes(search);
      const actHit = sub.children.some((a) => a.activity.toLowerCase().includes(search));
      return search === "" || projectHit || subHit || actHit;
    });

    if (search && !projectHit && visibleSubs.length === 0) return;

    out.push({ ...project, depth: 0, label: project.project, kind: "Project" });

    if (expandedProjects.has(project.id)) {
      visibleSubs.forEach((sub) => {
        out.push({ ...sub, depth: 1, label: sub.subproject, kind: "Subproject" });

        if (expandedSubs.has(sub.id)) {
          sub.children
            .filter((a) => search === "" || a.activity.toLowerCase().includes(search))
            .forEach((activity) => {
              out.push({ ...activity, depth: 2, label: activity.activity, kind: "Activity" });
            });
        }
      });
    }
  });

  return out;
}

export default function App() {
  const [data, setData] = useState(sampleData);
  const [expandedProjects, setExpandedProjects] = useState(new Set());
  const [expandedSubs, setExpandedSubs] = useState(new Set());
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState("Subprojects");
  const [selectedProjects, setSelectedProjects] = useState([]);

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const rows = await loadExcel(file);
    setData(rows);
  };

  const filteredData = useMemo(() => {
    if (selectedProjects.length === 0) return data;
    return data.filter((row) => selectedProjects.includes(row.project));
  }, [data, selectedProjects]);

  const tree = useMemo(() => buildTree(filteredData), [filteredData]);

  React.useEffect(() => {
    if (viewMode === "Projects") {
      setExpandedProjects(new Set());
      setExpandedSubs(new Set());
    } else if (viewMode === "Subprojects") {
      setExpandedProjects(new Set(tree.map((p) => p.id)));
      setExpandedSubs(new Set());
    } else if (viewMode === "Activities") {
      setExpandedProjects(new Set(tree.map((p) => p.id)));
      setExpandedSubs(new Set(tree.flatMap((p) => p.children.map((s) => s.id))));
    }
  }, [viewMode, tree]);

  const flatRows = useMemo(
    () => flattenTree(tree, expandedProjects, expandedSubs, search.trim().toLowerCase()),
    [tree, expandedProjects, expandedSubs, search]
  );

  const allDated = data.filter((d) => d.start && d.end);

  const globalMinDate = allDated.length
    ? new Date(Math.min(...allDated.map((d) => toDate(d.start).getTime())))
    : new Date("2026-01-01");

  const globalMaxDate = allDated.length
    ? new Date(Math.max(...allDated.map((d) => toDate(d.end).getTime())))
    : new Date("2026-12-31");

  const visibleRange = useMemo(() => {
    const dates = flatRows
      .flatMap((r) => [r.start, r.end])
      .filter(Boolean)
      .map((d) => new Date(d).getTime());

    if (dates.length === 0) return null;

    const pad = 1000 * 60 * 60 * 24 * 10;

    return {
      start: new Date(Math.min(...dates) - pad),
      end: new Date(Math.max(...dates) + pad),
    };
  }, [flatRows]);

  const minDate = visibleRange?.start ?? globalMinDate;
  const maxDate = visibleRange?.end ?? globalMaxDate;
  const totalDays = Math.max(1, Math.round((maxDate - minDate) / 86400000) + 1);

  const projectOptions = useMemo(
    () => [...new Set(data.map((d) => d.project).filter(Boolean))],
    [data]
  );

  const projectColorMap = useMemo(() => {
    const map = {};
    projectOptions.forEach((p, i) => {
      map[p] = projectColors[i % projectColors.length];
    });
    return map;
  }, [projectOptions]);

  const leftPanelWidth = useMemo(() => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return 420;

    ctx.font = "14px Inter, Segoe UI, Arial, sans-serif";

    let maxWidth = 260;
    flatRows.forEach((row) => {
      const indent = 16 + row.depth * 22 + 28;
      const labelWidth = ctx.measureText(row.label || "").width;
      const ownerWidth = ctx.measureText(row.owner || "").width;
      const total = indent + labelWidth + 130 + ownerWidth + 110;
      if (total > maxWidth) maxWidth = total;
    });

    return Math.min(Math.max(maxWidth, 360), window.innerWidth * 0.45);
  }, [flatRows]);

  const months = [];
  const cursor = new Date(minDate.getFullYear(), minDate.getMonth(), 1);
  while (cursor <= maxDate) {
    const start = new Date(cursor);
    const end = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0);
    const boundedStart = start < minDate ? minDate : start;
    const boundedEnd = end > maxDate ? maxDate : end;
    const days = Math.round((boundedEnd - boundedStart) / 86400000) + 1;
    months.push({
      label: fmtMonth(cursor),
      widthPct: (days / totalDays) * 100,
    });
    cursor.setMonth(cursor.getMonth() + 1);
  }

  const today = new Date();
  const todayPct = ((today - minDate) / 86400000 / totalDays) * 100;

  const toggleProject = (id) => {
    const next = new Set(expandedProjects);
    next.has(id) ? next.delete(id) : next.add(id);
    setExpandedProjects(next);
  };

  const toggleSub = (id) => {
    const next = new Set(expandedSubs);
    next.has(id) ? next.delete(id) : next.add(id);
    setExpandedSubs(next);
  };

  return (
    <div className="app-shell">
      <div className="top-card">
        <div>
          <h1>Fusion Interactive Gantt</h1>
          <p>Interactive Project → Subproject → Activity hierarchy with a timeline view.</p>
        </div>
        <div className="top-actions">
          <button onClick={() => setViewMode("Projects")}>Projects</button>
          <button onClick={() => setViewMode("Activities")}>Activities</button>
        </div>
      </div>

      <div className="filter-group">
        <select value={viewMode} onChange={(e) => setViewMode(e.target.value)}>
          <option value="Projects">Projects</option>
          <option value="Subprojects">Subprojects</option>
          <option value="Activities">Activities</option>
        </select>

        <select
          value=""
          onChange={(e) => {
            const value = e.target.value;
            if (!value) return;
            if (!selectedProjects.includes(value)) {
              setSelectedProjects([...selectedProjects, value]);
            }
          }}
        >
          <option value="">Select project...</option>
          {projectOptions.map((project) => (
            <option key={project} value={project}>
              {project}
            </option>
          ))}
        </select>
      </div>

      <div className="selected-projects">
        {selectedProjects.map((project) => (
          <button
            key={project}
            className="project-chip"
            onClick={() => setSelectedProjects(selectedProjects.filter((p) => p !== project))}
          >
            {project} ✕
          </button>
        ))}

        {selectedProjects.length > 0 && (
          <button className="project-chip clear" onClick={() => setSelectedProjects([])}>
            Clear all
          </button>
        )}
      </div>

      <div className="toolbar">
        <input type="file" accept=".xlsx" onChange={handleUpload} />
        <div className="search-box">
          <Search size={16} />
          <input
            type="text"
            placeholder="Search project, subproject, activity..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="date-range">
          <Calendar size={16} />
          <span>{fmtShort(minDate)} – {fmtShort(maxDate)}</span>
        </div>
      </div>

      <div className="gantt-card">
        <div className="gantt-grid" style={{ gridTemplateColumns: `${leftPanelWidth}px 1fr` }}>
          <div className="left-panel">
            <div className="header-row">
              <div>Task</div>
              <div>Owner</div>
              <div>Status</div>
            </div>

            {flatRows.map((row) => (
              <div key={row.id} className="body-row">
                <div className="task-cell" style={{ paddingLeft: `${16 + row.depth * 22}px` }}>
                  {row.kind === "Project" ? (
                    <button className="icon-btn" onClick={() => toggleProject(row.id)}>
                      {expandedProjects.has(row.id) ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                    </button>
                  ) : row.kind === "Subproject" ? (
                    <button className="icon-btn" onClick={() => toggleSub(row.id)}>
                      {expandedSubs.has(row.id) ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                    </button>
                  ) : (
                    <span className="icon-spacer" />
                  )}
                  <span className={`label ${row.kind.toLowerCase()}`}>{row.label}</span>
                </div>
                <div className="owner-cell">{row.owner || ""}</div>
                <div className="status-cell">{row.status || ""}</div>
              </div>
            ))}
          </div>

          <div className="right-panel">
            <div className="timeline-header">
              {months.map((m) => (
                <div key={m.label} className="month-cell" style={{ width: `${m.widthPct}%` }}>
                  {m.label}
                </div>
              ))}
            </div>

            <div className="timeline-scroll">
              <div className="timeline-body">
                <div className="today-line" style={{ left: `${todayPct}%` }} />

                {flatRows.map((row) => {
                  if (!row.start || !row.end) {
                    return <div key={`${row.id}-line`} className="timeline-row" />;
                  }

                  const start = toDate(row.start);
                  const end = toDate(row.end);
                  const left = ((start - minDate) / 86400000 / totalDays) * 100;
                  const width = (((end - start) / 86400000 + 1) / totalDays) * 100;

                  const barHeight =
                    row.kind === "Project"
                      ? 24
                      : row.kind === "Subproject"
                      ? 20
                      : 20;

                  return (
                    <div key={`${row.id}-line`} className="timeline-row">
                      <div
                        className="bar"
                        style={{
                          left: `${left}%`,
                          width: `${Math.max(width, 0.8)}%`,
                          height: `${barHeight}px`,
                          top: `${(44 - barHeight) / 2}px`,
                          background:
                            row.kind === "Project"
                              ? projectColorMap[row.project] || "#4f46e5"
                              : row.kind === "Subproject"
                              ? "#60a5fa"
                              : statusColor(row.status),
                          opacity: row.kind === "Activity" ? 1 : 0.9,
                        }}
                        title={`${row.label}: ${fmtShort(start)} → ${fmtShort(end)}`}
                      >
                        {row.kind === "Activity" ? row.label : ""}
                      </div>

                      {row.kind === "Subproject" && row.stageGate && (
                        <div
                          className="stage-gate-marker"
                          style={{ left: `${left + Math.max(width, 0.8)}%` }}
                          title={`Stage Gate: ${row.stageGate}`}
                        >
                          ◆
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}