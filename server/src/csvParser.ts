import { CsvRowSchema, ProblemInput } from '@leetquest/shared';

export interface CsvParseError {
  line: number;
  message: string;
  field?: string;
  raw?: string;
}

export interface CsvParseResult {
  success: boolean;
  validProblems: ProblemInput[];
  errors: CsvParseError[];
  skippedCount: number;
  totalRows: number;
}

const DANGEROUS_PREFIXES = ['=', '+', '-', '@', '\t', '\r'];

/**
 * Neutralizes CSV formula injection vulnerabilities.
 * Cells starting with =, +, -, @, tab, or carriage return are safely prefixed with a single quote.
 */
export function sanitizeCell(value: string): string {
  if (!value) return '';
  if (DANGEROUS_PREFIXES.some((prefix) => value.startsWith(prefix))) {
    return `'${value}`;
  }
  const trimmed = value.trim();
  if (DANGEROUS_PREFIXES.some((prefix) => trimmed.startsWith(prefix))) {
    return `'${trimmed}`;
  }
  return trimmed;
}

/**
 * Splits a CSV line handling quotes and commas properly.
 */
function splitCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let insideQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      if (insideQuotes && line[i + 1] === '"') {
        current += '"';
        i++; // skip escaped quote
      } else {
        insideQuotes = !insideQuotes;
      }
    } else if (char === ',' && !insideQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current);
  return result;
}

/**
 * Parses and validates CSV content for problems import.
 * Constraints:
 * - Cap at 1MB (1,048,576 bytes)
 * - Cap at 2,000 data rows
 * - Neutralize formula injection
 * - Per-row validation with line numbers
 * - Skip duplicate titles (case-insensitive) against existing problems or intra-file duplicates
 */
export function parseAndValidateCsv(
  csvContent: string,
  existingTitles: Set<string> = new Set()
): CsvParseResult {
  // Check size cap (1 MB)
  const byteSize = Buffer.byteLength(csvContent, 'utf8');
  if (byteSize > 1024 * 1024) {
    return {
      success: false,
      validProblems: [],
      errors: [{ line: 0, message: 'CSV file exceeds 1 MB size limit' }],
      skippedCount: 0,
      totalRows: 0,
    };
  }

  const lines = csvContent.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length === 0) {
    return {
      success: false,
      validProblems: [],
      errors: [{ line: 0, message: 'CSV file is empty' }],
      skippedCount: 0,
      totalRows: 0,
    };
  }

  // Header validation
  const headerLine = lines[0];
  const headerCols = splitCsvLine(headerLine).map((h) => h.trim());
  const expectedCols = ['Title', 'Difficulty', 'Topic', 'Link', 'SolvedDate', 'Notes'];

  // Case-insensitive header check
  const headerMap: Record<string, number> = {};
  for (let i = 0; i < headerCols.length; i++) {
    headerMap[headerCols[i].toLowerCase()] = i;
  }

  for (const expected of expectedCols) {
    if (headerMap[expected.toLowerCase()] === undefined) {
      return {
        success: false,
        validProblems: [],
        errors: [{ line: 1, message: `Missing required header column: ${expected}` }],
        skippedCount: 0,
        totalRows: 0,
      };
    }
  }

  const dataLines = lines.slice(1);
  if (dataLines.length > 2000) {
    return {
      success: false,
      validProblems: [],
      errors: [{ line: 0, message: 'CSV file exceeds 2,000 row limit' }],
      skippedCount: 0,
      totalRows: dataLines.length,
    };
  }

  const seenTitles = new Set<string>();
  existingTitles.forEach((t) => seenTitles.add(t.toLowerCase()));

  const validProblems: ProblemInput[] = [];
  const errors: CsvParseError[] = [];
  let skippedCount = 0;

  for (let idx = 0; idx < dataLines.length; idx++) {
    const lineNumber = idx + 2; // 1-indexed, header is line 1
    const rawLine = dataLines[idx];
    const cells = splitCsvLine(rawLine);

    const title = sanitizeCell(cells[headerMap['title']] || '');
    const difficulty = sanitizeCell(cells[headerMap['difficulty']] || '');
    const topic = sanitizeCell(cells[headerMap['topic']] || '');
    const link = sanitizeCell(cells[headerMap['link']] || '');
    const solvedDate = sanitizeCell(cells[headerMap['solveddate']] || '');
    const notes = sanitizeCell(cells[headerMap['notes']] || '');

    if (!title) {
      errors.push({ line: lineNumber, message: 'Empty problem title', raw: rawLine });
      continue;
    }

    const lowerTitle = title.toLowerCase();
    if (seenTitles.has(lowerTitle)) {
      skippedCount++;
      continue;
    }

    const rowObj = {
      Title: title,
      Difficulty: difficulty,
      Topic: topic,
      Link: link,
      SolvedDate: solvedDate,
      Notes: notes,
    };

    const parsed = CsvRowSchema.safeParse(rowObj);
    if (!parsed.success) {
      const issue = parsed.error.issues[0];
      errors.push({
        line: lineNumber,
        field: issue.path.join('.'),
        message: issue.message,
        raw: rawLine,
      });
      continue;
    }

    seenTitles.add(lowerTitle);
    validProblems.push({
      title: parsed.data.Title,
      difficulty: parsed.data.Difficulty,
      topic: parsed.data.Topic,
      url: parsed.data.Link || undefined,
      solvedDate: parsed.data.SolvedDate,
      notes: parsed.data.Notes || undefined,
    });
  }

  return {
    success: errors.length === 0,
    validProblems,
    errors,
    skippedCount,
    totalRows: dataLines.length,
  };
}
