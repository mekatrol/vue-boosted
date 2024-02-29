import { MarkdownState } from './MarkdownState';
import { MarkdownToken } from './MarkdownToken';

export interface MarkdownTokenReplacer {
  (match: RegExpExecArray, state: MarkdownState): MarkdownToken;
}
