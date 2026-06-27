import React, { useEffect, useRef, useState } from 'react';

interface CountUpProps {
  /** Final numeric value to count to */
  end: number;
  /** Duration in ms */
  duration?: number;
  /** Prefix e.g. "$" */
  prefix?: string;
  /** Suffix e.g. "M+", "+", "%" */
  suffix?: string;
  /** Decimal places */
  decimals?: number;
  className?: string;
}

/**
 * Lightweight count-up animation that fires once when scrolled into view.
 * No dependencies — uses requestAnimationFrame + IntersectionObserver.
 * Respects prefers-reduced-motion (renders final value immediately).
 */
export function CountUp({ end, duration = 1600, prefix = '', suffix = '', decimals = 0, className = '' }: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const [value, setValue] = useState(0);
  const started = useRef(false);

  useEffect(() => {
    const prefersReduced = typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) { setValue(end); return; }

    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const start = performance.now();
          const tick = (now: number) => {
            const p = Math.min((now - start) / duration, 1);
            // easeOutExpo for a premium settle
            const eased = p === 1 ? 1 : 1 - Math.pow(2, -10 * p);
            setValue(end * eased);
            if (p < 1) requestAnimationFrame(tick);
            else setValue(end);
          };
          requestAnimationFrame(tick);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [end, duration]);

  const display = value.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  return <span ref={ref} className={className}>{prefix}{display}{suffix}</span>;
}
