import { describe, expect, it } from 'vitest';
import { MarkdownTokeniser, defaultProcessors } from './MarkdownParser';
import { MarkdownTokenProcessor } from './MarkdownTokenProcessor';
import { MarkdownTokenType } from './MarkdownTokenType';
import { MarkdownToken } from './MarkdownToken';

const customMatchAllProcessor = {
  regex: /.*/, // Match anything including empy lines
  tokenise: (match, state) => {
    return { type: MarkdownTokenType.p, input: match[0], output: `<p><span>${match[0]}</span></p>`, line: state.line, column: state.column } as MarkdownToken;
  }
} as MarkdownTokenProcessor;

describe('headings', () => {
  it('headings', () => {
    const tokeniser = new MarkdownTokeniser(defaultProcessors, customMatchAllProcessor);

    const tokenStack = tokeniser.parse('# this is h1\n## this is h2<br>\n### this is h3');

    expect(tokenStack.tokens.length).toBe(5);

    let token = tokenStack.tokens[0];
    expect(token.type).toBe(MarkdownTokenType.h1);
    expect(token.line).toBe(1);
    expect(token.column).toBe(1);
    expect(token.input).toBe('# this is h1');
    expect(token.output).toBe('<h1>this is h1</h1>');

    token = tokenStack.tokens[1];
    expect(token.type).toBe(MarkdownTokenType.newline);
    expect(token.line).toBe(1);
    expect(token.column).toBe(13);
    expect(token.input).toBe('\n');
    expect(token.output).toBe('\n');

    token = tokenStack.tokens[2];
    expect(token.type).toBe(MarkdownTokenType.h2);
    expect(token.line).toBe(2);
    expect(token.column).toBe(1);
    expect(token.input).toBe('## this is h2');
    expect(token.output).toBe('<h2>this is h2</h2>');

    token = tokenStack.tokens[3];
    expect(token.type).toBe(MarkdownTokenType.break);
    expect(token.line).toBe(2);
    expect(token.column).toBe(14);
    expect(token.input).toBe('<br>\n');
    expect(token.output).toBe('<br>');

    token = tokenStack.tokens[4];
    expect(token.type).toBe(MarkdownTokenType.h3);
    expect(token.line).toBe(3);
    expect(token.column).toBe(1);
    expect(token.input).toBe('### this is h3');
    expect(token.output).toBe('<h3>this is h3</h3>');
  });
});
