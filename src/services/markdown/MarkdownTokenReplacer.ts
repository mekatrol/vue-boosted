import { MarkdownParseResult } from './MarkdownParseResult';
import { MarkdownToken } from './MarkdownToken';

export interface MarkdownTokenReplacer {
  (match: RegExpExecArray, result: MarkdownParseResult): MarkdownToken;
}
