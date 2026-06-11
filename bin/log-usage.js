#!/usr/bin/env node
// lazy-cat usage logger — runs on Claude Code's Stop hook.
// Reads the session transcript, sums output tokens, and upserts one record per
// session in <config>/lazy-cat/usage.jsonl. All local; nothing is uploaded.
// Must never throw: a logging failure must not block Claude.
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

function main() {
  const input = JSON.parse(fs.readFileSync(0, "utf8"));
  const transcript = input.transcript_path;
  if (!transcript || !fs.existsSync(transcript)) return;

  let outputTokens = 0;
  let assistantMsgs = 0;
  const seen = new Set(); // streamed updates repeat message ids in the transcript
  for (const line of fs.readFileSync(transcript, "utf8").split("\n")) {
    if (!line.trim()) continue;
    let entry;
    try {
      entry = JSON.parse(line);
    } catch {
      continue;
    }
    const m = entry.message;
    if (entry.type !== "assistant" || !m || !m.usage) continue;
    if (m.id) {
      if (seen.has(m.id)) continue;
      seen.add(m.id);
    }
    outputTokens += m.usage.output_tokens || 0;
    assistantMsgs++;
  }

  const configDir =
    process.env.CLAUDE_CONFIG_DIR || path.join(os.homedir(), ".claude");
  const dir = path.join(configDir, "lazy-cat");
  fs.mkdirSync(dir, { recursive: true });
  const file = path.join(dir, "usage.jsonl");

  const rec = {
    session_id: input.session_id,
    ts: new Date().toISOString(),
    project: path.basename(input.cwd || ""),
    output_tokens: outputTokens,
    assistant_msgs: assistantMsgs,
  };

  // Upsert: drop any previous record for this session, append the fresh total.
  const rest = fs.existsSync(file)
    ? fs
        .readFileSync(file, "utf8")
        .split("\n")
        .filter((l) => l.trim() && !l.includes(`"${rec.session_id}"`))
    : [];
  rest.push(JSON.stringify(rec));
  fs.writeFileSync(file, rest.join("\n") + "\n");
}

try {
  main();
} catch {
  // never block the agent over telemetry
}
