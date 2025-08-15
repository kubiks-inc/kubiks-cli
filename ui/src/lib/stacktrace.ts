export type StackFrame = {
  functionName?: string;
  file: string;
  line?: number;
  column?: number;
  raw: string;
};

export type ParsedStackTrace = {
  header?: string;
  frames: StackFrame[];
  raw: string;
};

// Attempts to extract a JavaScript/Node stack trace from a free-form log message.
// Returns parsed frames when successful; otherwise null.
export function extractStackTrace(message: string | undefined | null): ParsedStackTrace | null {
  if (!message) return null;
  const normalized = String(message).replace(/\r\n/g, '\n');
  const lines = normalized.split('\n');

  // Find the first line that looks like a stack frame ("at ...")
  let startIndex = -1;
  for (let i = 0; i < lines.length; i++) {
    if (/^\s*at\s+/.test(lines[i])) {
      startIndex = i;
      break;
    }
  }
  if (startIndex === -1) return null;

  // Optional header line above the first frame (e.g., "Error: Something broke")
  const headerCandidate = startIndex > 0 ? lines[startIndex - 1].trim() : '';
  const header = /error|exception|typeerror|referenceerror|rangeerror|syntaxerror/i.test(headerCandidate)
    ? headerCandidate
    : undefined;

  const frames: StackFrame[] = [];

  for (let i = startIndex; i < lines.length; i++) {
    const original = lines[i];
    const line = original.trim();
    if (!line) break;
    if (!/^at\s+/.test(line)) break;

    // Common forms:
    //  at funcName (file:line:column)
    //  at file:line:column
    //  at funcName (url)
    let match = line.match(/^at\s+(.*?)\s+\((.*?):(\d+):(\d+)\)$/);
    if (match) {
      frames.push({
        functionName: match[1],
        file: match[2],
        line: Number(match[3]),
        column: Number(match[4]),
        raw: original,
      });
      continue;
    }

    match = line.match(/^at\s+(.*?):(\d+):(\d+)$/);
    if (match) {
      frames.push({
        file: match[1],
        line: Number(match[2]),
        column: Number(match[3]),
        raw: original,
      });
      continue;
    }

    match = line.match(/^at\s+(.*?)\s+\((.*)\)$/);
    if (match) {
      frames.push({
        functionName: match[1],
        file: match[2],
        raw: original,
      });
      continue;
    }

    // Fallback: keep the raw line
    frames.push({ file: '', raw: original });
  }

  if (frames.length === 0) return null;

  return {
    header,
    frames,
    raw: lines.slice(startIndex).join('\n'),
  };
}


