#!/usr/bin/env node
// lazy-cat stats — opt-in, local-only token telemetry for Claude Code.
//
//   npx lazycat-skill stats             print the report
//   npx lazycat-skill stats --enable    install the Stop hook that logs sessions
//   npx lazycat-skill stats --disable   remove the hook (keeps the log)
//
// Data lives in <config>/lazy-cat/usage.jsonl. Nothing leaves your machine.
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

const pkgRoot = path.join(__dirname, "..");
const configDir =
  process.env.CLAUDE_CONFIG_DIR || path.join(os.homedir(), ".claude");
const dataDir = path.join(configDir, "lazy-cat");
const usageFile = path.join(dataDir, "usage.jsonl");
const settingsFile = path.join(configDir, "settings.json");
const HOOK_MARK = "lazy-cat/log-usage.js"; // identifies our hook entry

function loadSettings() {
  return fs.existsSync(settingsFile)
    ? JSON.parse(fs.readFileSync(settingsFile, "utf8"))
    : {};
}

function saveSettings(s) {
  fs.writeFileSync(settingsFile, JSON.stringify(s, null, 2) + "\n");
}

function enable() {
  fs.mkdirSync(dataDir, { recursive: true });
  const loggerDest = path.join(dataDir, "log-usage.js");
  fs.copyFileSync(path.join(pkgRoot, "bin", "log-usage.js"), loggerDest);

  const s = loadSettings();
  s.hooks = s.hooks || {};
  s.hooks.Stop = s.hooks.Stop || [];
  if (!JSON.stringify(s.hooks.Stop).includes(HOOK_MARK)) {
    s.hooks.Stop.push({
      hooks: [{ type: "command", command: `node "${loggerDest}"` }],
    });
  }
  saveSettings(s);
  console.log("lazy-cat stats enabled — sessions are now logged locally.");
  console.log(`  log:  ${usageFile}`);
  console.log(`  hook: Stop → ${loggerDest}`);
  console.log("Restart your Claude Code session for the hook to load.");
}

function disable() {
  const s = loadSettings();
  if (s.hooks && Array.isArray(s.hooks.Stop)) {
    s.hooks.Stop = s.hooks.Stop.filter(
      (entry) => !JSON.stringify(entry).includes(HOOK_MARK)
    );
    if (s.hooks.Stop.length === 0) delete s.hooks.Stop;
    saveSettings(s);
  }
  console.log("lazy-cat stats disabled. The usage log was kept:");
  console.log(`  ${usageFile}`);
}

function fmt(n) {
  return Math.round(n).toLocaleString("en-US");
}

function median(nums) {
  if (!nums.length) return 0;
  const s = [...nums].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
}

function report() {
  if (!fs.existsSync(usageFile)) {
    console.log("No usage data yet.");
    console.log("Enable logging with: npx lazycat-skill stats --enable");
    return;
  }
  const recs = fs
    .readFileSync(usageFile, "utf8")
    .split("\n")
    .filter(Boolean)
    .map((l) => JSON.parse(l));

  const tokens = recs.map((r) => r.output_tokens);
  const total = tokens.reduce((a, b) => a + b, 0);

  const WEEK = 7 * 24 * 3600 * 1000;
  const now = Date.now();
  const last7 = recs.filter((r) => now - Date.parse(r.ts) < WEEK);
  const prev7 = recs.filter((r) => {
    const age = now - Date.parse(r.ts);
    return age >= WEEK && age < 2 * WEEK;
  });
  const avg = (rs) =>
    rs.length ? rs.reduce((a, r) => a + r.output_tokens, 0) / rs.length : 0;

  console.log("\nlazy-cat stats — local data, nothing uploaded");
  console.log(`  source             ${usageFile}\n`);
  console.log(`  sessions tracked   ${recs.length}`);
  console.log(
    `  output tokens      ${fmt(total)} total · ${fmt(median(tokens))} median/session`
  );

  if (last7.length) {
    let trend = "";
    if (prev7.length) {
      const a7 = avg(last7);
      const p7 = avg(prev7);
      const delta = p7 ? ((a7 - p7) / p7) * 100 : 0;
      const sign = delta <= 0 ? "−" : "+";
      trend = `  (prev 7 days: ${fmt(p7)} → ${sign}${Math.abs(delta).toFixed(0)}%)`;
    }
    console.log(
      `  last 7 days        ${fmt(avg(last7))} avg/session over ${last7.length} session(s)${trend}`
    );
  }

  console.log("\n  (=^･ω･^=)  fewer tokens, same naps\n");
}

const args = process.argv.slice(2);
if (args.includes("--enable")) enable();
else if (args.includes("--disable")) disable();
else report();
