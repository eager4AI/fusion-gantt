import React, { useMemo, useState } from "react";
import { ChevronRight, ChevronDown, Filter, Calendar, Search } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

const data = [
  { level: "Project", project: "S/4 Conversion", subproject: "", activity: "", projectTag: "S/4", owner: "", status: "In Progress", risk: "", start: "2026-03-02", end: "2027-02-28" },
  { level: "Subproject", project: "S/4 Conversion", subproject: "S10 Analysis", activity: "", projectTag: "S/4", owner: "Basis Lead", status: "In Progress", risk: "", start: "2026-03-02", end: "2026-03-31" },
  { level: "Activity", project: "S/4 Conversion", subproject: "S10 Analysis", activity: "Analyse S10 sandbox", projectTag: "S/4", owner: "Basis", status: "In Progress", risk: "", start: "2026-03-02", end: "2026-03-15" },
  { level: "Activity", project: "S/4 Conversion", subproject: "S10 Analysis", activity: "Validate custom code", projectTag: "S/4", owner: "Basis / Dev", status: "In Progress", risk: "", start: "2026-03-10", end: "2026-03-25" },
  { level: "Activity", project: "S/4 Conversion", subproject: "S10 Analysis", activity: "Validate SPAU/SPDD impact", projectTag: "S/4", owner: "Basis", status: "In Progress", risk: "", start: "2026-03-10", end: "2026-03-25" },
  { level: "Activity", project: "S/4 Conversion", subproject: "S10 Analysis", activity: "Identify conversion blockers", projectTag: "S/4", owner: "Architecture", status: "In Progress", risk: "", start: "2026-03-20", end: "2026-03-31" },
  { level: "Subproject", project: "S/4 Conversion", subproject: "S03 Upgrade Sandbox", activity: "", projectTag: "S/4", owner: "Basis Lead", status: "Not Started", risk: "Medium", start: "2026-03-16", end: "2026-07-31" },
  { level: "Activity", project: "S/4 Conversion", subproject: "S03 Upgrade Sandbox", activity: "Build S03 sandbox", projectTag: "S/4", owner: "Basis", status: "In Progress", risk: "Medium", start: "2026-03-16", end: "2026-04-30" },
  { level: "Activity", project: "S/4 Conversion", subproject: "S03 Upgrade Sandbox", activity: "Provision ATC analysis", projectTag: "S/4", owner: "Basis", status: "Not Started", risk: "Medium", start: "2026-04-01", end: "2026-05-15" },
  { level: "Activity", project: "S/4 Conversion", subproject: "S03 Upgrade Sandbox", activity: "Run SUM/DMO sandbox conversion", projectTag: "S/4", owner: "Basis", status: "Not Started", risk: "Medium", start: "2026-06-01", end: "2026-07-15" },
  { level: "Activity", project: "S/4 Conversion", subproject: "S03 Upgrade Sandbox", activity: "Initial technical validation", projectTag: "S/4", owner: "Basis / Arch", status: "Not Started", risk: "Medium", start: "2026-07-15", end: "2026-07-25" },
  { level: "Activity", project: "S/4 Conversion", subproject: "S03 Upgrade Sandbox", activity: "Identify remediation backlog", projectTag: "S/4", owner: "Architecture", status: "Not Started", risk: "Medium", start: "2026-07-25", end: "2026-07-31" },
  { level: "Subproject", project: "S/4 Conversion", subproject: "Pre-Conversion Preparation", activity: "", projectTag: "S/4", owner: "Architecture", status: "Not Started", risk: "Medium", start: "2026-04-01", end: "2026-06-19" },
  { level: "Activity", project: "S/4 Conversion", subproject: "Pre-Conversion Preparation", activity: "Custom code remediation", projectTag: "S/4", owner: "Dev Team", status: "Not Started", risk: "Medium", start: "2026-04-01", end: "2026-06-19" },
  { level: "Activity", project: "S/4 Conversion", subproject: "Pre-Conversion Preparation", activity: "CVI preparation", projectTag: "S/4", owner: "Finance", status: "Not Started", risk: "High", start: "2026-04-01", end: "2026-06-19" },
  { level: "Activity", project: "S/4 Conversion", subproject: "Pre-Conversion Preparation", activity: "Data consistency checks", projectTag: "S/4", owner: "Basis", status: "Not Started", risk: "Medium", start: "2026-04-01", end: "2026-06-19" },
  { level: "Subproject", project: "POS", subproject: "Inbound", activity: "", projectTag: "Enhancements", owner: "", status: "", risk: "", start: "2026-02-01", end: "2026-05-31" },
  { level: "Activity", project: "POS", subproject: "Inbound", activity: "Design", projectTag: "Enhancements", owner: "", status: "", risk: "", start: "2026-02-01", end: "2026-05-31" },
  { level: "Project", project: "VIM Customizing", subproject: "", activity: "", projectTag: "Enhancements", owner: "", status: "", risk: "", start: "2026-03-01", end: "2026-05-05" },
  { level: "Subproject", project: "VIM Customizing", subproject: "Ramp Phase", activity: "", projectTag: "Enhancements", owner: "", status: "", risk: "", start: "2026-03-01", end: "2026-03-10" },
  { level: "Activity", project: "VIM Customizing", subproject: "Ramp Phase", activity: "Solution Workshop ⭐", projectTag: "Enhancements", owner: "", status: "", risk: "", start: "2026-03-01", end: "2026-03-10" },
  { level: "Subproject", project: "VIM Customizing", subproject: "Implementation Phase", activity: "", projectTag: "Enhancements", owner: "", status: "", risk: "", start: "2026-03-10", end: "2026-03-25" },
  { level: "Activity", project: "VIM Customizing", subproject: "Implementation Phase", activity: "Code customization", projectTag: "Enhancements", owner: "", status: "", risk: "", start: "2026-03-10", end: "2026-03-20" },
  { level: "Activity", project: "VIM Customizing", subproject: "Implementation Phase", activity: "Code deployment", projectTag: "Enhancements", owner: "", status: "", risk: "", start: "2026-03-20", end: "2026-03-25" },
  { level: "Subproject", project: "VIM Customizing", subproject: "Testing", activity: "", projectTag: "Enhancements", owner: "", status: "", risk: "", start: "2026-03-25", end: "2026-04-25" },
  { level: "Activity", project: "VIM Customizing", subproject: "Testing", activity: "SIT", projectTag: "Enhancements", owner: "", status: "", risk: "", start: "2026-03-25", end: "2026-04-10" },
  { level: "Activity", project: "VIM Customizing", subproject: "Testing", activity: "UAT", projectTag: "Enhancements", owner: "", status: "", risk: "", start: "2026-04-10", end: "2026-04-20" },
  { level: "Activity", project: "VIM Customizing", subproject: "Testing", activity: "Remediation", projectTag: "Enhancements", owner: "", status: "", risk: "", start: "2026-04-20", end: "2026-04-25" },
  { level: "Subproject", project: "VIM Customizing", subproject: "Go-Live & Hypercare", activity: "", projectTag: "Enhancements", owner: "", status: "", risk: "", start: "2026-04-25", end: "2026-05-05" },
  { level: "Activity", project: "VIM Customizing", subproject: "Go-Live & Hypercare", activity: "Code remediation", projectTag: "Enhancements", owner: "", status: "", risk: "", start: "2026-04-25", end: "2026-05-05" },
  { level: "Project", project: "Asset MgM", subproject: "", activity: "", projectTag: "Enhancements", owner: "", status: "", risk: "", start: "2026-03-01", end: "2026-05-31" },
  { level: "Subproject", project: "Asset MgM", subproject: "Ramp Phase", activity: "", projectTag: "Enhancements", owner: "", status: "", risk: "", start: "2026-03-01", end: "2026-03-10" },
  { level: "Activity", project: "Asset MgM", subproject: "Ramp Phase", activity: "Solution Workshop ⭐", projectTag: "Enhancements", owner: "", status: "", risk: "", start: "2026-03-01", end: "2026-03-10" },
  { level: "Subproject", project: "Asset MgM", subproject: "Implementation Phase", activity: "", projectTag: "Enhancements", owner: "", status: "", risk: "", start: "2026-03-10", end: "2026-04-15" },
  { level: "Activity", project: "Asset MgM", subproject: "Implementation Phase", activity: "Configuration", projectTag: "Enhancements", owner: "", status: "", risk: "", start: "2026-03-10", end: "2026-04-01" },
  { level: "Activity", project: "Asset MgM", subproject: "Implementation Phase", activity: "Data migration", projectTag: "Enhancements", owner: "", status: "", risk: "", start: "2026-04-01", end: "2026-04-15" },
  { level: "Subproject", project: "Asset MgM", subproject: "Testing", activity: "", projectTag: "Enhancements", owner: "", status: "", risk: "", start: "2026-04-15", end: "2026-05-15" },
  { level: "Activity", project: "Asset MgM", subproject: "Testing", activity: "SIT", projectTag: "Enhancements", owner: "", status: "", risk: "", start: "2026-04-15", end: "2026-04-30" },
  { level: "Activity", project: "Asset MgM", subproject: "Testing", activity: "UAT", projectTag: "Enhancements", owner: "", status: "", risk: "", start: "2026-04-30", end: "2026-05-10" },
  { level: "Activity", project: "Asset MgM", subproject: "Testing", activity: "Remediation", projectTag: "Enhancements", owner: "", status: "", risk: "", start: "2026-05-10", end: "2026-05-15" },
  { level: "Subproject", project: "Asset MgM", subproject: "Go-Live & Hypercare", activity: "", projectTag: "Enhancements", owner: "", status: "", risk: "", start: "2026-05-15", end: "2026-05-31" },
  { level: "Activity", project: "Asset MgM", subproject: "Go-Live & Hypercare", activity: "Stabilisation", projectTag: "Enhancements", owner: "", status: "", risk: "", start: "2026-05-15", end: "2026-05-31" },
];

