// public/app.js
let VEHICLES = [];

function $(id) {
  return document.getElementById(id);
}

//avoid undefined avgSafety crash
function fmt2(x) {
  const n = Number(x);
  return Number.isNaN(n) ? "N/A" : n.toFixed(2);
}

//dry principle: reused in Q1,2, 3
function mustSelectManufacturer() {
  const m = $("manufacturer").value;
  if (!m) {
    setOutput("Select a manufacturer first.");
    return null;
  }
  return m;
}

function setEnabled(enabled) {
  $("manufacturer").disabled = !enabled;
  $("charging").disabled = !enabled;

  $("btnFull").disabled = !enabled;
  $("btnQ1").disabled = !enabled;
  $("btnQ2").disabled = !enabled;
  $("btnQ3").disabled = !enabled;
  $("btnQ4").disabled = !enabled;
  $("btnQ5").disabled = !enabled;
  $("btnQ6").disabled = !enabled;
}

function setOutput(html) {
  $("output").innerHTML = html;
  $("output").scrollIntoView({ behavior: "smooth" });
}


// Theme Selection
function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);

  const btn = $("themeToggle");
  if (btn) btn.textContent = theme === "dark" ? "☀️ Light" : "🌙 Dark";

  localStorage.setItem("theme", theme);
}

function initTheme() {
  const saved = localStorage.getItem("theme");
  const theme = saved === "dark" ? "dark" : "light";
  applyTheme(theme);
}

function toggleTheme() {
  const current = document.documentElement.getAttribute("data-theme");
  const next = current === "dark" ? "light" : "dark";
  applyTheme(next);
}

//no repeat values and sorts a-z
function uniqueValues(data, fieldName) {
  const list = [];

  for (let i = 0; i < data.length; i++) {
    const val = data[i][fieldName];
    if (val == null) continue;

    let exists = false;
    for (let j = 0; j < list.length; j++) {
      if (list[j] === val) {
        exists = true;
        break;
      }
    }
    if (!exists) list.push(val);
  }

  //sorts alphabeticaly
  for (let i = 0; i < list.length; i++) {
    for (let j = i + 1; j < list.length; j++) {
      if (String(list[j]).toLowerCase() < String(list[i]).toLowerCase()) {
        const tmp = list[i];
        list[i] = list[j];
        list[j] = tmp;
      }
    }
  }

  return list;
}

//menu for manufacturer
function fillManufacturerSelect(items) {
  const sel = $("manufacturer");
  while (sel.firstChild) sel.removeChild(sel.firstChild);

  const def = document.createElement("option");
  def.value = "";
  def.textContent = "— Select —";
  sel.appendChild(def);

  for (let i = 0; i < items.length; i++) {
    const opt = document.createElement("option");
    opt.value = items[i];
    opt.textContent = items[i];
    sel.appendChild(opt);
  }
}

//menu for charging type
function fillChargingSelect(items) {
  const sel = $("charging");
  while (sel.firstChild) sel.removeChild(sel.firstChild);

  const def = document.createElement("option");
  def.value = "";
  def.textContent = "— Select —";
  sel.appendChild(def);

  for (let i = 0; i < items.length; i++) {
    const opt = document.createElement("option");
    opt.value = items[i];
    opt.textContent = items[i];
    sel.appendChild(opt);
  }
}

// helpers for data table
function clearDataTable() {
  const head = $("dataHead");
  const body = $("dataBody");
  while (head.firstChild) head.removeChild(head.firstChild);
  while (body.firstChild) body.removeChild(body.firstChild);
}


function renderTableFromColumnsAndRows(columns, rows) {
  clearDataTable();

  const head = $("dataHead");
  const body = $("dataBody");

  const trH = document.createElement("tr");
  for (let i = 0; i < columns.length; i++) {
    const th = document.createElement("th");
    th.textContent = columns[i];
    trH.appendChild(th);
  }
  head.appendChild(trH);

  for (let r = 0; r < rows.length; r++) {
    const tr = document.createElement("tr");
    for (let c = 0; c < columns.length; c++) {
      const td = document.createElement("td");
      const val = rows[r][c];
      td.textContent = val == null ? "" : String(val);
      tr.appendChild(td);
    }
    body.appendChild(tr);
  }
}

