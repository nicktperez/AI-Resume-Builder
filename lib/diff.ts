export type DiffSegmentType = 'added' | 'removed' | 'unchanged';

export interface DiffSegment {
  type: DiffSegmentType;
  value: string;
}

const splitLines = (value: string): string[] =>
  value
    .replace(/\r\n/g, '\n')
    .split('\n')
    .map((line) => line.trimEnd());

export const computeLineDiff = (before: string, after: string): DiffSegment[] => {
  const beforeLines = splitLines(before);
  const afterLines = splitLines(after);
  const m = beforeLines.length;
  const n = afterLines.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

  for (let i = m - 1; i >= 0; i -= 1) {
    for (let j = n - 1; j >= 0; j -= 1) {
      if (beforeLines[i] === afterLines[j]) {
        dp[i][j] = 1 + dp[i + 1][j + 1];
      } else {
        dp[i][j] = Math.max(dp[i + 1][j], dp[i][j + 1]);
      }
    }
  }

  const result: DiffSegment[] = [];
  let i = 0;
  let j = 0;

  while (i < m && j < n) {
    if (beforeLines[i] === afterLines[j]) {
      result.push({ type: 'unchanged', value: beforeLines[i] });
      i += 1;
      j += 1;
    } else if (dp[i + 1][j] >= dp[i][j + 1]) {
      result.push({ type: 'removed', value: beforeLines[i] });
      i += 1;
    } else {
      result.push({ type: 'added', value: afterLines[j] });
      j += 1;
    }
  }

  while (i < m) {
    result.push({ type: 'removed', value: beforeLines[i] });
    i += 1;
  }

  while (j < n) {
    result.push({ type: 'added', value: afterLines[j] });
    j += 1;
  }

  return result;
};
