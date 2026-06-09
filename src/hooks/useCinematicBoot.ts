/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useRef, useState } from 'react';
import { removeBootShell } from '../lib/bootShell';

const MIN_BOOT_MS = 2200;
const EXIT_HOLD_MS = 420;

export function useCinematicBoot() {
  const [ready, setReady] = useState(false);
  const [progress, setProgress] = useState(0);
  const timeoutsRef = useRef<number[]>([]);

  useEffect(() => {
    removeBootShell();

    let mounted = true;
    let raf = 0;
    const start = performance.now();
    const timeouts = timeoutsRef.current;

    const schedule = (fn: () => void, ms: number) => {
      const id = window.setTimeout(fn, ms);
      timeouts.push(id);
      return id;
    };

    const tick = () => {
      if (!mounted) return;
      const elapsed = performance.now() - start;
      setProgress(Math.min(92, (elapsed / MIN_BOOT_MS) * 92));
      if (elapsed < MIN_BOOT_MS) {
        raf = requestAnimationFrame(tick);
      }
    };

    raf = requestAnimationFrame(tick);

    async function boot() {
      try {
        await Promise.all([
          document.fonts?.ready ?? Promise.resolve(),
          new Promise<void>((resolve) => {
            if (document.readyState === 'complete') resolve();
            else window.addEventListener('load', () => resolve(), { once: true });
          }),
        ]);
      } catch {
        /* non-fatal */
      }

      const elapsed = performance.now() - start;
      const remaining = Math.max(0, MIN_BOOT_MS - elapsed);

      await new Promise<void>((resolve) => {
        schedule(() => {
          if (mounted) resolve();
        }, remaining);
      });

      if (!mounted) return;
      setProgress(100);

      await new Promise<void>((resolve) => {
        schedule(() => {
          if (mounted) resolve();
        }, EXIT_HOLD_MS);
      });

      if (!mounted) return;
      setReady(true);
    }

    void boot();

    return () => {
      mounted = false;
      cancelAnimationFrame(raf);
      timeouts.forEach((id) => window.clearTimeout(id));
      timeouts.length = 0;
    };
  }, []);

  return { ready, progress };
}