//Original datasetr
function renderFullDatasetTable(data) {
  const columns = [
    "Vehicle_ID",
    "Manufacturer",
    "Model",
    "Year",
    "Battery_Type",
    "Battery_Capacity_kWh",
    "Range_km",
    "Charging_Type",
    "Charge_Time_hr",
    "Price_USD",
    "Country_of_Manufacture",
    "Autonomous_Level",
    "CO2_Emissions_g_per_km",
    "Safety_Rating",
    "Units_Sold_2024",
    "Warranty_Years",
  ];

  const rows = [];
  for (let r = 0; r < data.length; r++) {
    const row = data[r];
    const out = [];
    for (let c = 0; c < columns.length; c++) {
      const key = columns[c];
      out.push(row[key] == null ? "" : row[key]);
    }
    rows.push(out);
  }

  renderTableFromColumnsAndRows(columns, rows);
}

//loads data automatically
async function loadDataAuto() {
  try {
    setEnabled(false);

    const res = await fetch("/data");
    if (!res.ok) throw new Error("HTTP " + res.status);

    const data = await res.json();
    if (!Array.isArray(data)) throw new Error("Dataset is not an array");

    VEHICLES = data;
    $("count").textContent = String(VEHICLES.length);

    const manufacturers = uniqueValues(VEHICLES, "Manufacturer");
    const chargingTypes = uniqueValues(VEHICLES, "Charging_Type");

    fillManufacturerSelect(manufacturers);
    fillChargingSelect(chargingTypes);

    // Default right table
    renderFullDatasetTable(VEHICLES);

    setEnabled(true);

    setOutput("Run Q1–Q6. The table changes based on the selected question.");
  } catch (e) {
    setOutput("Data failed to load. Check /data endpoint and dataset JSON.");
  }
}

//handler for button
function showFullDataset() {
  if (!VEHICLES || VEHICLES.length === 0) return setOutput("Dataset not loaded yet.");
  renderFullDatasetTable(VEHICLES);
  setOutput("<b>Full dataset table restored.</b>");
}

function runQ1() {
  const m = mustSelectManufacturer();
  if (!m) return;

  const breakdown = q1_breakdownForManufacturer(VEHICLES, m);

  // sort models by count desc (imperative)
  const modelNames = [];
  for (const model in breakdown.models) modelNames.push(model);

  for (let i = 0; i < modelNames.length; i++) {
    for (let j = i + 1; j < modelNames.length; j++) {
      const a = modelNames[i];
      const b = modelNames[j];
      if (breakdown.models[b] > breakdown.models[a]) {
        const tmp = modelNames[i];
        modelNames[i] = modelNames[j];
        modelNames[j] = tmp;
      }
    }
  }

  setOutput(`<b>Q1. Breakdown for ${breakdown.manufacturer}</b><br/><b>Total vehicles:</b> ${breakdown.total}`);

  const columns = ["Manufacturer", "Model", "Count"];
  const rows = [];

  for (let i = 0; i < modelNames.length; i++) {
    const name = modelNames[i];
    rows.push([breakdown.manufacturer, name, breakdown.models[name]]);
  }
  if (rows.length === 0) rows.push([breakdown.manufacturer, "(none)", 0]);

  renderTableFromColumnsAndRows(columns, rows);
}

function runQ2() {
  const m = mustSelectManufacturer();
  if (!m) return;

  const models = q2_getModelsByManufacturer(VEHICLES, m);

  const html = `<b>Q2. All models from manufacturer ${m}:</b>`;
  if (models.length === 0) html += "<p>No models found.</p>";
  else {
    html += "<ul>";
    for (let i = 0; i < models.length; i++) html += "<li>" + models[i] + "</li>";
    html += "</ul>";
  }
  setOutput(html);

  const columns = ["Manufacturer", "Model"];
  const rows = [];

  for (let i = 0; i < models.length; i++) rows.push([m, models[i]]);
  if (rows.length === 0) rows.push([m, "(none)"]);

  renderTableFromColumnsAndRows(columns, rows);
}

