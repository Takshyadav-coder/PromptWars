import { describe, it, expect } from 'vitest';
import { parseAndValidateCsv, sanitizeCell } from '../src/csvParser';

describe('csvParser', () => {
  it('neutralizes formula injection characters', () => {
    expect(sanitizeCell('=SUM(A1:A10)')).toBe("'=SUM(A1:A10)");
    expect(sanitizeCell('+cmd|')).toBe("'+cmd|");
    expect(sanitizeCell('-123')).toBe("'-123");
    expect(sanitizeCell('@calc')).toBe("'@calc");
    expect(sanitizeCell('\tmalicious')).toBe("'\tmalicious");
    expect(sanitizeCell('Normal Title')).toBe('Normal Title');
  });

  it('rejects CSV exceeding 1MB limit', () => {
    const hugeContent = 'a'.repeat(1024 * 1024 + 10);
    const result = parseAndValidateCsv(hugeContent);
    expect(result.success).toBe(false);
    expect(result.errors[0].message).toContain('1 MB');
  });

  it('rejects CSV exceeding 2,000 data rows', () => {
    const header = 'Title,Difficulty,Topic,Link,SolvedDate,Notes\n';
    let content = header;
    for (let i = 0; i < 2005; i++) {
      content += `Problem ${i},Easy,Arrays,https://leetcode.com/problems/two-sum/,2026-05-01,Note\n`;
    }
    const result = parseAndValidateCsv(content);
    expect(result.success).toBe(false);
    expect(result.errors[0].message).toContain('2,000 row');
  });

  it('reports line numbers accurately for invalid rows', () => {
    const csv = `Title,Difficulty,Topic,Link,SolvedDate,Notes
Valid Problem,Easy,Arrays,https://leetcode.com/problems/two-sum/,2026-05-01,Note
Invalid Difficulty,SuperHard,Arrays,,2026-05-01,
Future Date,Medium,DP,,2099-01-01,`;

    const result = parseAndValidateCsv(csv);
    expect(result.errors.length).toBeGreaterThanOrEqual(2);
    expect(result.errors[0].line).toBe(3); // Line 3 has SuperHard
    expect(result.errors[1].line).toBe(4); // Line 4 has future date
  });

  it('skips duplicate titles case-insensitively', () => {
    const existing = new Set(['two sum']);
    const csv = `Title,Difficulty,Topic,Link,SolvedDate,Notes
Two Sum,Easy,Arrays,https://leetcode.com/problems/two-sum/,2026-05-01,Existing
TWO SUM,Easy,Arrays,https://leetcode.com/problems/two-sum/,2026-05-01,Duplicate in file
Reverse String,Easy,Strings,,2026-05-01,New Problem
reverse string,Easy,Strings,,2026-05-01,Duplicate in file`;

    const result = parseAndValidateCsv(csv, existing);
    expect(result.validProblems.length).toBe(1);
    expect(result.validProblems[0].title).toBe('Reverse String');
    expect(result.skippedCount).toBe(3);
  });
});
