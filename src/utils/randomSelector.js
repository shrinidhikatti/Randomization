/**
 * Performs a Fisher-Yates shuffle on a copy of the rows array
 * and returns the first `count` elements as "selected",
 * and the rest as "remaining".
 *
 * Uses crypto.getRandomValues for cryptographically fair randomness.
 */
export function runRandomSelection(rows, count) {
  if (count < 0 || count > rows.length) {
    throw new Error(`Cannot select ${count} from ${rows.length} rows.`)
  }

  // Clone indices array
  const indices = Array.from({ length: rows.length }, (_, i) => i)

  // Fisher-Yates shuffle using crypto random
  for (let i = indices.length - 1; i > 0; i--) {
    const j = cryptoRandInt(i + 1)
    ;[indices[i], indices[j]] = [indices[j], indices[i]]
  }

  const selectedIndices = indices.slice(0, count)
  const remainingIndices = indices.slice(count)

  // Sort both by original order for readability
  selectedIndices.sort((a, b) => a - b)
  remainingIndices.sort((a, b) => a - b)

  return {
    selected: selectedIndices.map((i) => rows[i]),
    remaining: remainingIndices.map((i) => rows[i]),
  }
}

/**
 * Returns a cryptographically random integer in [0, max).
 */
function cryptoRandInt(max) {
  const array = new Uint32Array(1)
  const limit = Math.floor(0x100000000 / max) * max
  let value
  do {
    crypto.getRandomValues(array)
    value = array[0]
  } while (value >= limit)
  return value % max
}
