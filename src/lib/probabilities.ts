export interface StateProbability {
  /** Measured bitstring (Qiskit order: qubit 0 is the rightmost bit) */
  state: string;
  count: number;
  probability: number;
}

/**
 * Convert raw measurement counts into probabilities sorted by bitstring.
 */
export function countsToProbabilities(counts: Record<string, number>): StateProbability[] {
  const total = Object.values(counts).reduce((sum, count) => sum + count, 0);
  if (total === 0) return [];

  return Object.entries(counts)
    .map(([state, count]) => ({ state, count, probability: count / total }))
    .sort((a, b) => a.state.localeCompare(b.state));
}
