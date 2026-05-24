/**
 * Web Worker entry point for the MLC LLM engine.
 *
 * This worker runs off the main thread so model loading and token
 * generation never block UI rendering. The main thread communicates
 * with it via `postMessage` through the `CreateWebWorkerMLCEngine` API.
 */
import { WebWorkerMLCEngineHandler } from "@mlc-ai/web-llm";

const handler = new WebWorkerMLCEngineHandler();

self.onmessage = (msg: MessageEvent) => {
  handler.onmessage(msg);
};
