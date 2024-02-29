import { MarkdownToken } from './MarkdownToken';

export interface MarkdownState {
  tokens: MarkdownToken[];
  line: number;
  column: number;
}
