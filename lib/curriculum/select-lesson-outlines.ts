/** Keep a bounded school lesson's explanation, manipulation and final check. */
export function selectCurriculumOutlines<T extends { type: string; order: number }>(
  outlines: readonly T[],
  maximum: number,
): T[] {
  const limit = Math.max(1, Math.floor(maximum));
  if (outlines.length <= limit) return [...outlines];
  const selected = new Set<number>([0]);
  const quiz = outlines.findLastIndex((outline) => outline.type === 'quiz');
  if (limit >= 2 && quiz > 0) selected.add(quiz);
  const interactive = outlines.findIndex((outline) => outline.type === 'interactive');
  if (selected.size < limit && interactive >= 0) selected.add(interactive);
  for (let index = 0; selected.size < limit && index < outlines.length; index += 1) {
    selected.add(index);
  }
  // The final check stays last even when an overlong draft placed more material after it.
  const indices = [...selected].sort((a, b) => a - b).filter((index) => index !== quiz);
  if (selected.has(quiz)) indices.push(quiz);
  return indices.map((index, order) => ({ ...outlines[index], order }));
}
