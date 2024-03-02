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

describe('bold and/or italic', () => {
  it('bolditalic', () => {
    const tokeniser = new MarkdownTokeniser(defaultProcessors, customMatchAllProcessor);

    const tokenStack = tokeniser.parse('abcdef***bolditalic***ralph');

    expect(tokenStack.tokens.length).toBe(3);

    let token = tokenStack.tokens[0];
    expect(token.type).toBe(MarkdownTokenType.p);
    expect(token.line).toBe(1);
    expect(token.column).toBe(1);
    expect(token.input).toBe('abcdef');
    expect(token.output).toBe('<p><span>abcdef</span></p>');

    token = tokenStack.tokens[1];
    expect(token.type).toBe(MarkdownTokenType.bolditalic);
    expect(token.line).toBe(1);
    expect(token.column).toBe(7);
    expect(token.input).toBe('***bolditalic***');
    expect(token.output).toBe('<strong><em>bolditalic</em></strong>');

    token = tokenStack.tokens[2];
    expect(token.type).toBe(MarkdownTokenType.p);
    expect(token.line).toBe(1);
    expect(token.column).toBe(23);
    expect(token.input).toBe('ralph');
    expect(token.output).toBe('<p><span>ralph</span></p>');
  });

  it('bold', () => {
    const tokeniser = new MarkdownTokeniser(defaultProcessors, customMatchAllProcessor);

    const tokenStack = tokeniser.parse('abcdef**bold**ralph');

    expect(tokenStack.tokens.length).toBe(3);

    let token = tokenStack.tokens[0];
    expect(token.type).toBe(MarkdownTokenType.p);
    expect(token.line).toBe(1);
    expect(token.column).toBe(1);
    expect(token.input).toBe('abcdef');
    expect(token.output).toBe('<p><span>abcdef</span></p>');

    token = tokenStack.tokens[1];
    expect(token.type).toBe(MarkdownTokenType.bold);
    expect(token.line).toBe(1);
    expect(token.column).toBe(7);
    expect(token.input).toBe('**bold**');
    expect(token.output).toBe('<strong>bold</strong>');

    token = tokenStack.tokens[2];
    expect(token.type).toBe(MarkdownTokenType.p);
    expect(token.line).toBe(1);
    expect(token.column).toBe(15);
    expect(token.input).toBe('ralph');
    expect(token.output).toBe('<p><span>ralph</span></p>');
  });

  it('italic', () => {
    const tokeniser = new MarkdownTokeniser(defaultProcessors, customMatchAllProcessor);

    const tokenStack = tokeniser.parse('abcdef*italic*ralph');

    expect(tokenStack.tokens.length).toBe(3);

    let token = tokenStack.tokens[0];
    expect(token.type).toBe(MarkdownTokenType.p);
    expect(token.line).toBe(1);
    expect(token.column).toBe(1);
    expect(token.input).toBe('abcdef');
    expect(token.output).toBe('<p><span>abcdef</span></p>');

    token = tokenStack.tokens[1];
    expect(token.type).toBe(MarkdownTokenType.italic);
    expect(token.line).toBe(1);
    expect(token.column).toBe(7);
    expect(token.input).toBe('*italic*');
    expect(token.output).toBe('<em>italic</em>');

    token = tokenStack.tokens[2];
    expect(token.type).toBe(MarkdownTokenType.p);
    expect(token.line).toBe(1);
    expect(token.column).toBe(15);
    expect(token.input).toBe('ralph');
    expect(token.output).toBe('<p><span>ralph</span></p>');
  });

  it('bolditalicwithescaped', () => {
    const tokeniser = new MarkdownTokeniser(defaultProcessors, customMatchAllProcessor);

    const tokenStack = tokeniser.parse('abcdef***bold\\*italic***ralph');

    expect(tokenStack.tokens.length).toBe(3);

    let token = tokenStack.tokens[0];
    expect(token.type).toBe(MarkdownTokenType.p);
    expect(token.line).toBe(1);
    expect(token.column).toBe(1);
    expect(token.input).toBe('abcdef');
    expect(token.output).toBe('<p><span>abcdef</span></p>');

    token = tokenStack.tokens[1];
    expect(token.type).toBe(MarkdownTokenType.bolditalic);
    expect(token.line).toBe(1);
    expect(token.column).toBe(7);
    expect(token.input).toBe('***bold\\*italic***');
    expect(token.output).toBe('<strong><em>bold\\*italic</em></strong>');

    token = tokenStack.tokens[2];
    expect(token.type).toBe(MarkdownTokenType.p);
    expect(token.line).toBe(1);
    expect(token.column).toBe(25);
    expect(token.input).toBe('ralph');
    expect(token.output).toBe('<p><span>ralph</span></p>');
  });

  it('boldwithescaped', () => {
    const tokeniser = new MarkdownTokeniser(defaultProcessors, customMatchAllProcessor);

    const tokenStack = tokeniser.parse('abcdef\\***bo\\*ld**\\*ralph');

    expect(tokenStack.tokens.length).toBe(3);

    let token = tokenStack.tokens[0];
    expect(token.type).toBe(MarkdownTokenType.p);
    expect(token.line).toBe(1);
    expect(token.column).toBe(1);
    expect(token.input).toBe('abcdef\\*');
    expect(token.output).toBe('<p><span>abcdef\\*</span></p>');

    token = tokenStack.tokens[1];
    expect(token.type).toBe(MarkdownTokenType.bold);
    expect(token.line).toBe(1);
    expect(token.column).toBe(9);
    expect(token.input).toBe('**bo\\*ld**');
    expect(token.output).toBe('<strong>bo\\*ld</strong>');

    token = tokenStack.tokens[2];
    expect(token.type).toBe(MarkdownTokenType.p);
    expect(token.line).toBe(1);
    expect(token.column).toBe(19);
    expect(token.input).toBe('\\*ralph');
    expect(token.output).toBe('<p><span>\\*ralph</span></p>');
  });
});
