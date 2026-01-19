// evFunctions.js
//this file holds all function necessary to load Q1-Q6

//Q1. Manufacturer breakdown (requires specific manufacturer)
function q1_breakdownForManufacturer(data, manufacturerName) {
  let total = 0; //counts how many vehicle matched with manufacturer
  const models = {}; // stores model -> count

  //loop through every record
  for (let i = 0; i < data.length; i++) {
    const v = data[i];
    if (v.Manufacturer === manufacturerName) { //processes if manufacturer matches
      total++;

      //count number of each model under this manufacturer
      const model = v.Model;
      if (models[model]) models[model]++;
      else models[model] = 1;
    }
  }

  return { manufacturer: manufacturerName, total, models };
}

//Q2. list models by same manufacturer
function q2_getModelsByManufacturer(data, manufacturerName) {
  const models = []; // holds unique model names

  for (let i = 0; i < data.length; i++) {
    //only consider rows with selected manufacturer
    if (data[i].Manufacturer === manufacturerName) {
      const model = data[i].Model;

      //check if model is already in array (check for unique)
      let exists = false;
      for (let j = 0; j < models.length; j++) {
        if (models[j] === model) {
          exists = true;
          break;
        }
      }
      //adds only if not present in array
      if (!exists) models.push(model);
    }
  }

  return models;
}

//Q3. Longest range from manufacturer + which model
function q3_longestRangeByManufacturer(data, manufacturerName) {
  let maxRange = -1; // best range found (default)
  let bestModel = null; // holds model name for best range found so far

  for (let i = 0; i < data.length; i++) {
    const v = data[i];
    //check for manufacturer
    if (v.Manufacturer === manufacturerName) {
      const r = Number(v.Range_km);
      //only compare valid number
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
  let total = 0; //total of charge time
  let count = 0; //number of records used 

  for (let i = 0; i < data.length; i++) {
    const v = data[i];
    //only processes record with the same charging type
    if (v.Charging_Type === chargingType) {
      const t = Number(v.Charge_Time_hr);
      // ignore invalid and null charge time
      if (!Number.isNaN(t)) { total += t; count++; }
    }
  }
  //prevents divide by zero
  if (count === 0) return null;
  return total / count;
}

//Q5. Top 5 safest UNIQUE cars in 2025
function q5_top5SafestVehicles2025(data) {
  const grouped = {}; //key > collective stats for the unique car

  //normalizes text, reduces 'uniqueness' caused by case, spacing, or dashes
  function normText(x) {
    return String(x ?? "")
      .trim()
      .replace(/\s+/g, " ")
      .replace(/[–—]/g, "-")
      .toLowerCase();
  }

  //create grouped object
  for (let i = 0; i < data.length; i++) {
    const v = data[i];
    if (v.Year !== 2025) continue;

    //skips upcoming model
    const modelText = String(v.Model ?? "").toLowerCase();
    if (modelText.includes("upcoming")) continue;
    //key represents a unique car definition
    const key = normText(v.Manufacturer) + "||" + normText(v.Model);
    // initialize stats if first time seeing the key
    if (!grouped[key]) {
      grouped[key] = {
        Manufacturer: String(v.Manufacturer ?? "").trim(),
        Model: String(v.Model ?? "").trim(),

        totalRecords2025: 0, //counts all row for car in 2025

        //safety sums and counter
        safetyTotal: 0,
        safetyUsed: 0,
        avgSafety: 0,

        //warranty sums and counter
        warrantyTotal: 0,
        warrantyUsed: 0,
        avgWarranty: 0,
      };
    }

    //counts all records for this car in 2025
    grouped[key].totalRecords2025 += 1;

    //safety sum and counter, only adds if valid value
    const rating = Number(v.Safety_Rating);
    if (!Number.isNaN(rating)) {
      grouped[key].safetyTotal += rating;
      grouped[key].safetyUsed += 1;
    }

    //warranty sum and counter, only adds if valid value
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

    //calculates average based on record that has safety/warranty
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

      //swaps if b should rank above a
      if (swap) {
        const tmp = list[i];
        list[i] = list[j];
        list[j] = tmp;
      }
    }
  }

  //top5 after sort (result)
  const top = [];
  for (let i = 0; i < list.length && i < 5; i++) top.push(list[i]);
  return top;
}

// Q6. best-selling vehicle in 2024
function q6_bestSellingVehicle2024(data) {
  let best = null; //stores best vehicle
  let max = -1; //stores best sales value found

  for (let i = 0; i < data.length; i++) {
    const v = data[i];

    // convert to number so string numbers still work
    const sold = Number(v.Units_Sold_2024);

    //ignore invalid value and update best if sold is hiigher
    if (!Number.isNaN(sold) && sold > max) {
      max = sold;
      best = v;
    }
  }

  return best;
}
