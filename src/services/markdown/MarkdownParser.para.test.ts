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

describe('para tokens', () => {
  it('single line para token', () => {
    const tokeniser = new MarkdownTokeniser(defaultProcessors, customMatchAllProcessor);

    const tokenStack = tokeniser.parse('abcdef');

    expect(tokenStack.tokens.length).toBe(1);

    const token = tokenStack.tokens[0];
    expect(token.type).toBe(MarkdownTokenType.p);
    expect(token.line).toBe(1);
    expect(token.column).toBe(1);
    expect(token.input).toBe('abcdef');
    expect(token.output).toBe('<p><span>abcdef</span></p>');
  });

  it('two line para token', () => {
    const tokeniser = new MarkdownTokeniser(defaultProcessors);

    const tokenStack = tokeniser.parse('abcdef  \r\n012345a<br>\n\n');

    expect(tokenStack.tokens.length).toBe(5);

    let token = tokenStack.tokens[0];
    expect(token.type).toBe(MarkdownTokenType.p);
    expect(token.line).toBe(1);
    expect(token.column).toBe(1);
    expect(token.input).toBe('abcdef');
    expect(token.output).toBe('<p>abcdef</p>');

    token = tokenStack.tokens[1];
    expect(token.type).toBe(MarkdownTokenType.break);
    expect(token.line).toBe(1);
    expect(token.column).toBe(7);
    expect(token.input).toBe('  \n');
    expect(token.output).toBe('  ');

    token = tokenStack.tokens[2];
    expect(token.type).toBe(MarkdownTokenType.p);
    expect(token.line).toBe(2);
    expect(token.column).toBe(1);
    expect(token.input).toBe('012345a');
    expect(token.output).toBe('<p>012345a</p>');

    token = tokenStack.tokens[3];
    expect(token.type).toBe(MarkdownTokenType.break);
    expect(token.line).toBe(2);
    expect(token.column).toBe(8);
    expect(token.input).toBe('<br>\n');
    expect(token.output).toBe('<br>');
  });

  it('para', () => {
    const tokeniser = new MarkdownTokeniser(defaultProcessors);

    const tokenStack = tokeniser.parse('this is p1\n this is p2<br>\n this is p3');

    expect(tokenStack.tokens.length).toBe(5);

    let token = tokenStack.tokens[0];
    expect(token.type).toBe(MarkdownTokenType.p);
    expect(token.line).toBe(1);
    expect(token.column).toBe(1);
    expect(token.input).toBe('this is p1');
    expect(token.output).toBe('<p>this is p1</p>');

    token = tokenStack.tokens[1];
    expect(token.type).toBe(MarkdownTokenType.newline);
    expect(token.line).toBe(1);
    expect(token.column).toBe(11);
    expect(token.input).toBe('\n');
    expect(token.output).toBe('\n');

    token = tokenStack.tokens[2];
    expect(token.type).toBe(MarkdownTokenType.p);
    expect(token.line).toBe(2);
    expect(token.column).toBe(1);
    expect(token.input).toBe(' this is p2');
    expect(token.output).toBe('<p> this is p2</p>');

    token = tokenStack.tokens[3];
    expect(token.type).toBe(MarkdownTokenType.break);
    expect(token.line).toBe(2);
    expect(token.column).toBe(12);
    expect(token.input).toBe('<br>\n');
    expect(token.output).toBe('<br>');

    token = tokenStack.tokens[4];
    expect(token.type).toBe(MarkdownTokenType.p);
    expect(token.line).toBe(3);
    expect(token.column).toBe(1);
    expect(token.input).toBe(' this is p3');
    expect(token.output).toBe('<p> this is p3</p>');
  });
});
