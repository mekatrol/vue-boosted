import { describe, expect, it } from 'vitest';
import { MarkdownTokeniser } from './MarkdownParser';
import { MarkdownTokenProcessor } from './MarkdownTokenProcessor';
import { MarkdownTokenType } from './MarkdownTokenType';
import { MarkdownLineSplitter } from './MarkdownLineSplitter';

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

    expect(tokenStack.tokens.length).toBe(4);

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

    expect(tokenStack.tokens.length).toBe(4);

    let token = tokenStack.tokens[0];
    expect(token.type).toBe(MarkdownTokenType.h1);
    expect(token.line).toBe(1);
    expect(token.column).toBe(1);
    expect(token.input).toBe('# this is h1');
    expect(token.output).toBe('<h1>this is h1</h1>');

    token = tokenStack.tokens[1];
    expect(token.type).toBe(MarkdownTokenType.h2);
    expect(token.line).toBe(2);
    expect(token.column).toBe(1);
    expect(token.input).toBe('## this is h2');
    expect(token.output).toBe('<h2>this is h2</h2>');

    token = tokenStack.tokens[2];
    expect(token.type).toBe(MarkdownTokenType.break);
    expect(token.line).toBe(2);
    expect(token.column).toBe(1);
    expect(token.input).toBe('<br>\r\n');
    expect(token.output).toBe('<br>');

    token = tokenStack.tokens[3];
    expect(token.type).toBe(MarkdownTokenType.h3);
    expect(token.line).toBe(3);
    expect(token.column).toBe(1);
    expect(token.input).toBe('### this is h3');
    expect(token.output).toBe('<h3>this is h3</h3>');
  });
});

describe('lines', () => {
  it('zero lines', () => {
    const lines = MarkdownLineSplitter.parseLines('');
    expect(lines.length).toBe(0);
  });

  it('single line', () => {
    const lines = MarkdownLineSplitter.parseLines('abcdef');
    expect(lines.length).toBe(1);
    expect(lines[0]).toBe('abcdef');
  });

  it('single line with new line following', () => {
    const lines = MarkdownLineSplitter.parseLines('abcdef\r\n');
    expect(lines.length).toBe(2);
    expect(lines[0]).toBe('abcdef');
    expect(lines[1]).toBe('\r\n');
  });

  it('two lines', () => {
    const lines = MarkdownLineSplitter.parseLines('abcdef\r\n123456');
    expect(lines.length).toBe(3);
    expect(lines[0]).toBe('abcdef');
    expect(lines[1]).toBe('\r\n');
    expect(lines[2]).toBe('123456');
  });

  it('two lines with CRLF', () => {
    const lines = MarkdownLineSplitter.parseLines('abcdef  \r\n123456');
    expect(lines.length).toBe(3);
    expect(lines[0]).toBe('abcdef');
    expect(lines[1]).toBe('  \r\n');
    expect(lines[2]).toBe('123456');
  });

  it('two lines with <br>', () => {
    const lines = MarkdownLineSplitter.parseLines('abcdef<br>\r\n123456');
    expect(lines.length).toBe(3);
    expect(lines[0]).toBe('abcdef');
    expect(lines[1]).toBe('<br>\r\n');
    expect(lines[2]).toBe('123456');
  });

  it('\n', () => {
    const lines = MarkdownLineSplitter.parseLines('# this is h1\n## this is h2<br>\r\n### this is h3');
    expect(lines.length).toBe(5);
    expect(lines[0]).toBe('# this is h1');
    expect(lines[1]).toBe('\n');
    expect(lines[2]).toBe('## this is h2');
  });
});
