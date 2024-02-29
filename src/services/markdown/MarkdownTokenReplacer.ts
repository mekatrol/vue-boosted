import { MarkdownState } from './MarkdownState';

export interface MarkdownTokenReplacer {
  (match: RegExpExecArray, state: MarkdownState): void;
}
