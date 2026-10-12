// Fetches upcoming public Luma events for Singapore and writes events.json.
// Run by .github/workflows/deploy.yml every 3 hours. Usage: node scripts/fetch-events.mjs [outfile]
import { writeFileSync } from "node:fs";

// The same feed luma.com/discover/singapore loads in the browser (undocumented, may change)
const PLACE = "discplace-mUbtdfNjfWaLQ72";
const API = "https://api.lu.ma/discover/get-paginated-events";
const out = process.argv[2] || "events.json";

const events = new Map();
let cursor = "";
for (let page = 0; page < 10; page++) {
  const url = `${API}?discover_place_api_id=${PLACE}&pagination_limit=100${cursor ? "&pagination_cursor=" + encodeURIComponent(cursor) : ""}`;
  const res = await fetch(url, { headers: { "User-Agent": "luma-mrt (github.com/tantatseng88/luma-mrt)" } });
  if (!res.ok) throw new Error(`Luma returned ${res.status}`);
  const data = await res.json();
  for (const { event: e } of data.entries || []) {
    if (!e?.api_id || !e.start_at) continue;
    const g = e.geo_address_info || {};
    events.set(e.api_id, {
      i: e.api_id,
      t: e.name,
      s: e.start_at,
      e: e.end_at,
      u: "https://luma.com/" + e.url,
      l: g.full_address || "",
      p: g.address || "",
      ll: e.coordinate ? [+(+e.coordinate.latitude).toFixed(5), +(+e.coordinate.longitude).toFixed(5)] : null,
    });
  }
  if (!data.has_more || !data.next_cursor) break;
  cursor = data.next_cursor;
}

// Drop events that have already ended
const now = Date.now();
const list = [...events.values()]
  .filter((e) => new Date(e.e || e.s).getTime() > now)
  .sort((a, b) => a.s.localeCompare(b.s));
// Fail the run (keeping the last deployed list) rather than publish an empty one
if (!list.length) throw new Error("No events returned");

writeFileSync(out, JSON.stringify({ source: "https://luma.com/discover/singapore", fetched: new Date().toISOString(), events: list }));
console.log(`Wrote ${list.length} events to ${out}`);
