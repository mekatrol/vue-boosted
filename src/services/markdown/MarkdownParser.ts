import { MarkdownLineSplitter, breakMatch } from './MarkdownLineSplitter';
import { MarkdownState } from './MarkdownState';
import { MarkdownToken } from './MarkdownToken';
import { MarkdownTokenProcessor } from './MarkdownTokenProcessor';
import { MarkdownTokenType } from './MarkdownTokenType';

export class MarkdownTokeniser {
  private _processors: MarkdownTokenProcessor[];

  constructor(processors: MarkdownTokenProcessor[]) {
    this._processors = [...processors];

    // Newline ('\r\n')
    this._processors.push({
      regex: /^(\r\n|\r|\n)$/,
      tokenise: (match, state) => {
        return { type: MarkdownTokenType.newline, input: match[0], output: match[0], line: state.line, column: state.column } as MarkdownToken;
      }
    });

    // Breaks ('  \r\n' or '<br>\r\n')
    this._processors.push({
      regex: breakMatch,
      tokenise: (match, state) => {
        return { type: MarkdownTokenType.break, input: match[0], output: match[1], line: state.line, column: state.column } as MarkdownToken;
      }
    });

    // Headings
    this._processors.push({
      regex: /^((#{1,6})\s+(.*))\s*$/,
      tokenise: (match, state) => {
        const h = 'h' + match[2].length;
        return { type: h, input: match[0], output: `<${h}>${match[3]}</${h}>`, line: state.line, column: state.column } as MarkdownToken;
      }
    });
  }

  parse = (s: string): MarkdownState => {
    const state = { tokens: [], line: 1, column: 1 } as MarkdownState;

    const lines = MarkdownLineSplitter.parseLines(s);

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      let processOffset = 0;
      while (processOffset < line.length) {
        const text = line.substring(processOffset);
        const [match, processor] = this.firstMatch(text);

        // Match found, so exit loop
        if (!match || !processor) {
          this.addParaToken(text, state);
          break;
        }

        // Get any text prior to match as this is a plain para text token
        const textBeforeMatch = text.slice(0, match.index);

        if (textBeforeMatch.length > 0) {
          this.addParaToken(textBeforeMatch, state);
        }

        const token = processor.tokenise(match, state);
        state.tokens.push(token);

        // Move process offset to character after match
        processOffset += match.index + match[0].length;

        // Advance source line number?
        if (token.type === MarkdownTokenType.newline || token.type === MarkdownTokenType.break) {
          state.line++;
          state.column = 1;
        } else {
          state.column = processOffset + 1;
        }
      }
    }

    return state;
  };

  addParaToken = (s: string, state: MarkdownState): void => {
    const token = {
      type: MarkdownTokenType.p,
      input: s,
      output: s,
      line: state.line,
      column: state.column
    } as MarkdownToken;

    // Move column
    state.column += s.length;

    state.tokens.push(token);
  };

  firstMatch = (s: string): [RegExpExecArray | null, MarkdownTokenProcessor | null] => {
    if (s.length === 0) {
      // Nothing to match
      return [null, null];
    }

    let firstMatchIndex = s.length;
    let firstMatchProcessor: MarkdownTokenProcessor | null = null;
    let firstMatch: RegExpExecArray | null = null;

    for (const processor of this._processors) {
      const match = processor.regex.exec(s);

      if (!match) {
        continue;
      }

      if (match.index < firstMatchIndex) {
        firstMatchIndex = match.index;
        firstMatch = match;
        firstMatchProcessor = processor;
      }
    }

    return [firstMatch, firstMatchProcessor];
  };
}
