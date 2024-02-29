import { MarkdownLineSplitter } from './MarkdownLineSplitter';
import { MarkdownParseResult as MarkdownParseResult } from './MarkdownParseResult';
import { MarkdownToken } from './MarkdownToken';
import { MarkdownTokenProcessor } from './MarkdownTokenProcessor';
import { MarkdownTokenType } from './MarkdownTokenType';

const defaultMatchAllProcessor = {
  regex: /.*/, // Match anything including empy lines
  tokenise: (match, state) => {
    return { type: MarkdownTokenType.p, input: match[0], output: `<p>${match[0]}</p>`, line: state.line, column: state.column } as MarkdownToken;
  }
} as MarkdownTokenProcessor;

export class MarkdownTokeniser {
  private _processors: MarkdownTokenProcessor[];
  private _defaultProcessor: MarkdownTokenProcessor;
  private _state = { tokens: [], line: 1, column: 1 } as MarkdownParseResult;

  constructor(processors: MarkdownTokenProcessor[], matchAllProcessor: MarkdownTokenProcessor | null = null) {
    this._processors = [...processors];
    this._defaultProcessor = matchAllProcessor ?? defaultMatchAllProcessor;
  }

  parse = (text: string): MarkdownParseResult => {
    // A new state
    this._state = { tokens: [], line: 1, column: 1 } as MarkdownParseResult;

    // Convert to markdown lines and parse each line
    MarkdownLineSplitter.parseLines(text).forEach((l) => this.parseLine(l));

    return this._state;
  };

  private parseLine = (line: string): void => {
    let lineOffset = 0;

    while (lineOffset < line.length) {
      const text = line.substring(lineOffset);
      const [match, processor] = this.getFirstMatchProcessor(text);

      // Get any text prior to match and process with default processor
      const textBeforeMatch = text.slice(0, match.index);
      if (textBeforeMatch.length > 0) {
        this.parseLine(textBeforeMatch);
      }

      // Tokenise using processor
      const token = processor.tokenise(match, this._state);

      // Move to character after match end
      lineOffset += match.index + match[0].length;

      // Add the token
      this.addToken(token, lineOffset + 1);
    }
  };

  private addToken = (token: MarkdownToken, column: number): void => {
    this._state.tokens.push(token);

    if (token.type === MarkdownTokenType.newline || token.type === MarkdownTokenType.break) {
      // Advance source line number
      this._state.line++;
      this._state.column = 1;
    } else {
      // Advance source column number
      this._state.column = column;
    }
  };

  private getFirstMatchProcessor = (s: string): [RegExpExecArray, MarkdownTokenProcessor] => {
    let firstMatchIndex = s.length; // Default to end of string for the default match all processor
    let firstMatchProcessor: MarkdownTokenProcessor = this._defaultProcessor;
    let firstMatch: RegExpExecArray = this._defaultProcessor.regex.exec(s) as RegExpExecArray;

    for (const processor of this._processors) {
      const match = processor.regex.exec(s);

      // Move to next processor if no match
      if (!match) {
        continue;
      }

      // Did this processor match earlier in the string?
      if (match.index < firstMatchIndex) {
        // Switch to this processor because it matched earlier in the string
        firstMatchIndex = match.index;
        firstMatch = match;
        firstMatchProcessor = processor;
      }
    }

    return [firstMatch, firstMatchProcessor];
  };
}
