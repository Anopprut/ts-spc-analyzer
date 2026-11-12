import { readFileSync } from "node:fs";
import { analyze, parseValues } from "./spc.ts";

const args = process.argv.slice(2);
const file = args.find((a) => !a.startsWith("--"));
const opt = (name: string): number | undefined => {
  const i = args.indexOf(`--${name}`);
  return i === -1 ? undefined : Number(args[i + 1]);
};

if (!file) {
  console.error("usage: node src/cli.ts <file.csv> [--lsl N] [--usl N]");
  process.exit(1);
}

const result = analyze(parseValues(readFileSync(file, "utf8")), opt("lsl"), opt("usl"));
console.log(JSON.stringify(result, null, 2));
