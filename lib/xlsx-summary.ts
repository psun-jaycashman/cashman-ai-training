import ExcelJS from 'exceljs';

/**
 * Build a structured plain-text summary of an uploaded .xlsx workbook so
 * that the rubric LLM can evaluate it the same way it evaluates a pasted
 * text response.
 *
 * The output mirrors the structure of the SoV-32M lesson workbook:
 *   - Per-row formulas/values for columns G-L on the line-item rows
 *   - Division subtotal rows (any row whose column B matches the division
 *     labels and that doesn't appear in the line-item span)
 *   - The project total row (the last row whose column B says PROJECT TOTAL)
 *
 * Generic enough to be useful for any future spreadsheet exercises, but
 * tuned for the SoV layout (columns A-L, header on row 5, data 6-26,
 * subtotals + grand total below).
 */
export async function summarizeWorkbook(buffer: ArrayBuffer | Buffer): Promise<string> {
  const wb = new ExcelJS.Workbook();
  // exceljs's typings ask for a Node Buffer; pass through if we already
  // have one, otherwise widen to one. The runtime accepts either.
  const buf = (buffer instanceof Buffer
    ? buffer
    : Buffer.from(buffer as ArrayBuffer)) as unknown as Parameters<typeof wb.xlsx.load>[0];
  await wb.xlsx.load(buf);
  const ws = wb.worksheets[0];
  if (!ws) return '(workbook contained no worksheets)';

  const lines: string[] = [];
  lines.push(`# Worksheet: ${ws.name}`);
  lines.push(`Rows: ${ws.rowCount}, Columns: ${ws.columnCount}`);
  lines.push('');

  // Find the header row by scanning column 1's first ~10 rows for "#" or
  // looking for a row whose column G/H/I labels include "Total Billed",
  // "% Complete", "Remaining". Fall back to row 5 (the SoV layout default).
  let headerRow = 5;
  for (let r = 1; r <= Math.min(15, ws.rowCount); r++) {
    const row = ws.getRow(r);
    const g = String(row.getCell(7).value ?? '').toLowerCase();
    if (g.includes('total billed')) {
      headerRow = r;
      break;
    }
  }
  lines.push(`Detected header row: ${headerRow}`);
  lines.push('');

  // Collect rows that look like line items (rows below the header until we
  // hit a blank #/Item column). Rows below that until end-of-sheet may
  // include subtotals and grand total.
  const dataStart = headerRow + 1;
  let lastDataRow = dataStart - 1;
  for (let r = dataStart; r <= ws.rowCount; r++) {
    const itemNum = ws.getRow(r).getCell(1).value;
    if (itemNum === null || itemNum === undefined || itemNum === '') break;
    lastDataRow = r;
  }

  lines.push(`## Line items (rows ${dataStart}-${lastDataRow})`);
  lines.push('Format per row: # | Division | Description | D=Total Contract | E=Prev | F=This');
  lines.push('Then formulas (or values if no formula) for columns G-L:');
  lines.push('');

  for (let r = dataStart; r <= lastDataRow; r++) {
    const row = ws.getRow(r);
    const item = row.getCell(1).value;
    const division = row.getCell(2).value;
    const desc = row.getCell(3).value;
    const d = row.getCell(4).value;
    const e = row.getCell(5).value;
    const f = row.getCell(6).value;
    lines.push(`Row ${r}: #${item} | ${division} | ${desc}`);
    lines.push(`  D=${fmtCell(d)}  E=${fmtCell(e)}  F=${fmtCell(f)}`);
    for (let c = 7; c <= 12; c++) {
      const colLetter = String.fromCharCode(64 + c); // 7 -> G
      const cell = row.getCell(c);
      lines.push(`  ${colLetter}: ${describeCell(cell)}`);
    }
  }
  lines.push('');

  // Subtotal + grand-total rows: anything below lastDataRow with content in
  // column B. This catches "01 — General Requirements" subtotal rows and
  // "PROJECT TOTAL" row regardless of exactly where they sit.
  lines.push('## Rows after the line items (subtotals + project total)');
  for (let r = lastDataRow + 1; r <= ws.rowCount; r++) {
    const row = ws.getRow(r);
    const labelB = String(row.getCell(2).value ?? '').trim();
    const labelC = String(row.getCell(3).value ?? '').trim();
    if (!labelB && !labelC) continue;
    lines.push(`Row ${r}: B="${labelB}"${labelC ? `  C="${labelC}"` : ''}`);
    for (let c = 4; c <= 12; c++) {
      const cell = row.getCell(c);
      const desc = describeCell(cell);
      if (desc !== '(empty)') {
        const colLetter = String.fromCharCode(64 + c);
        lines.push(`  ${colLetter}: ${desc}`);
      }
    }
  }

  return lines.join('\n');
}

function fmtCell(v: ExcelJS.CellValue): string {
  if (v === null || v === undefined || v === '') return '(blank)';
  if (typeof v === 'number') return v.toLocaleString();
  if (typeof v === 'string') return v;
  if (typeof v === 'object' && v !== null && 'result' in v) {
    return fmtCell((v as { result?: ExcelJS.CellValue }).result ?? null);
  }
  return String(v);
}

/**
 * Render a cell as either its formula (with computed value if exceljs
 * cached one) or its plain value. Skipping empty cells is the caller's
 * job; this returns "(empty)" so callers can drop them at will.
 */
function describeCell(cell: ExcelJS.Cell): string {
  const v = cell.value;
  if (v === null || v === undefined || v === '') return '(empty)';

  // Formula cells in exceljs come back as { formula, result } or as a
  // shared formula reference. Try to surface both the formula and any
  // cached result for the LLM to reason about.
  if (typeof v === 'object') {
    const obj = v as {
      formula?: string;
      sharedFormula?: string;
      result?: ExcelJS.CellValue;
      richText?: unknown;
    };
    if (obj.formula || obj.sharedFormula) {
      const formula = obj.formula ?? obj.sharedFormula ?? '';
      const result = obj.result !== undefined ? fmtCell(obj.result) : '(unevaluated)';
      return `formula \`=${formula}\` → ${result}`;
    }
    if (obj.richText) {
      return `text "${cell.text ?? ''}"`;
    }
  }

  if (typeof v === 'number') return `value ${v.toLocaleString()}`;
  if (typeof v === 'string') return `text "${v}"`;
  if (typeof v === 'boolean') return `bool ${v}`;
  return `value ${String(v)}`;
}
