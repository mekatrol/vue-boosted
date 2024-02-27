import { describe, expect, it } from 'vitest';
import { MarkdownToHtmlParser } from './markdownToHtml';

describe('h1', () => {
  const parser = new MarkdownToHtmlParser();
  const h1 = parser.markdownToHtml('# Heading 1');

  it('#heading 1', () => {
    expect(h1).toBe('<h1>Heading 1</h1>');
  });
});

describe('h1_no_space_is_para', () => {
  const parser = new MarkdownToHtmlParser();
  const p = parser.markdownToHtml('#Heading 1');

  it('# heading 1 is para', () => {
    expect(p).toBe('<p>#Heading 1</p>');
  });
});

describe('isString', () => {
  const parser = new MarkdownToHtmlParser();
  const isString = parser.isString('xxx');

  it('isString true for string', () => {
    expect(isString).toBe(true);
  });

  const isNumber = parser.isString(1);

  it('isString false for number', () => {
    expect(isNumber).toBe(false);
  });

  const isObject = parser.isString({ x: 1 });

  it('isString false for object', () => {
    expect(isObject).toBe(false);
  });

  const isUndefined = parser.isString(undefined);

  it('isString false for undefined', () => {
    expect(isUndefined).toBe(false);
  });
});

describe('remove non whitespace', () => {
  const parser = new MarkdownToHtmlParser();

  it('empty string', () => {
    expect(parser.removeNonWhitespace('')).toBe('');
  });

  it('\\b', () => {
    expect(parser.removeNonWhitespace('\b')).toBe('');
  });

  it('\\v', () => {
    expect(parser.removeNonWhitespace('\v')).toBe('');
  });

  it('\\f', () => {
    expect(parser.removeNonWhitespace('\f')).toBe('');
  });

  it('\\r', () => {
    expect(parser.removeNonWhitespace('\r')).toBe('');
  });

  it('\\n', () => {
    expect(parser.removeNonWhitespace('\n')).toBe('');
  });
});

describe('escape character', () => {
  const parser = new MarkdownToHtmlParser();

  const text = '&#;';

  it('&', () => {
    expect(parser.htmlEscapeChar(text)).toBe('&#38;');
    expect(parser.htmlEscapeChar(text, 0)).toBe('&#38;');
  });

  it('#', () => {
    expect(parser.htmlEscapeChar(text, 1)).toBe('&#35;');
  });

  it(';', () => {
    expect(parser.htmlEscapeChar(text, 2)).toBe('&#59;');
  });
});

describe('escaped chars', () => {
  const parser = new MarkdownToHtmlParser();

  it('empty string', () => {
    expect(parser.escapedToUnicode('')).toBe('');
  });

  it('\\*', () => {
    expect(parser.escapedToUnicode('\\*')).toBe('&#42;');
  });

  it('\\_', () => {
    expect(parser.escapedToUnicode('\\_')).toBe('&#95;');
  });

  it('\\{', () => {
    expect(parser.escapedToUnicode('\\{')).toBe('&#123;');
  });

  it('\\}', () => {
    expect(parser.escapedToUnicode('\\}')).toBe('&#125;');
  });

  it('\\[', () => {
    expect(parser.escapedToUnicode('\\[')).toBe('&#91;');
  });

  it('\\]', () => {
    expect(parser.escapedToUnicode('\\]')).toBe('&#93;');
  });

  it('\\(', () => {
    expect(parser.escapedToUnicode('\\(')).toBe('&#40;');
  });

  it('\\)', () => {
    expect(parser.escapedToUnicode('\\)')).toBe('&#41;');
  });

  it('\\#', () => {
    expect(parser.escapedToUnicode('\\#')).toBe('&#35;');
  });

  it('\\+', () => {
    expect(parser.escapedToUnicode('\\+')).toBe('&#43;');
  });

  it('\\.', () => {
    expect(parser.escapedToUnicode('\\.')).toBe('&#46;');
  });

  it('\\!', () => {
    expect(parser.escapedToUnicode('\\!')).toBe('&#33;');
  });
});

describe('to unicode', () => {
  const parser = new MarkdownToHtmlParser();

  it('empty string', () => {
    expect(parser.encodeSpecial('')).toBe('');
  });

  it('<', () => {
    expect(parser.encodeSpecial('<')).toBe('&#60;');
  });

  it('>', () => {
    expect(parser.encodeSpecial('>')).toBe('&#62;');
  });

  it('%', () => {
    expect(parser.encodeSpecial('%')).toBe('&#37;');
  });

  it('@', () => {
    expect(parser.encodeSpecial('@')).toBe('&#64;');
  });

  it('&', () => {
    expect(parser.encodeSpecial('&')).toBe('&#38;');
  });

  it('#', () => {
    expect(parser.encodeSpecial('#')).toBe('&#35;');
  });

  it(';', () => {
    expect(parser.encodeSpecial(';')).toBe('&#59;');
  });

  // Special case swhere values have already converted to escaped unicode
  // we do not want to convert them again
  it('&#59;', () => {
    expect(parser.encodeSpecial('&#59;')).toBe('&#59;');
  });

  it('&#35;', () => {
    expect(parser.encodeSpecial('&#35;')).toBe('&#35;');
  });

  it('&#123;', () => {
    expect(parser.encodeSpecial('&#123;')).toBe('&#123;');
  });

  it('&#59;&#35;&#123;', () => {
    expect(parser.encodeSpecial('&#59;&#35;&#123;')).toBe('&#59;&#35;&#123;');
  });

  it('&#59 ;&#35;&#123;', () => {
    expect(parser.encodeSpecial('&#59 ;&#35;&#123;')).toBe('&#38;&#35;59 &#59;&#35;&#123;');
  });

  it('long string', () => {
    expect(parser.encodeSpecial('The quick brown fox & the slow turtle&#amp; &#hearts;')).toBe('The quick brown fox &#38; the slow turtle&#38; &#9829;');
  });
});
