import { MarkdownTokenType } from './MarkdownTokenType';

export interface MarkdownToken {
  type: MarkdownTokenType;
  input: string;
  output: string;
  line: number;
  column: number;
}
