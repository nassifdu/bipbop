export function hotScore(
  upvotes: number,
  downvotes: number,
  createdAt: Date
): number {
  const score = upvotes - downvotes;
  const ageHours = (Date.now() - createdAt.getTime()) / 3_600_000;
  return score / Math.pow(ageHours + 2, 1.5);
}

export function voteCount(
  votes: { value: number }[]
): { upvotes: number; downvotes: number; score: number } {
  const upvotes = votes.filter((v) => v.value === 1).length;
  const downvotes = votes.filter((v) => v.value === -1).length;
  return { upvotes, downvotes, score: upvotes - downvotes };
}
