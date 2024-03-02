import { describe, expect, it } from 'vitest';
import { MarkdownLineSplitter } from './MarkdownLineSplitter';

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
    const lines = MarkdownLineSplitter.parseLines('abcdef\n');
    expect(lines.length).toBe(2);
    expect(lines[0]).toBe('abcdef');
    expect(lines[1]).toBe('\n');
  });

  it('two lines', () => {
    const lines = MarkdownLineSplitter.parseLines('abcdef\r\n123456');
    expect(lines.length).toBe(3);
    expect(lines[0]).toBe('abcdef');
    expect(lines[1]).toBe('\n');
    expect(lines[2]).toBe('123456');
  });

  it('two lines with CRLF', () => {
    const lines = MarkdownLineSplitter.parseLines('abcdef  \r\n123456');
    expect(lines.length).toBe(3);
    expect(lines[0]).toBe('abcdef');
    expect(lines[1]).toBe('  \n');
    expect(lines[2]).toBe('123456');
  });

  it('two lines with <br>', () => {
    const lines = MarkdownLineSplitter.parseLines('abcdef<br>\r\n123456');
    expect(lines.length).toBe(3);
    expect(lines[0]).toBe('abcdef');
    expect(lines[1]).toBe('<br>\n');
    expect(lines[2]).toBe('123456');
  });

  it('\n', () => {
    const lines = MarkdownLineSplitter.parseLines('# this is h1\n## this is h2<br>\n### this is h3');
    expect(lines.length).toBe(5);
    expect(lines[0]).toBe('# this is h1');
    expect(lines[1]).toBe('\n');
    expect(lines[2]).toBe('## this is h2');
  });
});
