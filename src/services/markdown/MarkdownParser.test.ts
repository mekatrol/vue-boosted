import { describe, expect, it } from 'vitest';
import { MarkdownTokeniser } from './MarkdownParser';
import { MarkdownTokenProcessor } from './MarkdownTokenProcessor';
import { MarkdownTokenType } from './MarkdownTokenType';

describe('para tokens', () => {
  it('single line para token', () => {
    const processors: MarkdownTokenProcessor[] = [];
    const tokeniser = new MarkdownTokeniser(processors);

    const tokenStack = tokeniser.parse('abcdef');

    expect(tokenStack.tokens.length).toBe(1);

    const token = tokenStack.tokens[0];
    expect(token.type).toBe(MarkdownTokenType.p);
    expect(token.line).toBe(1);
    expect(token.column).toBe(1);
    expect(token.input).toBe('abcdef');
    expect(token.output).toBe('abcdef');
  });

  it('two line para token', () => {
    const processors: MarkdownTokenProcessor[] = [];
    const tokeniser = new MarkdownTokeniser(processors);

    const tokenStack = tokeniser.parse('abcdef  \r\n012345a<br>\r\n\r\n');

    expect(tokenStack.tokens.length).toBe(5);

    let token = tokenStack.tokens[0];
    expect(token.type).toBe(MarkdownTokenType.p);
    expect(token.line).toBe(1);
    expect(token.column).toBe(1);
    expect(token.input).toBe('abcdef');
    expect(token.output).toBe('abcdef');

    token = tokenStack.tokens[1];
    expect(token.type).toBe(MarkdownTokenType.break);
    expect(token.line).toBe(1);
    expect(token.column).toBe(7);
    expect(token.input).toBe('  \r\n');
    expect(token.output).toBe('  ');

    token = tokenStack.tokens[2];
    expect(token.type).toBe(MarkdownTokenType.p);
    expect(token.line).toBe(2);
    expect(token.column).toBe(1);
    expect(token.input).toBe('012345a');
    expect(token.output).toBe('012345a');

    token = tokenStack.tokens[3];
    expect(token.type).toBe(MarkdownTokenType.break);
    expect(token.line).toBe(2);
    expect(token.column).toBe(8);
    expect(token.input).toBe('<br>\r\n');
    expect(token.output).toBe('<br>');
  });

  it('headings', () => {
    const processors: MarkdownTokenProcessor[] = [];
    const tokeniser = new MarkdownTokeniser(processors);

    const tokenStack = tokeniser.parse('# this is h1\n## this is h2<br>\r\n### this is h3');

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
    expect(token.input).toBe('<br>\r\n');
    expect(token.output).toBe('<br>');

    token = tokenStack.tokens[4];
    expect(token.type).toBe(MarkdownTokenType.h3);
    expect(token.line).toBe(3);
    expect(token.column).toBe(1);
    expect(token.input).toBe('### this is h3');
    expect(token.output).toBe('<h3>this is h3</h3>');
  });
});
