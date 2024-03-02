// Can be either '  \r\n' or '<br>\r\n'
export const breakMatch = /(\s\s|<br>)(\r\n|\n|\r)|(\r\n|\r|\n)/i;

export class MarkdownLineSplitter {
  public static parseLines = (s: string): string[] => {
    let processOffset = 0;
    const lines: string[] = [];

    while (processOffset < s.length) {
      const text = s.substring(processOffset);

      // No more text so exit loop
      if (text.length === 0) {
        break;
      }

      // Try and find a break match
      const match = breakMatch.exec(text);

      if (!match) {
        // No breaks so add remaining text and exit loop
        lines.push(text);
        break;
      }

      // Insert any text from before match
      lines.push(text.slice(0, match.index));

      // Normalise both '\r' and '\r\n' to '\n'
      // so that future use only need to consider '\n'
      const lineEnd = match[0].replace(/(\r|\r\n)$/, '\n');

      // Add line
      lines.push(lineEnd);

      // Move process offset to character after match
      processOffset += match.index + match[0].length;
    }

    return lines;
  };
}
