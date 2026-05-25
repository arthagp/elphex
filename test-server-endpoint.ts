import http from "http";

function fetchEndpoint(url: string) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = "";
      res.on("data", (chunk) => {
        data += chunk;
      });
      res.on("end", () => {
        resolve({
          status: res.statusCode,
          headers: res.headers,
          data: data.slice(0, 500)
        });
      });
    }).on("error", (err) => {
      reject(err);
    });
  });
}

async function run() {
  try {
    console.log("Fetching http://localhost:3000/api/init...");
    const apiRes: any = await fetchEndpoint("http://localhost:3000/api/init");
    console.log("API Status:", apiRes.status);
    console.log("API Data:", apiRes.data);

    console.log("\nFetching http://localhost:3000/...");
    const rootRes: any = await fetchEndpoint("http://localhost:3000/");
    console.log("Root Status:", rootRes.status);
    console.log("Root Headers:", rootRes.headers);
  } catch (err) {
    console.error("Fetch failed:", err);
  }
}

run();
