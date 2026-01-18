import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { loadData } from "./loaddata.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3001;

const app = express();

app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.get("/data", loadData);

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
