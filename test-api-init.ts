import { GET } from "./src/app/api/init/route";

async function run() {
  try {
    console.log("Calling GET /api/init...");
    const res = await GET();
    const status = res.status;
    const body = await res.json();
    console.log("Status:", status);
    console.log("Body keys:", Object.keys(body));
    if (body.error) {
      console.error("Error body:", body);
    }
  } catch (err) {
    console.error("Caught error:", err);
  }
}

run();
