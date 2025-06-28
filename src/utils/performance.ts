// יוטיליטי לניטור וביצועים
export class PerformanceMonitor {
  private static timers = new Map<string, number>();
  
  static startTimer(name: string): void {
    this.timers.set(name, performance.now());
  }
  
  static endTimer(name: string): number {
    const startTime = this.timers.get(name);
    if (!startTime) {
      console.warn(`Timer "${name}" was not started`);
      return 0;
    }
    
    const duration = performance.now() - startTime;
    this.timers.delete(name);
    
    console.log(`⚡ ${name}: ${duration.toFixed(2)}ms`);
    return duration;
  }
  
  static measureAsync<T>(name: string, promise: Promise<T>): Promise<T> {
    this.startTimer(name);
    return promise.finally(() => this.endTimer(name));
  }
}

// מטמון זמני עבור בקשות API
export class APICache {
  private static cache = new Map<string, {
    data: any;
    timestamp: number;
    ttl: number;
  }>();
  
  static set(key: string, data: any, ttlMs: number = 5 * 60 * 1000): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttlMs
    });
    
    // ניקוי אוטומטי
    setTimeout(() => this.delete(key), ttlMs);
  }
  
  static get(key: string): any | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.data;
  }
  
  static delete(key: string): void {
    this.cache.delete(key);
  }
  
  static clear(): void {
    this.cache.clear();
  }
  
  static getStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }
}

// דחיסת נתונים לביצועים טובים יותר
export function compressData(data: any): string {
  try {
    return JSON.stringify(data);
  } catch (error) {
    console.error('Failed to compress data:', error);
    return '';
  }
}

export function decompressData<T>(compressed: string): T | null {
  try {
    return JSON.parse(compressed);
  } catch (error) {
    console.error('Failed to decompress data:', error);
    return null;
  }
}

// אופטימיזציה לבקשות מקבילות
export async function batchRequests<T>(
  requests: Array<() => Promise<T>>,
  batchSize: number = 3
): Promise<(T | Error)[]> {
  const results: (T | Error)[] = [];
  
  for (let i = 0; i < requests.length; i += batchSize) {
    const batch = requests.slice(i, i + batchSize);
    const batchResults = await Promise.allSettled(
      batch.map(request => request())
    );
    
    batchResults.forEach(result => {
      if (result.status === 'fulfilled') {
        results.push(result.value);
      } else {
        results.push(result.reason);
      }
    });
  }
  
  return results;
}

// Debounce להקטנת בקשות מיותרות
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// ניטור שימוש בזיכרון
export function getMemoryUsage(): {
  used: number;
  total: number;
  percentage: number;
} | null {
  if (typeof window === 'undefined' || !('memory' in performance)) {
    return null;
  }
  
  const memory = (performance as any).memory;
  return {
    used: Math.round(memory.usedJSHeapSize / 1024 / 1024),
    total: Math.round(memory.totalJSHeapSize / 1024 / 1024),
    percentage: Math.round((memory.usedJSHeapSize / memory.totalJSHeapSize) * 100)
  };
} 