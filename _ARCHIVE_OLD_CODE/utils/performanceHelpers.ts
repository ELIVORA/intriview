/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Performance optimization and code-refactoring utilities for the Interview Cracker platform.
 * Provides advanced memory caching, low-latency throttling/debouncing, render batchers,
 * and browser capability optimizers.
 */

// 1. High-Performance Cache with LRU (Least Recently Used) Eviction
export class MemoryCache<K, V> {
  private cache: Map<K, V>;
  private maxEntries: number;

  constructor(maxEntries = 100) {
    this.cache = new Map<K, V>();
    this.maxEntries = maxEntries;
  }

  public get(key: K): V | undefined {
    if (!this.cache.has(key)) return undefined;
    
    // Refresh item position for LRU
    const val = this.cache.get(key)!;
    this.cache.delete(key);
    this.cache.set(key, val);
    return val;
  }

  public set(key: K, value: V): void {
    if (this.cache.has(key)) {
      this.cache.delete(key);
    } else if (this.cache.size >= this.maxEntries) {
      // Evict oldest entry (first item in the Map iterator)
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey !== undefined) {
        this.cache.delete(oldestKey);
      }
    }
    this.cache.set(key, value);
  }

  public clear(): void {
    this.cache.clear();
  }

  public size(): number {
    return this.cache.size;
  }
}

// 2. Specialized High-Efficiency Debounce with immediate option
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number,
  immediate = false
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  return function (this: any, ...args: Parameters<T>): void {
    const context = this;
    const callNow = immediate && !timeout;

    if (timeout) {
      clearTimeout(timeout);
    }

    timeout = setTimeout(() => {
      timeout = null;
      if (!immediate) {
        func.apply(context, args);
      }
    }, wait);

    if (callNow) {
      func.apply(context, args);
    }
  };
}

// 3. Optimized Throttle utility with trailing execution control
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle = false;
  let lastArgs: Parameters<T> | null = null;
  let lastContext: any = null;

  return function (this: any, ...args: Parameters<T>): void {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
        if (lastArgs) {
          func.apply(lastContext, lastArgs);
          lastArgs = null;
          lastContext = null;
        }
      }, limit);
    } else {
      lastArgs = args;
      lastContext = this;
    }
  };
}

// 4. Batch Frame Queue for handling high-frequency telemetry logs or stream data (e.g., transcripts)
export class PerformanceBatcher<T> {
  private queue: T[] = [];
  private onFlush: (items: T[]) => void;
  private limit: number;
  private intervalMs: number;
  private timer: ReturnType<typeof setInterval> | null = null;

  constructor(onFlush: (items: T[]) => void, limit = 50, intervalMs = 250) {
    this.onFlush = onFlush;
    this.limit = limit;
    this.intervalMs = intervalMs;
    this.start();
  }

  public push(item: T): void {
    this.queue.push(item);
    if (this.queue.length >= this.limit) {
      this.flush();
    }
  }

  public flush(): void {
    if (this.queue.length === 0) return;
    const itemsToFlush = [...this.queue];
    this.queue = [];
    this.onFlush(itemsToFlush);
  }

  public start(): void {
    if (this.timer) return;
    this.timer = setInterval(() => this.flush(), this.intervalMs);
  }

  public stop(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    this.flush();
  }
}

// 5. Native Micro-task Scheduler for yielding CPU during execution
export function runAsyncTask(task: () => void): void {
  if (typeof queueMicrotask === "function") {
    queueMicrotask(task);
  } else {
    Promise.resolve().then(task);
  }
}

// 6. Fast Hash Code Generator for string-based payload comparison and deep equality caching
export function fastHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
}
