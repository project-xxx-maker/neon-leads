async function testOverpass() {
  // Query Overpass for real hairdresser / barbershops in Santos
  const query = `
    [out:json][timeout:15];
    area["name"="Santos"]["admin_level"~"8|7|6"]->.searchArea;
    (
      node["shop"~"hairdresser|barber|beauty"](area.searchArea);
      way["shop"~"hairdresser|barber|beauty"](area.searchArea);
    );
    out center 10;
  `;
  const url = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`;
  console.log("Fetching Overpass API...");
  const res = await fetch(url);
  const data = await res.json();
  console.log("Overpass elements found:", data.elements?.length);
  data.elements?.forEach(el => {
    const name = el.tags?.name;
    const lat = el.lat || el.center?.lat;
    const lon = el.lon || el.center?.lon;
    if (name) {
      console.log(`- ${name} -> https://www.google.com/maps/search/?api=1&query=${lat},${lon}`);
    }
  });
}
testOverpass().catch(console.error);