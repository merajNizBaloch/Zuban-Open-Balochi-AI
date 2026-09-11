const base = process.env.ZUBAN_MODEL_SERVER_URL?.replace(/\/$/, "");

if (!base) {
  console.error("Set ZUBAN_MODEL_SERVER_URL before running this check.");
  process.exit(1);
}

const endpoints = [
  ["health", base + "/health"],
];

for (const [name, url] of endpoints) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8000);

  try {
    const response = await fetch(url, { signal: controller.signal });
    const body = await response.text();

    if (!response.ok) {
      console.error(`✗ ${name}: HTTP ${response.status}`);
      console.error(body.slice(0, 500));
      process.exitCode = 1;
    } else {
      console.log(`✓ ${name}: ${body.slice(0, 500)}`);
    }
  } catch (error) {
    console.error(`✗ ${name}: ${error instanceof Error ? error.message : "request failed"}`);
    process.exitCode = 1;
  } finally {
    clearTimeout(timer);
  }
}
