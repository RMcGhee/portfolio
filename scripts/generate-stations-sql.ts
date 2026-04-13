import { readFileSync, writeFileSync } from "fs";
import { join } from "path";

// --- Types ---

type ResolvedStation = {
  id: number;
  city: string;
  zip: string;
  lat: number;
  lon: number;
  nceiStationId: string | null;
  nceiStationName: string | null;
  nceiLat: number | null;
  nceiLon: number | null;
  distanceKm: number | null;
  tmaxDateRange: string | null;
  noMatchFound: boolean;
};

type OutputData = {
  lastUpdated: string;
  totalStations: number;
  resolvedCount: number;
  unresolvedCount: number;
  stations: Record<string, ResolvedStation>;
};

// --- Config ---

const JSON_PATH = join(import.meta.dir, "../data/joule-home/station-ids.json");
const SQL_OUTPUT_PATH = join(
  import.meta.dir,
  "../../cloudflare-workers/joule-home/schemas/stations-data.sql"
);
const BATCH_SIZE = 100;

// --- Helpers ---

/** Escape single quotes for SQL string literals */
function esc(value: string): string {
  return value.replace(/'/g, "''");
}

function sqlValue(value: string | number | null): string {
  if (value === null || value === undefined) return "NULL";
  if (typeof value === "number") return String(value);
  return `'${esc(value)}'`;
}

// --- Main ---

function main() {
  console.log(`Reading station data from ${JSON_PATH}...`);
  const raw = readFileSync(JSON_PATH, "utf-8");
  const data: OutputData = JSON.parse(raw);

  const stationIds = Object.keys(data.stations)
    .map(Number)
    .sort((a, b) => a - b);

  const resolved = stationIds.filter(
    (id) => data.stations[id].nceiStationId !== null
  );
  const unresolved = stationIds.filter(
    (id) => data.stations[id].nceiStationId === null
  );

  console.log(
    `Found ${stationIds.length} stations: ${resolved.length} resolved, ${unresolved.length} unresolved.`
  );

  if (unresolved.length > 0) {
    console.log(
      `Warning: ${unresolved.length} stations have no NCEI station ID and will have NULL ncei columns:`
    );
    for (const id of unresolved) {
      const s = data.stations[id];
      console.log(`  id=${id}: ${s.city} (zip=${s.zip})`);
    }
  }

  const lines: string[] = [];

  lines.push("-- Auto-generated from station-ids.json");
  lines.push(`-- Generated: ${new Date().toISOString()}`);
  lines.push(
    `-- ${resolved.length} resolved, ${unresolved.length} unresolved`
  );
  lines.push("");
  lines.push("DELETE FROM stations;");
  lines.push("");

  // Batch inserts to stay within D1 statement size limits
  for (let i = 0; i < stationIds.length; i += BATCH_SIZE) {
    const batch = stationIds.slice(i, i + BATCH_SIZE);

    lines.push(
      "INSERT INTO stations (id, city, zip, lat, lon, ncei_station_id, ncei_station_name, ncei_lat, ncei_lon, distance_km) VALUES"
    );

    const valueRows: string[] = [];
    for (const id of batch) {
      const s = data.stations[id];
      valueRows.push(
        `  (${s.id}, ${sqlValue(s.city)}, ${sqlValue(s.zip)}, ${s.lat}, ${s.lon}, ` +
          `${sqlValue(s.nceiStationId)}, ${sqlValue(s.nceiStationName)}, ` +
          `${sqlValue(s.nceiLat)}, ${sqlValue(s.nceiLon)}, ${sqlValue(s.distanceKm)})`
      );
    }

    lines.push(valueRows.join(",\n") + ";");
    lines.push("");
  }

  const sql = lines.join("\n");
  writeFileSync(SQL_OUTPUT_PATH, sql, "utf-8");
  console.log(
    `\nWrote ${stationIds.length} rows in ${Math.ceil(stationIds.length / BATCH_SIZE)} batch(es) to:\n  ${SQL_OUTPUT_PATH}`
  );
}

main();