function runQ3() {
  const m = mustSelectManufacturer();
  if (!m) return;

  const res = q3_longestRangeByManufacturer(VEHICLES, m);

  if (!res.model || res.range < 0) {
    setOutput("No range data found for " + m + ".");
    renderTableFromColumnsAndRows(["Manufacturer", "Model", "Range_km"], [[m, "(none)", ""]]);
    return;
  }

  setOutput(`<b>Q3. Longest range for ${m}:</b><br/><b>Model:</b> ${res.model}<br/><b>Range:</b> ${res.range} km`);
  renderTableFromColumnsAndRows(["Manufacturer", "Model", "Range_km"], [[m, res.model, res.range]]);
}

function runQ4() {
  const t = $("charging").value;
  if (!t) return setOutput("Select a charging type first.");

  const avg = q4_averageChargeTimeByType(VEHICLES, t);

  setOutput(
    `<b>Q4 — Average charge time for ${t}:</b><br/>${avg == null ? "No data found." : avg.toFixed(3) + " hours"}`
  );

  renderTableFromColumnsAndRows(
    ["Charging_Type", "Average_Charge_Time_hr"],
    [[t, avg == null ? "N/A" : avg.toFixed(3)]]
  );
}

function runQ5() {
  const top = q5_top5SafestVehicles2025(VEHICLES);

  let html =
    "<b>Q5. Top 5 safest UNIQUE vehicles in 2025 (average by Manufacturer + Model):</b>" +
    "<p><i>Tie-breakers: Rated by SaFety rating, Warranty, then Records</i></p>";

  if (!top || top.length === 0) {
    setOutput(html + "<p>No 2025 vehicles found.</p>");
    renderTableFromColumnsAndRows(
      ["Rank", "Manufacturer", "Model", "Avg_Safety", "Avg_Warranty", "Safety_Used"],
      [["", "(none)", "", "", "", ""]]
    );
    return;
  }

  html += "<ol>";
  for (let i = 0; i < top.length; i++) {
    const s = fmt2(top[i].avgSafety);
    const w = fmt2(top[i].avgWarranty);

    html += `<li><b>${top[i].Manufacturer}</b> : ${top[i].Model}
      (Avg Safety ${s}, Avg Warranty ${w} yrs, Safety Ratings Used = ${top[i].safetyUsed})</li>`;
  }
  html += "</ol>";
  setOutput(html);

  const columns = [
    "Rank",
    "Manufacturer",
    "Model",
    "Avg_Safety",
    "Avg_Warranty",
    "Safety_Ratings_Used",
  ];

  const rows = [];

  for (let i = 0; i < top.length; i++) {
    rows.push([
      i + 1,
      top[i].Manufacturer,
      top[i].Model,
      fmt2(top[i].avgSafety),
      fmt2(top[i].avgWarranty),
      top[i].safetyUsed,
    ]);
  }

  renderTableFromColumnsAndRows(columns, rows);
}

function runQ6() {
  const best = q6_bestSellingVehicle2024(VEHICLES);

  if (!best) {
    setOutput("No sales data found.");
    renderTableFromColumnsAndRows(["Manufacturer", "Model", "Units_Sold_2024"], [["(none)", "", ""]]);
    return;
  } //returns "none" in case data doesn't load

  setOutput(
    `<b>Q6. Best-selling vehicle in 2024:</b><br/><b>${best.Manufacturer}</b> : ${best.Model}<br/><b>Units Sold 2024:</b> ${best.Units_Sold_2024}`
  );

  renderTableFromColumnsAndRows(
    ["Manufacturer", "Model", "Color", "Country Manufacture", "Units_Sold_2024"],
    [[best.Manufacturer, best.Model, best.Color, best.Country_of_Manufacture, best.Units_Sold_2024]]
  );
}


window.addEventListener("DOMContentLoaded", () => {
  initTheme();
  $("themeToggle").addEventListener("click", toggleTheme);

  loadDataAuto();

  $("btnFull").addEventListener("click", showFullDataset);
  $("btnQ1").addEventListener("click", runQ1);
  $("btnQ2").addEventListener("click", runQ2);
  $("btnQ3").addEventListener("click", runQ3);
  $("btnQ4").addEventListener("click", runQ4);
  $("btnQ5").addEventListener("click", runQ5);
  $("btnQ6").addEventListener("click", runQ6);
});
