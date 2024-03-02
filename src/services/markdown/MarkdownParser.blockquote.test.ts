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

describe('block quotes', () => {
  it('tripple', () => {
    const tokeniser = new MarkdownTokeniser(defaultProcessors, customMatchAllProcessor);

    const tokenStack = tokeniser.parse('>>> ralph');

    expect(tokenStack.tokens.length).toBe(1);

    const token = tokenStack.tokens[0];
    expect(token.type).toBe(MarkdownTokenType.blockquote);
    expect(token.line).toBe(1);
    expect(token.column).toBe(1);
    expect(token.input).toBe('>>> ralph');
    expect(token.output).toBe("<div class='md-block-quote-3'>ralph</div>");
  });

  it('double', () => {
    const tokeniser = new MarkdownTokeniser(defaultProcessors, customMatchAllProcessor);

    const tokenStack = tokeniser.parse('>> ralph');

    expect(tokenStack.tokens.length).toBe(1);

    const token = tokenStack.tokens[0];
    expect(token.type).toBe(MarkdownTokenType.blockquote);
    expect(token.line).toBe(1);
    expect(token.column).toBe(1);
    expect(token.input).toBe('>> ralph');
    expect(token.output).toBe("<div class='md-block-quote-2'>ralph</div>");
  });

  it('single', () => {
    const tokeniser = new MarkdownTokeniser(defaultProcessors, customMatchAllProcessor);

    const tokenStack = tokeniser.parse('> ralph');

    expect(tokenStack.tokens.length).toBe(1);

    const token = tokenStack.tokens[0];
    expect(token.type).toBe(MarkdownTokenType.blockquote);
    expect(token.line).toBe(1);
    expect(token.column).toBe(1);
    expect(token.input).toBe('> ralph');
    expect(token.output).toBe("<div class='md-block-quote-1'>ralph</div>");
  });
});
