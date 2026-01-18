// loaddata.js
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function loadData(req, res) {
  const datasetPath = path.join(__dirname, "electric_vehicles_dataset.json");

  fs.readFile(datasetPath, "utf8", (err, content) => {
    if (err) {
      res.status(500).json({
        error: "Failed to read electric_vehicles_dataset.json",
        details: err.message,
      });
      return;
    }

    try {
      // Validate JSON so /data always returns correct JSON
      const parsed = JSON.parse(content);
      res.status(200).json(parsed);
    } catch (parseErr) {
      res.status(500).json({
        error: "Dataset file is not valid JSON",
        details: parseErr.message,
      });
    }
  });
}
