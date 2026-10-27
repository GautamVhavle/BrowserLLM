import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { isAppShellCache, isModelIdCached, urlBelongsToModel } from "../src/lib/cachePolicy.ts";
import { completionBudget, planContext, systemContent, takeSummaryChunk, trimHistory } from "../src/lib/promptHistory.ts";
import type { Message } from "../src/types/index.ts";

const user = (content: string): Message => ({ role: "user", content });
const assistant = (content: string, error = false): Message => ({
  role: "assistant",
  content,
  ...(error ? { error: true } : {}),
});

test("service worker only evicts its own app-shell caches", () => {
  const src = readFileSync(new URL("../public/sw.js", import.meta.url), "utf8");
  assert.match(src, /k\.startsWith\("browserai-"\)/);
  assert.doesNotMatch(src, /k !== CACHE_NAME\)\.map/);
  assert.equal(isAppShellCache("browserai-v1"), true);
  assert.equal(isAppShellCache("webllm/model"), false);
  assert.equal(isAppShellCache("webllm/wasm"), false);
});

test("model cache identity is exact", () => {
  const cached = ["Qwen2.5-0.5B-Instruct-q4f16_1-MLC"];
  assert.equal(isModelIdCached(cached, "Qwen2.5-0.5B-Instruct-q4f16_1-MLC"), true);
  assert.equal(isModelIdCached(cached, "Qwen2.5-0.5B-Instruct-q4f32_1-MLC"), false);
  const url =
    "https://huggingface.co/mlc-ai/Qwen2.5-0.5B-Instruct-q4f16_1-MLC/resolve/main/params_shard_0.bin";
  assert.equal(urlBelongsToModel(url, "Qwen2.5-0.5B-Instruct-q4f16_1-MLC"), true);
  assert.equal(urlBelongsToModel(url, "Qwen2.5-0.5B-Instruct-q4f32_1-MLC"), false);
  assert.equal(urlBelongsToModel(url, "0.5B"), false);
});

test("trim drops error turns and oldest messages first", () => {
  const messages = [
    user("a".repeat(2000)),
    assistant("Error: context full", true),
    user("latest question"),
    assistant("latest answer"),
  ];
  const trimmed = trimHistory(messages, 512, 128);
  assert.deepEqual(
    trimmed.map((m) => m.content),
    ["latest question", "latest answer"],
  );
});

test("trim keeps a leading user turn", () => {
  const trimmed = trimHistory(
    [assistant("orphan"), user("question"), assistant("answer")],
    8000,
    128,
  );
  assert.equal(trimmed[0]?.role, "user");
});

test("small context windows still reserve some completion tokens", () => {
  assert.equal(completionBudget(1024), 256);
  assert.equal(completionBudget(32768), 1024);
});

test("a fitting thread keeps a leading assistant", () => {
  const messages = [assistant("setup"), user("question"), assistant("answer")];
  const plan = planContext(messages, 0, 4096, 200);
  assert.equal(plan.needsFold, false);
  assert.deepEqual(plan.recent.map((m) => m.content), ["setup", "question", "answer"]);
});

test("short threads are not folded", () => {
  const messages = [user("hello"), assistant("hi")];
  const plan = planContext(messages, 0, 4096, 300);
  assert.equal(plan.needsFold, false);
  assert.equal(plan.foldCount, 0);
  assert.equal(plan.recent.length, 2);
  assert.equal(systemContent(null).includes("Earlier conversation"), false);
});

test("overflow folds the oldest turns and keeps the suffix", () => {
  const messages = [
    user("a".repeat(2000)),
    assistant("b".repeat(2000)),
    user("latest question"),
    assistant("latest answer"),
  ];
  const plan = planContext(messages, 0, 800, 200);
  assert.equal(plan.needsFold, true);
  assert.ok(plan.foldCount >= 2);
  assert.equal(plan.recent.at(-1)?.content, "latest answer");
  assert.equal(plan.recent[0]?.role, "user");
});

test("an existing memory is not unfolded", () => {
  const messages = [user("old"), assistant("old reply"), user("new")];
  const plan = planContext(messages, 2, 8000, 200);
  assert.equal(plan.needsFold, false);
  assert.equal(plan.foldCount, 2);
  assert.deepEqual(plan.recent.map((m) => m.content), ["new"]);
});

test("summary chunks make progress through a long prefix", () => {
  const messages = [user("a".repeat(800)), assistant("b".repeat(800)), user("c".repeat(800))];
  const first = takeSummaryChunk(messages, 0, 3, 100);
  assert.ok(first.next > 0);
  assert.ok(first.next < 3);
  const second = takeSummaryChunk(messages, first.next, 3, 100);
  assert.ok(second.next > first.next);
});
