function countVehiclesByManufacturer(data) {
  const result = {};

  for (let i = 0; i < data.length; i++) {
    const manufacturer = data[i].Manufacturer;

    if (result[manufacturer]) {
      result[manufacturer]++;
    } else {
      result[manufacturer] = 1;
    }
  }

  return result;
}

/* Example usage
const vehicleCount = countVehiclesByManufacturer(vehicles);
console.log("Total vehicles by manufacturer:");
console.log(vehicleCount); */
