// evFunctions.js
//this file holds all function necessary to load Q1-Q6

//Q1. Manufacturer breakdown (requires specific manufacturer)
function q1_breakdownForManufacturer(data, manufacturerName) {
  let total = 0;
  const models = {};

  for (let i = 0; i < data.length; i++) {
    const v = data[i];
    if (v.Manufacturer === manufacturerName) {
      total++;

      const model = v.Model;
      if (models[model]) models[model]++;
      else models[model] = 1;
    }
  }

  return { manufacturer: manufacturerName, total, models };
}

//Q2. list models by same manufacturer
function q2_getModelsByManufacturer(data, manufacturerName) {
  const models = [];

  for (let i = 0; i < data.length; i++) {
    if (data[i].Manufacturer === manufacturerName) {
      const model = data[i].Model;

      let exists = false;
      for (let j = 0; j < models.length; j++) {
        if (models[j] === model) {
          exists = true;
          break;
        }
      }
      if (!exists) models.push(model);
    }
  }

  return models;
}

//Q3. Longest range from manufacturer + which model
function q3_longestRangeByManufacturer(data, manufacturerName) {
  let maxRange = -1;
  let bestModel = null;

  for (let i = 0; i < data.length; i++) {
    const v = data[i];
    if (v.Manufacturer === manufacturerName) {
      const r = Number(v.Range_km);
      if (!Number.isNaN(r) && r > maxRange) {
        maxRange = r;
        bestModel = v.Model;
      }
    }
  }

  return { model: bestModel, range: maxRange };
}

//Q4. average charging time per charging type
function q4_averageChargeTimeByType(data, chargingType) {
  let total = 0;
  let count = 0;

  for (let i = 0; i < data.length; i++) {
    const v = data[i];
    if (v.Charging_Type === chargingType) {
      const t = Number(v.Charge_Time_hr);
      if (!Number.isNaN(t)) { total += t; count++; }
    }
  }

  if (count === 0) return null;
  return total / count;
}

//Q5. Top 5 safest UNIQUE cars in 2025
function q5_top5SafestVehicles2025(data) {
  const grouped = {};

  function normText(x) {
    return String(x ?? "")
      .trim()
      .replace(/\s+/g, " ")
      .replace(/[–—]/g, "-")
      .toLowerCase();
  }

  for (let i = 0; i < data.length; i++) {
    const v = data[i];
    if (v.Year !== 2025) continue;

    const modelText = String(v.Model ?? "").toLowerCase();
    if (modelText.includes("upcoming")) continue;
    const key = normText(v.Manufacturer) + "||" + normText(v.Model);
    if (!grouped[key]) {
      grouped[key] = {
        Manufacturer: String(v.Manufacturer ?? "").trim(),
        Model: String(v.Model ?? "").trim(),

        totalRecords2025: 0,

        safetyTotal: 0,
        safetyUsed: 0,
        avgSafety: 0,

        warrantyTotal: 0,
        warrantyUsed: 0,
        avgWarranty: 0,
      };
    }

    //counts all records for this car in 2025
    grouped[key].totalRecords2025 += 1;

    //safety
    const rating = Number(v.Safety_Rating);
    if (!Number.isNaN(rating)) {
      grouped[key].safetyTotal += rating;
      grouped[key].safetyUsed += 1;
    }

    //waaranty
    const warranty = Number(v.Warranty_Years);
    if (!Number.isNaN(warranty)) {
      grouped[key].warrantyTotal += warranty;
      grouped[key].warrantyUsed += 1;
    }
  }

  //convert to list with averages
  const list = [];
  for (const key in grouped) {
    const g = grouped[key];

    g.avgSafety = g.safetyUsed === 0 ? 0 : g.safetyTotal / g.safetyUsed;
    g.avgWarranty = g.warrantyUsed === 0 ? 0 : g.warrantyTotal / g.warrantyUsed;

    list.push(g);
  }

  //sorts using tie breaker logic
  for (let i = 0; i < list.length; i++) {
    for (let j = i + 1; j < list.length; j++) {
      const a = list[i];
      const b = list[j];

      let swap = false;

      if (b.avgSafety > a.avgSafety) swap = true;
      else if (b.avgSafety === a.avgSafety) {
        if (b.avgWarranty > a.avgWarranty) swap = true;
        else if (b.avgWarranty === a.avgWarranty) {
          if (b.safetyUsed > a.safetyUsed) swap = true;
        }
      }

      if (swap) {
        const tmp = list[i];
        list[i] = list[j];
        list[j] = tmp;
      }
    }
  }

  const top = [];
  for (let i = 0; i < list.length && i < 5; i++) top.push(list[i]);
  return top;
}

// Q6. best-selling vehicle in 2024
function q6_bestSellingVehicle2024(data) {
  let best = null;
  let max = -1;

  for (let i = 0; i < data.length; i++) {
    const v = data[i];
    const sold = Number(v.Units_Sold_2024);
    if (!Number.isNaN(sold) && sold > max) {
      max = sold;
      best = v;
    }
  }

  return best;
}
