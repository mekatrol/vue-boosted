import { MarkdownTokenReplacer } from './MarkdownTokenReplacer';

export interface MarkdownTokenProcessor {
  regex: RegExp;
  tokenise: MarkdownTokenReplacer;
}
