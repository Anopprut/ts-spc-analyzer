# ts-spc-analyzer

Zero-dependency TypeScript tool for process-capability checks on production measurements: Cp, Cpk, a 3-sigma out-of-control check, and a small HTTP API. Runs on Node 22.18+ (native TypeScript type stripping, no build step). Uses synthetic data.

## Run
```bash
npm test                      # 6 tests (node:test)
npm run analyze               # CLI on data/measurements.csv with LSL 9.5 / USL 10.5
npm run serve                 # POST http://localhost:3000/analyze
```
```bash
curl -X POST localhost:3000/analyze -H "content-type: application/json" \
  -d '{"values":[9.9,10.1,10.0,10.2,9.8],"lsl":9.5,"usl":10.5}'
```

## Example (CLI)
`n=60, mean=10.039, sd=0.139, Cp=1.20, Cpk=1.11, out-of-control: [40], verdict: marginal`

## Notes
- Cpk = min((USL - mean) / 3s, (mean - LSL) / 3s) using the sample standard deviation (overall, not within-subgroup).
- Verdict thresholds: Cpk >= 1.33 capable, >= 1.0 marginal, otherwise not capable.
- One-sided specs return Cpk and no Cp.
- Not covered: subgroup control charts (Xbar-R), non-normal data, Ppk.