const statusColors = {
  "In Progress": "bg-indigo-400",
  "Not Started": "bg-orange-300",
  Completed: "bg-green-500",
  Blocked: "bg-red-400",
  "": "bg-sky-500",
};

function toDate(s) {
  return new Date(s + "T00:00:00");
}

function fmtMonth(d) {
  return d.toLocaleString("en-GB", { month: "short", year: "numeric" });
}

function fmtShort(d) {
  return d.toLocaleString("en-GB", { day: "2-digit", month: "short", year: "2-digit" });
}

function buildHierarchy(rows) {
  const projects = [];
  const byProject = new Map();

  rows.forEach((r, idx) => {
    if (r.level === "Project") {
      const node = { ...r, id: `p-${idx}`, children: [], expanded: true };
      byProject.set(r.project, node);
      projects.push(node);
    }
  });

  rows.forEach((r, idx) => {
    if (r.level === "Subproject") {
      const parent = byProject.get(r.project);
      if (!parent) return;
      const node = { ...r, id: `s-${idx}`, children: [], expanded: true };
      parent.children.push(node);
    }
  });

  rows.forEach((r, idx) => {
    if (r.level === "Activity") {
      const parent = byProject.get(r.project)?.children.find((s) => s.subproject === r.subproject);
      if (!parent) return;
      parent.children.push({ ...r, id: `a-${idx}` });
    }
  });

  return projects;
}

