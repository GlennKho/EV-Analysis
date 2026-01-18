// evFunctions.js
// Phase 1 (Imperative) - Q1 to Q6 functions (NO UI code here)

// Q1: total number of vehicles by manufacturer
// Q1 (enhanced): total by manufacturer + breakdown by model
function q1_countByManufacturerAndModel(data) {
  const result = {};

  for (let i = 0; i < data.length; i++) {
    const v = data[i];
    const m = v.Manufacturer;
    const model = v.Model;

    // init manufacturer bucket
    if (!result[m]) {
      result[m] = {
        total: 0,
        models: {}
      };
    }

    // increment totals
    result[m].total++;

    // init model bucket
    if (result[m].models[model]) {
      result[m].models[model]++;
    } else {
      result[m].models[model] = 1;
    }
  }

  return result;
}


// Q2: list models by manufacturer
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

// Q3: longest driving range by manufacturer
function q3_longestRangeByManufacturer(data, manufacturerName) {
  let maxRange = -1;
  let bestModel = null;

  for (let i = 0; i < data.length; i++) {
    const v = data[i];
    if (v.Manufacturer === manufacturerName) {
      if (v.Range_km != null && v.Range_km > maxRange) {
        maxRange = v.Range_km;
        bestModel = v.Model;
      }
    }
  }

  return { model: bestModel, range: maxRange };
}

// Q4: average charging time by charging type
function q4_averageChargeTimeByType(data, chargingType) {
  let total = 0;
  let count = 0;

  for (let i = 0; i < data.length; i++) {
    const v = data[i];
    if (v.Charging_Type === chargingType) {
      const t = v.Charge_Time_hr;
      if (t != null && !Number.isNaN(t)) {
        total += t;
        count++;
      }
    }
  }

  if (count === 0) return null;
  return total / count;
}

// Q5: rank 2025 vehicles by safety rating (top 5)
function q5_top5SafestVehicles2025(data) {
  const list = [];

  for (let i = 0; i < data.length; i++) {
    const v = data[i];
    if (v.Year === 2025 && v.Safety_Rating != null) list.push(v);
  }

  // sort desc by Safety_Rating (imperative)
  for (let i = 0; i < list.length; i++) {
    for (let j = i + 1; j < list.length; j++) {
      if (list[j].Safety_Rating > list[i].Safety_Rating) {
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

// Q6: best-selling vehicle in 2024
function q6_bestSellingVehicle2024(data) {
  let best = null;
  let max = -1;

  for (let i = 0; i < data.length; i++) {
    const v = data[i];
    const sold = v.Units_Sold_2024;

    if (sold != null && sold > max) {
      max = sold;
      best = v;
    }
  }

  return best;
}
