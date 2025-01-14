import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const dirname = path.dirname(new URL(import.meta.url).pathname);
const filePath = path.join(dirname, "modules.json");
const data = JSON.parse(fs.readFileSync(filePath, "utf8"));

const newModule = {
  "name": process.env.MODULE_NAME,
  "category": process.env.MODULE_CATEGORY,
  "url": process.env.MODULE_URL,
  "id": process.env.MODULE_ID,
  "maintainer": process.env.MODULE_MAINTAINER,
  "maintainerURL": process.env.MODULE_MAINTAINER_URL,
  "description": process.env.MODULE_DESCRIPTION,
  "issues": []
};

data.modules.push(newModule);
data.lastUpdate = new Date().toISOString();

fs.writeFileSync(filePath, JSON.stringify(data, null, 2));

console.log(`Module ${newModule.name} added successfully!`);
