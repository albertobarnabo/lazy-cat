const { execFileSync } = require("node:child_process");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "lean-install-"));
const installer = path.join(__dirname, "..", "bin", "install.js");

execFileSync("node", [installer], {
  env: { ...process.env, CLAUDE_CONFIG_DIR: tmp },
  stdio: "inherit",
});

const expected = [
  "skills/think-twice/SKILL.md",
  "skills/surgical/SKILL.md",
  "commands/lean/think-twice.md",
  "commands/lean/surgical.md",
];

let failed = false;
for (const rel of expected) {
  if (fs.existsSync(path.join(tmp, rel))) {
    console.log("  ok        " + rel);
  } else {
    console.error("  MISSING   " + rel);
    failed = true;
  }
}

fs.rmSync(tmp, { recursive: true, force: true });

if (failed) {
  console.error("\nFAIL: installer did not produce the expected files");
  process.exit(1);
}
console.log("\nPASS: installer produced all expected files");
