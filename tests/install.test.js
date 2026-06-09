const { execFileSync } = require("node:child_process");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

const installer = path.join(__dirname, "..", "bin", "install.js");
const tmps = [];

function tmpdir() {
  const d = fs.mkdtempSync(path.join(os.tmpdir(), "lazy-cat-install-"));
  tmps.push(d);
  return d;
}

function run(args, opts) {
  execFileSync("node", [installer, ...args], { stdio: "inherit", ...opts });
}

let failed = false;
function check(label, ok) {
  console.log(`  ${ok ? "ok     " : "MISSING"} ${label}`);
  if (!ok) failed = true;
}

function has(file) {
  return fs.existsSync(file);
}
function contains(file, str) {
  return fs.existsSync(file) && fs.readFileSync(file, "utf8").includes(str);
}

// --- project scope: writes into cwd ---
console.log("project scope:");
const proj = tmpdir();
run(["--project"], { cwd: proj });
check("Claude  .claude/skills/think-twice/SKILL.md", has(path.join(proj, ".claude/skills/think-twice/SKILL.md")));
check("Claude  .claude/skills/surgical/SKILL.md", has(path.join(proj, ".claude/skills/surgical/SKILL.md")));
check("Gemini  GEMINI.md has rule block", contains(path.join(proj, "GEMINI.md"), "lean:start"));
check("Codex   AGENTS.md has rule block", contains(path.join(proj, "AGENTS.md"), "lean:start"));

// --- idempotency: second run must not duplicate the block ---
console.log("idempotency:");
run(["--project"], { cwd: proj });
const blocks = (fs.readFileSync(path.join(proj, "GEMINI.md"), "utf8").match(/lean:start/g) || []).length;
check("GEMINI.md has exactly one rule block after re-run", blocks === 1);

// --- global scope: writes under HOME (CLAUDE_CONFIG_DIR cleared) ---
console.log("global scope:");
const home = tmpdir();
run([], { env: { ...process.env, HOME: home, CLAUDE_CONFIG_DIR: "" } });
check("Claude  ~/.claude/skills/think-twice/SKILL.md", has(path.join(home, ".claude/skills/think-twice/SKILL.md")));
check("Gemini  ~/.gemini/GEMINI.md has rule block", contains(path.join(home, ".gemini/GEMINI.md"), "lean:start"));
check("Codex   ~/.codex/AGENTS.md has rule block", contains(path.join(home, ".codex/AGENTS.md"), "lean:start"));

for (const d of tmps) fs.rmSync(d, { recursive: true, force: true });

if (failed) {
  console.error("\nFAIL: installer did not produce the expected files");
  process.exit(1);
}
console.log("\nPASS: all targets installed for both scopes");
