// Compat smoke test for gearswitch + ai@6 (LanguageModelV3 / provider v3).
// Installed with npm into a temp dir OUTSIDE the repo (see run.sh) so this
// exercises the packed tarball's real package.json exports, not the
// workspace source.
import assert from 'node:assert/strict';
import { generateText } from 'ai';
import { gearswitch, gearswitchStatus, memoryStore } from 'gearswitch';
import { redisStore } from 'gearswitch/redis';
import { upstashStore } from 'gearswitch/upstash';

// 1. Root import resolves the expected public API.
assert.equal(typeof gearswitch, 'function', 'gearswitch export missing');
assert.equal(
  typeof gearswitchStatus,
  'function',
  'gearswitchStatus export missing',
);
assert.equal(typeof memoryStore, 'function', 'memoryStore export missing');

// 2. Subpath exports resolve at runtime and return a well-shaped Store.
const fakeClient = { get: async () => null, set: async () => {} };
const redis = redisStore(fakeClient);
assert.equal(typeof redis.get, 'function', 'redisStore().get missing');
assert.equal(typeof redis.set, 'function', 'redisStore().set missing');
const upstash = upstashStore(fakeClient);
assert.equal(typeof upstash.get, 'function', 'upstashStore().get missing');
assert.equal(typeof upstash.set, 'function', 'upstashStore().set missing');

// 3. A real generateText call from the installed ai major against a
// hand-rolled LanguageModelV3 structural mock (shape mirrors
// packages/gearswitch/test/resilient-v3.test.ts).
function mockV3Model() {
  return {
    specificationVersion: 'v3',
    provider: 'compat-mock',
    modelId: 'compat-model-v6',
    supportedUrls: {},
    async doGenerate() {
      return {
        content: [{ type: 'text', text: 'hello from ai-v6' }],
        finishReason: { type: 'stop' },
        usage: {
          inputTokens: { total: 3, noCache: 3 },
          outputTokens: { total: 7, text: 7 },
        },
        warnings: [],
      };
    },
    async doStream() {
      throw new Error('doStream not exercised in this smoke test');
    },
  };
}

const model = gearswitch({ models: [{ model: mockV3Model() }] });
const { text } = await generateText({ model, prompt: 'hi', maxRetries: 0 });
assert.equal(text, 'hello from ai-v6', 'generateText did not return mock text');

const status = await gearswitchStatus(model);
assert.equal(
  status.models.length,
  1,
  'gearswitchStatus should report exactly one model',
);

console.log('ai-v6 compat smoke: OK');
