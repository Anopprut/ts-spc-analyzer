import { createServer } from "node:http";
import { analyze } from "./spc.ts";

interface Body {
  values: number[];
  lsl?: number;
  usl?: number;
}

const send = (res: import("node:http").ServerResponse, code: number, body: unknown) => {
  res.writeHead(code, { "content-type": "application/json" });
  res.end(JSON.stringify(body));
};

export const server = createServer((req, res) => {
  if (req.method === "GET" && req.url === "/health") {
    return send(res, 200, { status: "ok" });
  }
  if (req.method !== "POST" || req.url !== "/analyze") {
    return send(res, 404, { error: "POST /analyze only" });
  }
  let raw = "";
  req.on("data", (c) => {
    raw += c;
    if (raw.length > 1_000_000) req.destroy();
  });
  req.on("end", () => {
    try {
      const { values, lsl, usl } = JSON.parse(raw) as Body;
      if (!Array.isArray(values) || !values.every(Number.isFinite)) {
        return send(res, 400, { error: "values must be an array of numbers" });
      }
      send(res, 200, analyze(values, lsl, usl));
    } catch (e) {
      send(res, 400, { error: (e as Error).message });
    }
  });
});

if (import.meta.main) {
  const port = Number(process.env.PORT ?? 3000);
  server.listen(port, () => console.log(`SPC API on http://localhost:${port}/analyze`));
}