function flatten(nodes, expandedProjects, expandedSubs, search, tagFilter) {
  const out = [];
  nodes.forEach((p) => {
    const pMatch = [p.project, p.projectTag].join(" ").toLowerCase().includes(search);
    const tagOk = tagFilter.size === 0 || tagFilter.has(p.projectTag || "");

    const visibleSubs = p.children.filter((s) => {
      const sMatch = [s.project, s.subproject, s.projectTag].join(" ").toLowerCase().includes(search);
      const visibleActs = s.children.filter((a) => [a.project, a.subproject, a.activity, a.projectTag].join(" ").toLowerCase().includes(search));
      return tagOk && (pMatch || sMatch || visibleActs.length > 0 || search === "");
    });

    if (!tagOk || (search && !pMatch && visibleSubs.length === 0)) return;

    out.push({ ...p, depth: 0, label: p.project, kind: "Project" });
    if (expandedProjects.has(p.id)) {
      visibleSubs.forEach((s) => {
        out.push({ ...s, depth: 1, label: s.subproject, kind: "Subproject" });
        if (expandedSubs.has(s.id)) {
          s.children
            .filter((a) => [a.project, a.subproject, a.activity, a.projectTag].join(" ").toLowerCase().includes(search) || search === "")
            .forEach((a) => out.push({ ...a, depth: 2, label: a.activity, kind: "Activity" }));
        }
      });
    }
  });
  return out;
}

