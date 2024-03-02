import { describe, expect, it } from 'vitest';
import { MarkdownTokeniser } from './MarkdownParser';
import { MarkdownTokenProcessor } from './MarkdownTokenProcessor';
import { MarkdownTokenType } from './MarkdownTokenType';
import { MarkdownToken } from './MarkdownToken';
import { breakMatch } from './MarkdownLineSplitter';

const customMatchAllProcessor = {
  regex: /.*/, // Match anything including empy lines
  tokenise: (match, state) => {
    return { type: MarkdownTokenType.p, input: match[0], output: `<p><span>${match[0]}</span></p>`, line: state.line, column: state.column } as MarkdownToken;
  }
} as MarkdownTokenProcessor;

const processors = [
  // Newline ('\r\n')
  {
    regex: /^(\r\n|\r|\n)$/,
    tokenise: (match, state) => {
      return { type: MarkdownTokenType.newline, input: match[0], output: match[0], line: state.line, column: state.column } as MarkdownToken;
    }
  } as MarkdownTokenProcessor,

  // Breaks ('  \r\n' or '<br>\r\n')
  {
    regex: breakMatch,
    tokenise: (match, state) => {
      return { type: MarkdownTokenType.break, input: match[0], output: match[1], line: state.line, column: state.column } as MarkdownToken;
    }
  } as MarkdownTokenProcessor,

  // Headings
  {
    regex: /^((#{1,6})\s+(.*))\s*$/,
    tokenise: (match, state) => {
      const h = 'h' + match[2].length;
      return { type: h, input: match[0], output: `<${h}>${match[3]}</${h}>`, line: state.line, column: state.column } as MarkdownToken;
    }
  } as MarkdownTokenProcessor,

  // Bold and Italic
  {
    regex: /(?<!\\)\*\*\*(.*?)(?<!\\)\*\*\*/,
    tokenise: (match, state) => {
      return { type: MarkdownTokenType.bolditalic, input: match[0], output: `<strong><em>${match[1]}</em></strong>`, line: state.line, column: state.column } as MarkdownToken;
    }
  } as MarkdownTokenProcessor,

  // Bold
  {
    regex: /(?<!\\)\*\*(.*?)(?<!\\)\*\*/,
    tokenise: (match, state) => {
      return { type: MarkdownTokenType.bold, input: match[0], output: `<strong>${match[1]}</strong>`, line: state.line, column: state.column } as MarkdownToken;
    }
  } as MarkdownTokenProcessor,

  // Italic
  {
    regex: /(?<!\\)\*(.*?)(?<!\\)\*/,
    tokenise: (match, state) => {
      return { type: MarkdownTokenType.italic, input: match[0], output: `<em>${match[1]}</em>`, line: state.line, column: state.column } as MarkdownToken;
    }
  } as MarkdownTokenProcessor
];

describe('bold and/or italic', () => {
  it('bolditalic', () => {
    const tokeniser = new MarkdownTokeniser(processors, customMatchAllProcessor);

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
    const tokeniser = new MarkdownTokeniser(processors, customMatchAllProcessor);

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
    const tokeniser = new MarkdownTokeniser(processors, customMatchAllProcessor);

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
    const tokeniser = new MarkdownTokeniser(processors, customMatchAllProcessor);

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
    const tokeniser = new MarkdownTokeniser(processors, customMatchAllProcessor);

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

describe('para tokens', () => {
  it('single line para token', () => {
    const tokeniser = new MarkdownTokeniser(processors, customMatchAllProcessor);

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
    const tokeniser = new MarkdownTokeniser(processors);

    const tokenStack = tokeniser.parse('abcdef  \r\n012345a<br>\r\n\r\n');

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
    expect(token.input).toBe('  \r\n');
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
    expect(token.input).toBe('<br>\r\n');
    expect(token.output).toBe('<br>');
  });

  it('headings', () => {
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

  it('para', () => {
    const tokeniser = new MarkdownTokeniser(processors);

    const tokenStack = tokeniser.parse('this is p1\n this is p2<br>\r\n this is p3');

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
    expect(token.input).toBe('<br>\r\n');
    expect(token.output).toBe('<br>');

    token = tokenStack.tokens[4];
    expect(token.type).toBe(MarkdownTokenType.p);
    expect(token.line).toBe(3);
    expect(token.column).toBe(1);
    expect(token.input).toBe(' this is p3');
    expect(token.output).toBe('<p> this is p3</p>');
  });
});
