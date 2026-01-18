// app.js
// UI controller - loads dataset from /data and calls q1-q6 functions

let VEHICLES = [];

function $(id) {
  return document.getElementById(id);
}

function setEnabled(enabled) {
  $("manufacturer").disabled = !enabled;
  $("charging").disabled = !enabled;

  $("btnQ2").disabled = !enabled;
  $("btnQ3").disabled = !enabled;
  $("btnQ4").disabled = !enabled;
  $("btnQ5").disabled = !enabled;
  $("btnQ6").disabled = !enabled;
}

function setStatus(msg, isError) {
  const el = $("status");
  el.textContent = msg;
  el.className = "status " + (isError ? "err" : "ok");
}

function setOutput(html) {
  $("output").innerHTML = html;
}

function fillSelect(selectEl, items) {
  while (selectEl.firstChild) selectEl.removeChild(selectEl.firstChild);

  const opt0 = document.createElement("option");
  opt0.value = "";
  opt0.textContent = "— Select —";
  selectEl.appendChild(opt0);

  for (let i = 0; i < items.length; i++) {
    const opt = document.createElement("option");
    opt.value = items[i];
    opt.textContent = items[i];
    selectEl.appendChild(opt);
  }
}

function uniqueManufacturers(data) {
  const list = [];
  for (let i = 0; i < data.length; i++) {
    const m = data[i].Manufacturer;

    let exists = false;
    for (let j = 0; j < list.length; j++) {
      if (list[j] === m) {
        exists = true;
        break;
      }
    }
    if (!exists) list.push(m);
  }
  return list;
}

function uniqueChargingTypes(data) {
  const list = [];
  for (let i = 0; i < data.length; i++) {
    const t = data[i].Charging_Type;
    if (t == null) continue;

    let exists = false;
    for (let j = 0; j < list.length; j++) {
      if (list[j] === t) {
        exists = true;
        break;
      }
    }
    if (!exists) list.push(t);
  }
  return list;
}

function renderQ1Table(breakdown) {
  const body = $("q1Table");
  while (body.firstChild) body.removeChild(body.firstChild);

  // manufacturer list (so we can sort by total desc)
  const manufacturers = [];
  for (const m in breakdown) manufacturers.push(m);

  // sort manufacturers by total desc (imperative)
  for (let i = 0; i < manufacturers.length; i++) {
    for (let j = i + 1; j < manufacturers.length; j++) {
      const a = manufacturers[i];
      const b = manufacturers[j];
      if (breakdown[b].total > breakdown[a].total) {
        const tmp = manufacturers[i];
        manufacturers[i] = manufacturers[j];
        manufacturers[j] = tmp;
      }
    }
  }

  // render
  for (let i = 0; i < manufacturers.length; i++) {
    const m = manufacturers[i];
    const manObj = breakdown[m];

    // manufacturer row (click to toggle)
    const trMan = document.createElement("tr");
    trMan.className = "man-row";
    trMan.style.cursor = "pointer";

    const tdName = document.createElement("td");
    tdName.textContent = "▶ " + m;

    const tdTotal = document.createElement("td");
    tdTotal.textContent = String(manObj.total);

    trMan.appendChild(tdName);
    trMan.appendChild(tdTotal);
    body.appendChild(trMan);

    // model rows (hidden by default)
    const modelNames = [];
    for (const model in manObj.models) modelNames.push(model);

    // sort models by count desc
    for (let x = 0; x < modelNames.length; x++) {
      for (let y = x + 1; y < modelNames.length; y++) {
        const a = modelNames[x];
        const b = modelNames[y];
        if (manObj.models[b] > manObj.models[a]) {
          const tmp = modelNames[x];
          modelNames[x] = modelNames[y];
          modelNames[y] = tmp;
        }
      }
    }

    const modelRows = [];
    for (let k = 0; k < modelNames.length; k++) {
      const model = modelNames[k];
      const count = manObj.models[model];

      const trModel = document.createElement("tr");
      trModel.className = "model-row";
      trModel.style.display = "none";

      const tdModel = document.createElement("td");
      tdModel.textContent = "   • " + model;

      const tdCount = document.createElement("td");
      tdCount.textContent = String(count);

      trModel.appendChild(tdModel);
      trModel.appendChild(tdCount);
      body.appendChild(trModel);

      modelRows.push(trModel);
    }

    // toggle handler
    trMan.addEventListener("click", () => {
      const isHidden = modelRows.length > 0 && modelRows[0].style.display === "none";

      // update arrow
      tdName.textContent = (isHidden ? "▼ " : "▶ ") + m;

      for (let r = 0; r < modelRows.length; r++) {
        modelRows[r].style.display = isHidden ? "table-row" : "none";
      }
    });
  }
}


