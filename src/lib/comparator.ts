import * as Diff from 'diff';

export type ConflictItem = {
  type: 'conflict';
  source: string; // From Doc A
  target: string; // From Doc B
  diff: Diff.Change[];
  score: number;
};

export type UniqueItem = {
  type: 'unique';
  text: string;
  sourceDoc: 'A' | 'B';
};

export type ComparisonReport = {
  conflicts: ConflictItem[];
  uniqueToA: UniqueItem[];
  uniqueToB: UniqueItem[];
  matchCount: number;
};

// Dice Coefficient for string similarity (0.0 to 1.0)
function getDiceCoefficient(str1: string, str2: string): number {
  if (!str1 || !str2) return 0;

  const bigrams1 = getBigrams(str1);
  const bigrams2 = getBigrams(str2);

  const intersection = bigrams1.filter(b => bigrams2.includes(b)).length;
  const total = bigrams1.length + bigrams2.length;

  if (total === 0) return 0;
  return (2 * intersection) / total;
}

function getBigrams(str: string): string[] {
  const s = str.toLowerCase().replace(/[^a-z0-9]/g, '');
  const bigrams: string[] = [];
  for (let i = 0; i < s.length - 1; i++) {
    bigrams.push(s.substring(i, i + 2));
  }
  return bigrams;
}

function splitSentences(text: string): string[] {
  // Simple sentence splitter: looks for periods, questions, exclamations followed by space or end of line.
  // Clean up whitespace.
  return text
    .replace(/([.?!])\s*(?=[A-Z])/g, "$1|")
    .split("|")
    .map(s => s.trim())
    .filter(s => s.length > 5); // Ignore very short fragments
}

export function detectConflicts(textA: string, textB: string): ComparisonReport {
  const sentencesA = splitSentences(textA);
  const sentencesB = splitSentences(textB);

  const conflicts: ConflictItem[] = [];
  const uniqueToA: UniqueItem[] = [];
  const uniqueToB: UniqueItem[] = [...sentencesB.map(s => ({ type: 'unique' as const, text: s, sourceDoc: 'B' as const }))];
  let matchCount = 0;

  // Thresholds
  const MATCH_THRESHOLD = 0.95; // Almost identical
  const CONFLICT_THRESHOLD = 0.5; // Similarity to consider it a modification/conflict

  sentencesA.forEach(sentA => {
    let bestMatchIndex = -1;
    let bestScore = 0;

    for (let i = 0; i < uniqueToB.length; i++) {
      const sentB = uniqueToB[i].text;
      const score = getDiceCoefficient(sentA, sentB);

      if (score > bestScore) {
        bestScore = score;
        bestMatchIndex = i;
      }
    }

    if (bestScore >= MATCH_THRESHOLD) {
      // Exact or near-exact match
      matchCount++;
      // Remove from B list so we don't match it again
      if (bestMatchIndex !== -1) {
        uniqueToB.splice(bestMatchIndex, 1);
      }
    } else if (bestScore >= CONFLICT_THRESHOLD) {
      // It's a conflict/modification
      if (bestMatchIndex !== -1) {
        const sentB = uniqueToB[bestMatchIndex].text;
        conflicts.push({
          type: 'conflict',
          source: sentA,
          target: sentB,
          diff: Diff.diffWords(sentA, sentB),
          score: bestScore
        });
        // Remove from B list
        uniqueToB.splice(bestMatchIndex, 1);
      }
    } else {
      // No good match found, it's unique to A
      uniqueToA.push({
        type: 'unique',
        text: sentA,
        sourceDoc: 'A'
      });
    }
  });

  return {
    conflicts,
    uniqueToA,
    uniqueToB,
    matchCount
  };
}
