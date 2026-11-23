/**
 * Characters inserted and removed between two versions of a text field.
 * Uses the common prefix and suffix, so a selection replaced by typing or a
 * paste counts correctly, without looking at which keys were pressed.
 */
export function textEditCounts(prev: string, next: string): { inserted: number; removed: number } {
  let start = 0
  const max = Math.min(prev.length, next.length)
  while (start < max && prev[start] === next[start]) start++
  let endPrev = prev.length
  let endNext = next.length
  while (endPrev > start && endNext > start && prev[endPrev - 1] === next[endNext - 1]) {
    endPrev--
    endNext--
  }
  return { inserted: endNext - start, removed: endPrev - start }
}
