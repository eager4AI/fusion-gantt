import * as XLSX from "xlsx";

function excelDateToIso(value) {
  if (value === undefined || value === null || value === "") return "";

  // Already a JS Date
  if (value instanceof Date && !isNaN(value)) {
    return value.toISOString().slice(0, 10);
  }

  // Excel serial number
  if (typeof value === "number") {
    const utcDays = Math.floor(value - 25569);
    const utcValue = utcDays * 86400;
    const dateInfo = new Date(utcValue * 1000);
    return dateInfo.toISOString().slice(0, 10);
  }

  // String date
  const parsed = new Date(value);
  if (!isNaN(parsed)) {
    return parsed.toISOString().slice(0, 10);
  }

  return "";
}

export function loadExcel(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, {
        type: "array",
        cellDates: true,
      });

      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const json = XLSX.utils.sheet_to_json(sheet, { defval: "" });

      const formatted = json.map((row) => ({
  level: row["Level"] || "",
  project: row["Project"] || "",
  subproject: row["Subproject"] || "",
  activity: row["Activity"] || "",
  projectTag: row["Project_Tag"] || "",
  owner: row["Owner"] || "",
  status: row["Status"] || "",
  risk: row["Risk"] || "",
  stageGate: row["Stage Gate"] || "",
  start: excelDateToIso(row["Activity Start Date"]),
  end: excelDateToIso(row["Activity End Date"]),
}));

      resolve(formatted);
    };

    reader.readAsArrayBuffer(file);
  });
}