async function loadData() {
  try {
    setStatus("Loading dataset from /data ...", false);

    const res = await fetch("/data");
    if (!res.ok) throw new Error("HTTP " + res.status);

    const data = await res.json();
    if (!Array.isArray(data)) throw new Error("Dataset is not an array");

    VEHICLES = data;

    $("count").textContent = String(VEHICLES.length);

    fillSelect($("manufacturer"), uniqueManufacturers(VEHICLES));
    fillSelect($("charging"), uniqueChargingTypes(VEHICLES));

    // Q1 auto-run
    const breakdown = q1_countByManufacturerAndModel(VEHICLES);
    renderQ1Table(breakdown);


    setEnabled(true);
    setStatus("Loaded " + VEHICLES.length + " records successfully.", false);
    setOutput("Dataset loaded. Select inputs and run Q2–Q6.");
  } catch (e) {
    setEnabled(false);
    setStatus("Failed to load dataset. " + e.message, true);
    setOutput("Check that /data works and returns JSON array.");
  }
}

// ---- Run Q2–Q6 ----
function runQ2() {
  const m = $("manufacturer").value;
  if (!m) return setOutput("Select a manufacturer first.");

  const models = q2_getModelsByManufacturer(VEHICLES, m);
  let html = "<b>Q2 — Models for " + m + ":</b>";

  if (models.length === 0) {
    html += "<p>No models found.</p>";
  } else {
    html += "<ul>";
    for (let i = 0; i < models.length; i++) html += "<li>" + models[i] + "</li>";
    html += "</ul>";
  }

  setOutput(html);
}

function runQ3() {
  const m = $("manufacturer").value;
  if (!m) return setOutput("Select a manufacturer first.");

  const res = q3_longestRangeByManufacturer(VEHICLES, m);
  if (!res.model || res.range < 0) return setOutput("No range data found for " + m + ".");

  setOutput(
    "<b>Q3 — Longest range for " + m + ":</b><br/>" +
      "<b>Model:</b> " + res.model + "<br/>" +
      "<b>Range:</b> " + res.range + " km"
  );
}

function runQ4() {
  const t = $("charging").value;
  if (!t) return setOutput("Select a charging type first.");

  const avg = q4_averageChargeTimeByType(VEHICLES, t);
  setOutput(
    "<b>Q4 — Average charge time for " + t + ":</b><br/>" +
      (avg == null ? "No charge time data found." : avg.toFixed(3) + " hours")
  );
}

function runQ5() {
  const top = q5_top5SafestVehicles2025(VEHICLES);

  let html = "<b>Q5 — Top 5 safest vehicles (Year 2025):</b>";
  if (top.length === 0) {
    html += "<p>No 2025 vehicles with safety ratings found.</p>";
  } else {
    html += "<ol>";
    for (let i = 0; i < top.length; i++) {
      html +=
        "<li><b>" +
        top[i].Manufacturer +
        "</b> : " +
        top[i].Model +
        " (Safety " +
        top[i].Safety_Rating +
        ")</li>";
    }
    html += "</ol>";
  }

  setOutput(html);
}

function runQ6() {
  const best = q6_bestSellingVehicle2024(VEHICLES);
  if (!best) return setOutput("No sales data found.");

  setOutput(
    "<b>Q6 — Best-selling vehicle (Units Sold 2024):</b><br/>" +
      "<b>" +
      best.Manufacturer +
      "</b> : " +
      best.Model +
      "<br/><b>Units Sold 2024:</b> " +
      best.Units_Sold_2024
  );
}

// ---- Wire up ----
window.addEventListener("DOMContentLoaded", () => {
  setEnabled(false);

  $("btnLoad").addEventListener("click", loadData);
  $("btnQ2").addEventListener("click", runQ2);
  $("btnQ3").addEventListener("click", runQ3);
  $("btnQ4").addEventListener("click", runQ4);
  $("btnQ5").addEventListener("click", runQ5);
  $("btnQ6").addEventListener("click", runQ6);
});
