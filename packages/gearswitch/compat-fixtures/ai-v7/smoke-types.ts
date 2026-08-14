// Compile-only check: catches broken/missing d.ts emission for the
// public type surface when gearswitch is installed next to this
// fixture's ai major. Never executed — `tsc --noEmit` only.
import type { ResilientOptions, ResilientStatus, Store } from 'gearswitch';

const store: Store = {
  async get(key) {
    void key;
    return null;
  },
  async set(key, value, ttlMs) {
    void key;
    void value;
    void ttlMs;
  },
};

function assertResilientOptionsShape(options: ResilientOptions): void {
  void options.models;
  void options.store;
  void options.threshold;
  void options.cooldown;
  void options.onFallback;
  void options.onError;
}

function assertResilientStatusShape(status: ResilientStatus): void {
  for (const model of status.models) {
    void model.key;
    void model.provider;
    void model.modelId;
    void model.available;
    void model.benchedUntil;
    void model.headerLimits;
    void model.selfCounted;
  }
}

void store;
void assertResilientOptionsShape;
void assertResilientStatusShape;
