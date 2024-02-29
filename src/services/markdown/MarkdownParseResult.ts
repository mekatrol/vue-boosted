import { MarkdownToken } from './MarkdownToken';

export interface MarkdownParseResult {
  tokens: MarkdownToken[];
  line: number;
  column: number;
}
