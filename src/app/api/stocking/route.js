import fs from "fs";
import path from "path";
import { NextResponse } from "next/server";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const riverId = searchParams.get("riverId");

  try {
    const filePath = path.join(process.cwd(), "src/config/stocking_history.csv");
    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: "Stocking database not found" }, { status: 404 });
    }

    const fileContent = fs.readFileSync(filePath, "utf8");
    const lines = fileContent.split("\n");
    const headers = lines[0].split(",");

    const records = [];
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const values = line.split(",");
      if (values.length < headers.length) continue;

      const record = {
        riverId: values[0],
        locationName: values[1],
        latitude: parseFloat(values[2]),
        longitude: parseFloat(values[3]),
        species: values[4],
        quantity: parseInt(values[5], 10),
        lifeStage: values[6],
        year: parseInt(values[7], 10),
        hatchery: values[8]
      };

      if (!riverId || record.riverId === riverId) {
        records.push(record);
      }
    }

    return NextResponse.json(records);
  } catch (error) {
    console.error("Error reading fish stocking data:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
