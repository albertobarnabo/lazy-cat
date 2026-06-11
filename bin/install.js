#!/usr/bin/env node
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

if (process.argv[2] === "stats") {
  process.argv.splice(2, 1); // hand remaining flags (--enable/--disable) to stats
  require("./stats.js");
  return;
}

const pkgRoot = path.join(__dirname, "..");
const project = process.argv.includes("--project");
const base = project ? process.cwd() : os.homedir();

const START = "<!-- lazy-cat:start -->";
const END = "<!-- lazy-cat:end -->";
// Pre-rename marker pair, removed on upgrade so old installs don't keep a stale block
const LEGACY_RE = /\n?<!-- lean:start -->[\s\S]*?<!-- lean:end -->\n?/;

function copyDirInto(srcDir, destDir) {
  for (const name of fs.readdirSync(srcDir)) {
    fs.cpSync(path.join(srcDir, name), path.join(destDir, name), {
      recursive: true,
    });
  }
}

// Write the portable rule block into an instructions file, idempotently:
// replace an existing block between markers, or append a new one.
function writeRules(file, block) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  let existing = fs.existsSync(file) ? fs.readFileSync(file, "utf8") : "";
  existing = existing.replace(LEGACY_RE, "\n");
  const re = new RegExp(`${START}[\\s\\S]*?${END}`);
  const next = re.test(existing)
    ? existing.replace(re, block)
    : existing
    ? `${existing.trimEnd()}\n\n${block}\n`
    : `${block}\n`;
  fs.writeFileSync(file, next);
}

// --- Claude Code: install skills (invoked as /think-twice, /surgical) ---
const claudeDir = project
  ? path.join(base, ".claude")
  : process.env.CLAUDE_CONFIG_DIR || path.join(base, ".claude");
copyDirInto(path.join(pkgRoot, "skills"), path.join(claudeDir, "skills"));

// --- Gemini + Codex: write the rule block into their instruction files ---
const rules = fs.readFileSync(path.join(pkgRoot, "rules", "lazy-cat.md"), "utf8").trim();
const block = `${START}\n${rules}\n${END}`;
const geminiFile = project
  ? path.join(base, "GEMINI.md")
  : path.join(base, ".gemini", "GEMINI.md");
const codexFile = project
  ? path.join(base, "AGENTS.md")
  : path.join(base, ".codex", "AGENTS.md");
writeRules(geminiFile, block);
writeRules(codexFile, block);

console.log(`lazy-cat installed (${project ? "project" : "global"})`);
console.log(`  Claude: ${path.join(claudeDir, "skills")}  (/think-twice, /surgical)`);
console.log(`  Gemini: ${geminiFile}`);
console.log(`  Codex:  ${codexFile}`);
console.log("Restart your agent session so the rules/skills load.");
