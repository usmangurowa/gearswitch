// Compat smoke test for gearswitch + ai@5 (LanguageModelV2 / provider v2).
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
// hand-rolled LanguageModelV2 structural mock (shape mirrors
// packages/gearswitch/test/resilient-generate.test.ts).
function mockV2Model() {
  return {
    specificationVersion: 'v2',
    provider: 'compat-mock',
    modelId: 'compat-model-v5',
    supportedUrls: {},
    async doGenerate() {
      return {
        content: [{ type: 'text', text: 'hello from ai-v5' }],
        finishReason: 'stop',
        usage: { inputTokens: 3, outputTokens: 7, totalTokens: 10 },
        warnings: [],
      };
    },
    async doStream() {
      throw new Error('doStream not exercised in this smoke test');
    },
  };
}

const model = gearswitch({ models: [{ model: mockV2Model() }] });
const { text } = await generateText({ model, prompt: 'hi', maxRetries: 0 });
assert.equal(text, 'hello from ai-v5', 'generateText did not return mock text');

const status = await gearswitchStatus(model);
assert.equal(
  status.models.length,
  1,
  'gearswitchStatus should report exactly one model',
);

console.log('ai-v5 compat smoke: OK');
