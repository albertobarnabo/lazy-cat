const { execFileSync } = require("node:child_process");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

const installer = path.join(__dirname, "..", "bin", "install.js");
const config = fs.mkdtempSync(path.join(os.tmpdir(), "lazy-cat-stats-"));
const env = { ...process.env, CLAUDE_CONFIG_DIR: config };

function run(args, opts = {}) {
  return execFileSync("node", [installer, ...args], {
    env,
    encoding: "utf8",
    ...opts,
  });
}

let failed = false;
function check(label, ok) {
  console.log(`  ${ok ? "ok     " : "FAIL   "} ${label}`);
  if (!ok) failed = true;
}

// --- enable: hook installed, logger copied, idempotent ---
console.log("stats --enable:");
run(["stats", "--enable"]);
run(["stats", "--enable"]);
const settings = JSON.parse(
  fs.readFileSync(path.join(config, "settings.json"), "utf8")
);
const stopHooks = JSON.stringify(settings.hooks.Stop);
check("logger copied", fs.existsSync(path.join(config, "lazy-cat/log-usage.js")));
check("Stop hook registered", stopHooks.includes("lazy-cat/log-usage.js"));
check(
  "exactly one hook entry after double enable",
  (stopHooks.match(/log-usage\.js/g) || []).length === 1
);

// --- logger: sums output tokens from a transcript, dedupes ids, upserts ---
console.log("logger:");
const transcript = path.join(config, "transcript.jsonl");
fs.writeFileSync(
  transcript,
  [
    JSON.stringify({ type: "user", message: { content: "hi" } }),
    JSON.stringify({
      type: "assistant",
      message: { id: "m1", usage: { output_tokens: 100 } },
    }),
    JSON.stringify({
      type: "assistant",
      message: { id: "m1", usage: { output_tokens: 100 } }, // streamed duplicate
    }),
    JSON.stringify({
      type: "assistant",
      message: { id: "m2", usage: { output_tokens: 50 } },
    }),
  ].join("\n")
);
const hookInput = JSON.stringify({
  session_id: "test-session",
  transcript_path: transcript,
  cwd: "/tmp/myproj",
});
const logger = path.join(config, "lazy-cat/log-usage.js");
execFileSync("node", [logger], { env, input: hookInput });
execFileSync("node", [logger], { env, input: hookInput }); // re-run = upsert

const usage = fs
  .readFileSync(path.join(config, "lazy-cat/usage.jsonl"), "utf8")
  .split("\n")
  .filter(Boolean)
  .map(JSON.parse);
check("one record after two hook runs (upsert)", usage.length === 1);
check("output tokens summed with id dedupe (150)", usage[0].output_tokens === 150);
check("project recorded", usage[0].project === "myproj");

// --- report ---
console.log("report:");
const out = run(["stats"]);
check("report shows session count", out.includes("sessions tracked   1"));
check("report shows total tokens", out.includes("150 total"));

// --- disable ---
console.log("stats --disable:");
run(["stats", "--disable"]);
const after = JSON.parse(
  fs.readFileSync(path.join(config, "settings.json"), "utf8")
);
check(
  "hook removed",
  !JSON.stringify(after.hooks || {}).includes("log-usage.js")
);
check("usage log kept", fs.existsSync(path.join(config, "lazy-cat/usage.jsonl")));

fs.rmSync(config, { recursive: true, force: true });

if (failed) {
  console.error("\nFAIL: stats did not behave as expected");
  process.exit(1);
}
console.log("\nPASS: stats enable/log/report/disable all work");
