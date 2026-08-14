import { LimitTracker } from './limit-tracker';
import { ResilientLanguageModel } from './resilient-model';
import { memoryStore } from './stores/memory';
import type {
  AnyLanguageModel,
  ResilientOptions,
  ResilientStatus,
  SpecificationVersion,
} from './types';

export { AllModelsExhaustedError, type ModelAttempt } from './errors';
export { classifyError, getRetryAfterMs } from './classify-error';
export { memoryStore } from './stores/memory';
export { LimitTracker } from './limit-tracker';
export { parseRateLimitHeaders, type ParsedRateLimit } from './header-parsers';
export type {
  AnyLanguageModel,
  ErrorClassification,
  FallbackInfo,
  FallbackReason,
  Limits,
  ModelConfig,
  ModelStatus,
  ResilientOptions,
  ResilientStatus,
  SpecificationVersion,
  Store,
} from './types';

const DEFAULT_THRESHOLD = 0.1;
const DEFAULT_COOLDOWN_MS = 60_000;

/**
 * Create a resilient language model that transparently falls back across
 * the configured models on rate-limit/transient errors and proactively
 * switches away from models near a known rate limit.
 *
 * The returned model mirrors the specification version of the models it
 * wraps — `LanguageModelV2` for ai v5 models, `LanguageModelV3` for
 * ai v6 models, `LanguageModelV4` for ai v7 models — so it works with
 * `generateText`, `streamText`, `generateObject`, and `streamObject` on
 * any of those SDK majors. Mixing spec versions in one chain throws.
 */
export function gearswitch<Version extends SpecificationVersion>(
  options: ResilientOptions<Version>,
): AnyLanguageModel<Version> {
  const tracker = new LimitTracker({
    store: options.store ?? memoryStore(),
    threshold: options.threshold ?? DEFAULT_THRESHOLD,
    cooldown: options.cooldown ?? DEFAULT_COOLDOWN_MS,
  });
  return new ResilientLanguageModel({
    models: options.models,
    tracker,
    ...(options.onFallback !== undefined
      ? { onFallback: options.onFallback }
      : {}),
    ...(options.onError !== undefined ? { onError: options.onError } : {}),
  }) as unknown as AnyLanguageModel<Version>;
}

/**
 * Alias of {@link gearswitch} for painless migration from `ai-resilient`.
 *
 * @deprecated Use {@link gearswitch} instead.
 */
export const createResilient = gearswitch;

/**
 * Same global-registry symbol `ResilientLanguageModel` brands instances
 * with; recomputed independently here (not imported) rather than
 * exported from resilient-model.ts, so the check works even when this
 * call came from a different bundle than the one that created the
 * model — `Symbol.for` guarantees identical values across bundles.
 */
const GEARSWITCH_BRAND: unique symbol = Symbol.for('gearswitch.model');

interface BrandedModel {
  [GEARSWITCH_BRAND]?: boolean;
  status?: () => Promise<ResilientStatus>;
}

/**
 * Read-only snapshot of a resilient model's per-model state: bench
 * timers, header-derived limits, self-counted usage. Never throws on
 * store failure; degrades to "available, no detail".
 */
export function gearswitchStatus(
  model: AnyLanguageModel,
): Promise<ResilientStatus> {
  if (model instanceof ResilientLanguageModel) {
    return model.status();
  }
  // Fall back to the cross-bundle brand: a model created by a different
  // bundle's gearswitch() has its own distinct ResilientLanguageModel
  // constructor, so `instanceof` above would wrongly reject it.
  const branded = model as unknown as BrandedModel;
  if (
    branded[GEARSWITCH_BRAND] === true &&
    typeof branded.status === 'function'
  ) {
    return branded.status();
  }
  throw new TypeError(
    'gearswitch: gearswitchStatus expects a model created by gearswitch()',
  );
}
