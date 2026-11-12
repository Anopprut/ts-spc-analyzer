import assert from "node:assert/strict";
import { test } from "node:test";
import { analyze, capability, mean, parseValues, stdev } from "../src/spc.ts";

test("mean and sample standard deviation", () => {
  assert.equal(mean([2, 4, 6]), 4);
  assert.equal(stdev([2, 4, 6]), 2);
});

test("Cp and Cpk for a centered process", () => {
  const values = [9, 10, 11]; // mean 10, sd 1
  const c = capability(values, 7, 13);
  assert.equal(c.cp, 1);
  assert.equal(c.cpk, 1);
});

test("Cpk uses the nearer spec limit when off-center", () => {
  const c = capability([9, 10, 11], 7, 12); // upper side is closer
  assert.ok(Math.abs((c.cpk as number) - 2 / 3) < 1e-9);
});

test("one-sided spec gives Cpk but no Cp", () => {
  const c = capability([9, 10, 11], undefined, 13);
  assert.equal(c.cp, null);
  assert.equal(c.cpk, 1);
});

test("flags points beyond 3 sigma", () => {
  const values = [...Array(30).fill(10), 10.001, 9.999, 14];
  const r = analyze(values, 9, 11);
  assert.ok(r.outOfControl.includes(32));
});

test("parseValues reads a named column and skips bad rows", () => {
  assert.deepEqual(parseValues("id,value\n1,2.5\n2,abc\n3,4"), [2.5, 4]);
});