export default function FusionInteractiveGantt() {
  const hierarchy = useMemo(() => buildHierarchy(data), []);
  const [expandedProjects, setExpandedProjects] = useState(new Set(hierarchy.map((p) => p.id)));
  const [expandedSubs, setExpandedSubs] = useState(
    new Set(hierarchy.flatMap((p) => p.children.map((s) => s.id)))
  );
  const [search, setSearch] = useState("");
  const [selectedTags, setSelectedTags] = useState(new Set());

  const tags = Array.from(new Set(data.map((d) => d.projectTag).filter(Boolean)));
  const searchText = search.trim().toLowerCase();

  const rows = useMemo(
    () => flatten(hierarchy, expandedProjects, expandedSubs, searchText, selectedTags),
    [hierarchy, expandedProjects, expandedSubs, searchText, selectedTags]
  );

  const dateMin = useMemo(() => new Date(Math.min(...data.filter((d) => d.start).map((d) => toDate(d.start).getTime()))), []);
  const dateMax = useMemo(() => new Date(Math.max(...data.filter((d) => d.end).map((d) => toDate(d.end).getTime()))), []);
  const totalDays = Math.max(1, Math.round((dateMax - dateMin) / 86400000) + 1);

  const months = [];
  const cursor = new Date(dateMin.getFullYear(), dateMin.getMonth(), 1);
  while (cursor <= dateMax) {
    const mStart = new Date(cursor);
    const mEnd = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0);
    const start = mStart < dateMin ? dateMin : mStart;
    const end = mEnd > dateMax ? dateMax : mEnd;
    const days = Math.round((end - start) / 86400000) + 1;
    months.push({ label: fmtMonth(cursor), widthPct: (days / totalDays) * 100, start: new Date(start) });
    cursor.setMonth(cursor.getMonth() + 1);
  }

  const today = new Date("2026-03-26T00:00:00");
  const todayPct = ((today - dateMin) / 86400000 / totalDays) * 100;

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

  const toggleTag = (tag) => {
    const next = new Set(selectedTags);
    next.has(tag) ? next.delete(tag) : next.add(tag);
    setSelectedTags(next);
  };

  const collapseAll = () => {
    setExpandedProjects(new Set());
    setExpandedSubs(new Set());
  };
  const expandAll = () => {
    setExpandedProjects(new Set(hierarchy.map((p) => p.id)));
    setExpandedSubs(new Set(hierarchy.flatMap((p) => p.children.map((s) => s.id))));
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-[1600px] space-y-4">
        <Card className="rounded-3xl shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <CardTitle className="text-2xl">Fusion Interactive Gantt</CardTitle>
                <p className="mt-1 text-sm text-slate-500">Web-based hierarchical Gantt with proper expand/collapse at Project → Subproject → Activity level.</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Button variant="outline" className="rounded-2xl" onClick={collapseAll}>Collapse all</Button>
                <Button variant="outline" className="rounded-2xl" onClick={expandAll}>Expand all</Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 lg:grid-cols-[1fr_auto]">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <Input className="rounded-2xl pl-9" placeholder="Search project, phase, activity..." value={search} onChange={(e) => setSearch(e.target.value)} />
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <Calendar className="h-4 w-4" />
                {fmtShort(dateMin)} – {fmtShort(dateMax)}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="mr-2 flex items-center gap-2 text-sm text-slate-500"><Filter className="h-4 w-4" /> Project Tag</div>
              {tags.map((tag) => (
                <label key={tag} className="flex items-center gap-2 rounded-2xl border bg-white px-3 py-1 text-sm">
                  <Checkbox checked={selectedTags.has(tag)} onCheckedChange={() => toggleTag(tag)} />
                  {tag}
                </label>
              ))}
              {selectedTags.size > 0 && (
                <Button variant="ghost" size="sm" className="rounded-2xl" onClick={() => setSelectedTags(new Set())}>Clear</Button>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden rounded-3xl shadow-sm">
          <CardContent className="p-0">
            <div className="grid grid-cols-[420px_1fr]">
              <div className="border-r bg-white">
                <div className="grid h-14 grid-cols-[1fr_120px_110px] items-center border-b px-4 text-sm font-medium text-slate-500">
                  <div>Task</div>
                  <div>Owner</div>
                  <div>Status</div>
                </div>
                {rows.map((row) => {
                  const isProject = row.kind === "Project";
                  const isSub = row.kind === "Subproject";
                  return (
                    <div key={row.id} className="grid min-h-[44px] grid-cols-[1fr_120px_110px] items-center border-b px-4 text-sm hover:bg-slate-50">
                      <div className="flex items-center gap-2" style={{ paddingLeft: `${row.depth * 20}px` }}>
                        {isProject ? (
                          <button onClick={() => toggleProject(row.id)} className="rounded p-1 hover:bg-slate-100">
                            {expandedProjects.has(row.id) ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                          </button>
                        ) : isSub ? (
                          <button onClick={() => toggleSub(row.id)} className="rounded p-1 hover:bg-slate-100">
                            {expandedSubs.has(row.id) ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                          </button>
                        ) : (
                          <div className="w-6" />
                        )}
                        <div className={isProject ? "font-semibold" : isSub ? "font-medium" : "text-slate-700"}>{row.label}</div>
                      </div>
                      <div className="text-slate-600">{row.owner || ""}</div>
                      <div>{row.status ? <Badge variant="secondary" className="rounded-xl">{row.status}</Badge> : ""}</div>
                    </div>
                  );
                })}
              </div>

              <div className="relative overflow-x-auto bg-slate-50">
                <div className="sticky top-0 z-20 flex h-14 border-b bg-white">
                  {months.map((m) => (
                    <div key={m.label} className="flex items-center justify-center border-r text-sm font-medium text-slate-500" style={{ width: `${m.widthPct}%` }}>
                      {m.label}
                    </div>
                  ))}
                </div>

                <div className="relative min-w-[1000px]">
                  <div className="absolute inset-y-0 z-10 border-l-2 border-dashed border-slate-400" style={{ left: `${todayPct}%` }} />
                  {months.reduce((acc, m, idx) => {
                    const left = months.slice(0, idx).reduce((s, x) => s + x.widthPct, 0);
                    acc.push(
                      <div key={m.label + "bg"} className="absolute inset-y-0 border-r" style={{ left: `${left}%`, width: `${m.widthPct}%` }} />
                    );
                    return acc;
                  }, [])}

                  {rows.map((row) => {
                    const rowStart = row.start ? toDate(row.start) : null;
                    const rowEnd = row.end ? toDate(row.end) : null;
                    let left = 0;
                    let width = 0;
                    if (rowStart && rowEnd) {
                      left = Math.max(0, ((rowStart - dateMin) / 86400000 / totalDays) * 100);
                      width = Math.max(0.8, (((rowEnd - rowStart) / 86400000 + 1) / totalDays) * 100);
                    }
                    return (
                      <div key={row.id + "timeline"} className="relative h-[44px] border-b">
                        {rowStart && rowEnd && (
                          <div
                            className={`absolute top-1/2 h-6 -translate-y-1/2 rounded-full ${statusColors[row.status ?? ""] || "bg-sky-500"} shadow-sm`}
                            style={{ left: `${left}%`, width: `${width}%` }}
                            title={`${row.label}: ${fmtShort(rowStart)} → ${fmtShort(rowEnd)}`}
                          >
                            <div className="truncate px-3 pt-1 text-xs font-medium text-white">
                              {row.kind === "Activity" ? row.label : ""}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
