import { parse } from "csv-parse/sync";
import { readFileSync, writeFileSync, existsSync } from "fs";
import { join } from "path";

// --- Types ---

type CsvStation = {
  id: number;
  city: string;
  zip: string;
  lat: number;
  lon: number;
};

type NceiCandidate = {
  stationId: string;
  name: string;
  lat: number;
  lon: number;
  distanceKm: number;
  tmaxStartDate: string | null;
  tmaxEndDate: string | null;
  tmaxCoverage: number | null;
  tminEndDate: string | null;
};

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
  stations: Record<number, ResolvedStation>;
};

// --- Config ---

const CSV_PATH = join(import.meta.dir, "../data/joule-home/monthly_dd.csv");
const OUTPUT_PATH = join(
  import.meta.dir,
  "../data/joule-home/station-ids.json"
);
const SEARCH_BASE_URL =
  "https://www.ncei.noaa.gov/access/services/search/v1/data";

// Wider bbox to catch remote stations. ~0.5 degrees ≈ 55km at mid latitudes.
// Search widens progressively if no match found at narrower bbox.
const BBOX_OFFSETS = [0.7, 1.0, 1.6];

const MIN_DELAY_MS = 2000;
const MAX_DELAY_MS = 5500;
const MAX_STATIONS = 100; // Change to 360 once verified

// Minimum TMAX end year to accept a station
const REQUIRED_TMAX_END_YEAR = 2023;

// --- Helpers ---

function haversineKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function randomDelay(): number {
  return MIN_DELAY_MS + Math.random() * (MAX_DELAY_MS - MIN_DELAY_MS);
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Station ID prefix priority: USW (weather service) > USC (COOP) > others */
function stationPrefixScore(stationId: string): number {
  if (stationId.startsWith("USW")) return 3;
  if (stationId.startsWith("USC")) return 2;
  if (stationId.startsWith("US1")) return 0; // volunteer, usually spotty
  return 1;
}

// --- CSV Parsing ---

function readStationsFromCsv(): CsvStation[] {
  const raw = readFileSync(CSV_PATH, "utf-8");
  const records: string[][] = parse(raw, {
    columns: false,
    skip_empty_lines: true,
  });

  // Skip header row
  const rows = records.slice(1);

  return rows.map((row) => ({
    id: parseInt(row[1], 10),
    city: row[0],
    zip: row[2],
    lat: parseFloat(row[3]),
    lon: parseFloat(row[4]),
  }));
}

// --- NCEI Search ---

async function searchNceiStations(
  lat: number,
  lon: number,
  bboxOffset: number
): Promise<NceiCandidate[]> {
  const north = lat + bboxOffset;
  const south = lat - bboxOffset;
  const east = lon + bboxOffset;
  const west = lon - bboxOffset;

  const url = new URL(SEARCH_BASE_URL);
  url.searchParams.set("dataset", "daily-summaries");
  url.searchParams.set("bbox", `${north},${west},${south},${east}`);
  url.searchParams.set("dataTypes", "TMAX,TMIN");
  url.searchParams.set("limit", "50");

  const response = await fetch(url.toString());

  if (!response.ok) {
    throw new Error(
      `NCEI API error: ${response.status} ${response.statusText}`
    );
  }

  const data = await response.json();
  const results: NceiCandidate[] = [];

  if (!data.results || !Array.isArray(data.results)) {
    return results;
  }

  for (const result of data.results) {
    if (!result.stations || !Array.isArray(result.stations)) continue;

    for (const station of result.stations) {
      const stationId: string = station.id;
      const name: string = station.name || "Unknown";

      // Get station location from the result's centroid
      const centroid = result.centroid?.point;
      if (!centroid) continue;

      const sLon = centroid[0];
      const sLat = centroid[1];
      const distanceKm = haversineKm(lat, lon, sLat, sLon);

      let tmaxStartDate: string | null = null;
      let tmaxEndDate: string | null = null;
      let tmaxCoverage: number | null = null;
      let tminEndDate: string | null = null;

      if (station.dataTypes && Array.isArray(station.dataTypes)) {
        const tmax = station.dataTypes.find(
          (dt: { id: string }) => dt.id === "TMAX"
        );
        if (tmax) {
          tmaxStartDate = tmax.startDate || null;
          tmaxEndDate = tmax.endDate || null;
          tmaxCoverage = tmax.coverage ?? null;
        }
        const tmin = station.dataTypes.find(
          (dt: { id: string }) => dt.id === "TMIN"
        );
        if (tmin) {
          tminEndDate = tmin.endDate || null;
        }
      }

      results.push({
        stationId,
        name,
        lat: sLat,
        lon: sLon,
        distanceKm: Math.round(distanceKm * 100) / 100,
        tmaxStartDate,
        tmaxEndDate,
        tmaxCoverage,
        tminEndDate,
      });
    }
  }

  return results;
}

/**
 * Pick the best station that has TMAX and TMIN data from 2023 to present.
 * Among qualifying stations, prefer USW > USC > others, then closest distance.
 * Returns null if no station meets the data requirements.
 */
function pickBestStation(candidates: NceiCandidate[]): NceiCandidate | null {
  if (candidates.length === 0) return null;

  // Deduplicate by stationId, keeping the entry with the shortest distance
  const seen = new Map<string, NceiCandidate>();
  for (const c of candidates) {
    const existing = seen.get(c.stationId);
    if (!existing || c.distanceKm < existing.distanceKm) {
      seen.set(c.stationId, c);
    }
  }
  const unique = Array.from(seen.values());

  // Hard filter: must have TMAX and TMIN data through at least REQUIRED_TMAX_END_YEAR
  const qualifying = unique.filter((c) => {
    if (!c.tmaxEndDate || !c.tminEndDate) return false;
    const tmaxEndYear = new Date(c.tmaxEndDate).getFullYear();
    const tminEndYear = new Date(c.tminEndDate).getFullYear();
    return (
      tmaxEndYear >= REQUIRED_TMAX_END_YEAR &&
      tminEndYear >= REQUIRED_TMAX_END_YEAR
    );
  });

  if (qualifying.length === 0) return null;

  // Sort by: prefix priority (desc), then distance (asc)
  qualifying.sort((a, b) => {
    const prefDiff =
      stationPrefixScore(b.stationId) - stationPrefixScore(a.stationId);
    if (prefDiff !== 0) return prefDiff;
    return a.distanceKm - b.distanceKm;
  });

  return qualifying[0];
}

// --- Load / Save ---

function loadExistingOutput(): OutputData {
  if (existsSync(OUTPUT_PATH)) {
    const raw = readFileSync(OUTPUT_PATH, "utf-8");
    return JSON.parse(raw) as OutputData;
  }
  return {
    lastUpdated: new Date().toISOString(),
    totalStations: 0,
    resolvedCount: 0,
    unresolvedCount: 0,
    stations: {},
  };
}

function saveOutput(output: OutputData): void {
  output.lastUpdated = new Date().toISOString();
  output.resolvedCount = Object.values(output.stations).filter(
    (s) => s.nceiStationId !== null
  ).length;
  output.unresolvedCount = Object.values(output.stations).filter(
    (s) => s.noMatchFound
  ).length;
  writeFileSync(OUTPUT_PATH, JSON.stringify(output, null, 2) + "\n", "utf-8");
}

// --- Main ---

async function main() {
  console.log("Reading stations from CSV...");
  const allStations = readStationsFromCsv();
  console.log(`Found ${allStations.length} stations in CSV.`);

  const output = loadExistingOutput();
  output.totalStations = allStations.length;

  // Determine which stations need resolving, prioritizing never-tried first.
  // 1. Stations not yet in output at all (never searched)
  // 2. Stations flagged as noMatchFound (retry with potentially wider bbox)
  // Skip stations that already have a valid nceiStationId.
  const neverTried = allStations.filter((s) => {
    const existing = output.stations[s.id];
    return !existing;
  });

  const previouslyFailed = allStations.filter((s) => {
    const existing = output.stations[s.id];
    return existing?.noMatchFound === true;
  });

  const toResolve = [...neverTried, ...previouslyFailed].slice(0, MAX_STATIONS);

  if (toResolve.length === 0) {
    const resolved = output.resolvedCount;
    const unresolved = output.unresolvedCount;
    console.log(
      `Nothing to do. ${resolved} resolved, ${unresolved} flagged as no match, ` +
        `${Object.keys(output.stations).length} total in output.`
    );
    return;
  }

  const alreadyResolved = Object.values(output.stations).filter(
    (s) => s.nceiStationId !== null
  ).length;
  const neverTriedCount = Math.min(neverTried.length, MAX_STATIONS);
  const retryCount = toResolve.length - neverTriedCount;
  console.log(
    `${alreadyResolved} stations already resolved. ` +
      `Attempting ${toResolve.length} more (${neverTriedCount} new, ${retryCount} retries)...`
  );

  for (let i = 0; i < toResolve.length; i++) {
    const station = toResolve[i];
    const progress = `[${alreadyResolved + i + 1}/${Math.min(allStations.length, alreadyResolved + toResolve.length)}]`;

    console.log(
      `${progress} Searching for: ${station.city} (id=${station.id}, ` +
        `lat=${station.lat}, lon=${station.lon})...`
    );

    let resolved: ResolvedStation;
    try {
      let best: NceiCandidate | null = null;
      let searchCount = 0;

      // Try progressively wider bounding boxes
      for (const offset of BBOX_OFFSETS) {
        const candidates = await searchNceiStations(
          station.lat,
          station.lon,
          offset
        );
        searchCount += candidates.length;
        best = pickBestStation(candidates);

        if (best) {
          console.log(
            `  -> Match: ${best.stationId} "${best.name}" ` +
              `(${best.distanceKm}km, bbox=${offset}deg, ` +
              `TMAX ${best.tmaxStartDate?.slice(0, 10) ?? "?"} to ${best.tmaxEndDate?.slice(0, 10) ?? "?"})`
          );
          break;
        }

        console.log(
          `  -> No qualifying station at bbox=${offset}deg (${candidates.length} candidates). Widening...`
        );

        // Delay between retries with wider bbox too
        if (offset !== BBOX_OFFSETS[BBOX_OFFSETS.length - 1]) {
          const retryDelay = randomDelay();
          console.log(
            `  Waiting ${(retryDelay / 1000).toFixed(1)}s before retry...`
          );
          await sleep(retryDelay);
        }
      }

      if (best) {
        resolved = {
          id: station.id,
          city: station.city,
          zip: station.zip,
          lat: station.lat,
          lon: station.lon,
          nceiStationId: best.stationId,
          nceiStationName: best.name,
          nceiLat: best.lat,
          nceiLon: best.lon,
          distanceKm: best.distanceKm,
          tmaxDateRange: `${best.tmaxStartDate?.slice(0, 10) ?? "?"} to ${best.tmaxEndDate?.slice(0, 10) ?? "?"}`,
          noMatchFound: false,
        };
      } else {
        console.log(
          `  -> NO MATCH after all bbox attempts (${searchCount} total candidates, none with TMAX/TMIN ${REQUIRED_TMAX_END_YEAR}+)`
        );
        resolved = {
          id: station.id,
          city: station.city,
          zip: station.zip,
          lat: station.lat,
          lon: station.lon,
          nceiStationId: null,
          nceiStationName: null,
          nceiLat: null,
          nceiLon: null,
          distanceKm: null,
          tmaxDateRange: null,
          noMatchFound: true,
        };
      }
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : String(err);
      console.error(`  -> ERROR: ${errMsg}`);
      // Don't flag as noMatchFound on error — leave it out so we retry next run
      resolved = {
        id: station.id,
        city: station.city,
        zip: station.zip,
        lat: station.lat,
        lon: station.lon,
        nceiStationId: null,
        nceiStationName: null,
        nceiLat: null,
        nceiLon: null,
        distanceKm: null,
        tmaxDateRange: null,
        noMatchFound: false,
      };
    }

    output.stations[station.id] = resolved;

    // Save after each station so we can resume
    saveOutput(output);

    // Delay before next station (skip after last one)
    if (i < toResolve.length - 1) {
      const delay = randomDelay();
      console.log(
        `  Waiting ${(delay / 1000).toFixed(1)}s before next request...`
      );
      await sleep(delay);
    }
  }

  console.log(
    `\nDone. ${output.resolvedCount} resolved, ${output.unresolvedCount} no match found, ` +
      `${Object.keys(output.stations).length} total. Output: ${OUTPUT_PATH}`
  );
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
