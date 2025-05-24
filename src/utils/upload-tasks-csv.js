import fs from "node:fs";
import { parse } from "csv-parse";

const csvPath = new URL("../../tasks-upload.csv", import.meta.url);

async function processFile() {
  const records = [];
  const parser = fs.createReadStream(csvPath).pipe(parse({ columns: true }));

  for await (const record of parser) {
    const response = await fetch("http://localhost:3333/tasks", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(record),
    });

    const responseBody = await response.json();

    records.push(responseBody);
  }

  return records;
}

const createdTasks = await processFile();

console.log("Created tasks in database: \n", createdTasks);
