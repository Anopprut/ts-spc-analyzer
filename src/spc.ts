export interface Capability {
  n: number;
  mean: number;
  sd: number;
  cp: number | null;
  cpk: number | null;
}

export interface SpcResult extends Capability {
  outOfControl: number[];
  verdict: "capable" | "marginal" | "not capable" | "unknown";
}

export function mean(values: number[]): number {
  if (values.length === 0) throw new Error("values must not be empty");
  return values.reduce((a, b) => a + b, 0) / values.length;
}

/** Sample standard deviation (n - 1). */
export function stdev(values: number[]): number {
  if (values.length < 2) throw new Error("need at least 2 values");
  const m = mean(values);
  const ss = values.reduce((a, v) => a + (v - m) ** 2, 0);
  return Math.sqrt(ss / (values.length - 1));
}

export function capability(values: number[], lsl?: number, usl?: number): Capability {
  const m = mean(values);
  const sd = stdev(values);
  let cp: number | null = null;
  let cpk: number | null = null;

  if (sd > 0) {
    if (lsl !== undefined && usl !== undefined) cp = (usl - lsl) / (6 * sd);
    const upper = usl !== undefined ? (usl - m) / (3 * sd) : undefined;
    const lower = lsl !== undefined ? (m - lsl) / (3 * sd) : undefined;
    const sides = [upper, lower].filter((x): x is number => x !== undefined);
    if (sides.length > 0) cpk = Math.min(...sides);
  }
  return { n: values.length, mean: m, sd, cp, cpk };
}

/** Indices of points beyond mean +/- 3 sigma (Western Electric rule 1). */
export function outOfControl(values: number[], center: number, sd: number): number[] {
  return values.flatMap((v, i) => (Math.abs(v - center) > 3 * sd ? [i] : []));
}

export function verdictFor(cpk: number | null): SpcResult["verdict"] {
  if (cpk === null) return "unknown";
  if (cpk >= 1.33) return "capable";
  if (cpk >= 1.0) return "marginal";
  return "not capable";
}

export function analyze(values: number[], lsl?: number, usl?: number): SpcResult {
  const cap = capability(values, lsl, usl);
  return {
    ...cap,
    outOfControl: outOfControl(values, cap.mean, cap.sd),
    verdict: verdictFor(cap.cpk),
  };
}

export function parseValues(csv: string, column = "value"): number[] {
  const [header, ...rows] = csv.trim().split(/\r?\n/);
  const idx = header.split(",").map((h) => h.trim()).indexOf(column);
  if (idx === -1) throw new Error(`column "${column}" not found`);
  return rows
    .map((r) => Number(r.split(",")[idx]))
    .filter((v) => Number.isFinite(v));
}
