import { useEffect, useState } from 'react'

/** Animated number for the reveal. Shows the final value straight away with reduced motion. */
export function CountUp({ value, ms = 1200 }: { value: number; ms?: number }) {
  const reduce = typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches
  const [shown, setShown] = useState(reduce ? value : 0)
  useEffect(() => {
    if (reduce) return
    let raf = 0
    const t0 = performance.now()
    const step = (t: number) => {
      const k = Math.min(1, (t - t0) / ms)
      setShown(Math.round(value * (1 - Math.pow(1 - k, 3))))
      if (k < 1) raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [value, ms, reduce])
  return <span className="count">{shown.toLocaleString()}</span>
}
