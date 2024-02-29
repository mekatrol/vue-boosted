import { friendlyCodeToNumberCode } from './htmlEncodings';

type ParseMatchFunction = (match: string) => string;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type StringReplacerFunction = (substring: string, ...args: any[]) => string;

export interface MarkdownRule {
  pattern: RegExp;
  replacer: StringReplacerFunction | string;
}

export class MarkdownToHtmlParser {
  isString = (o: unknown): boolean => {
    return typeof o === 'string';
  };

  /**
   * Converts the provided markdown to HTML.
   */
  markdownToHtml = (markdown: string): string => {
    return this.parse(markdown);
  };

  // HTML escaped version
  htmlEscapeChar = (text: string, charOffset = 0): string => '&#' + text.charCodeAt(charOffset) + ';';

  // Remove non whitespace characters
  removeNonWhitespace = (text: string): string => text.replace(/[\b\v\f\r\n]/g, '');

  // Convert markdown escaped to HTML unicode  equivilent, eg '\!' becomes '&#33;'
  escapedToUnicode = (text: string): string => text.replace(/\\./g, (match) => this.htmlEscapeChar(match, 1));

  // Convert special HTML characters to their HTML unicode encoded equivilent
  encodeSpecial = (text: string): string =>
    text
      // Special characters that we want to escape
      .replace(/[\<\>\@\%]/g, (s) => this.htmlEscapeChar(s))

      // Known friendly names to unicode equivilents
      .replace(/\&\#[a-zA-Z]+[a-zA-Z0-9]*\;/gi, (s) => friendlyCodeToNumberCode(s))

      // Ampersand where it is not in sequence with '&#\d+' (ie it is not already an escaped sequence)
      .replace(/(\&(?!\#\d+\;))/g, (s) => this.htmlEscapeChar(s))

      // Hash where it is not in sequence with '&#\d+' (ie it is not already an escaped sequence)
      .replace(/(?<!\&)\#|\#(?!\d+\;)/g, (s) => this.htmlEscapeChar(s))

      // Semicolon where it is not in sequence with '&#\d+' (ie it is not already an escaped sequence)
      .replace(/((?<!\&\#\d+)\;)/g, (s) => this.htmlEscapeChar(s));

  parse = (text: string): string => {
    text = this.removeNonWhitespace(text);
    text = this.escapedToUnicode(text);

    let temp = this.block(text);

    if (temp === text && !temp.match(/^\s*$/i)) {
      temp = this.inlineBlock(temp)
        // handle paragraphs
        .replace(/((.|\n)+?)(\n\n+|$)/g, (_ /* match */, text) => this.tag('p', text));
    }

    return temp.replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number.parseInt(code, 10)));
  };

  /**
   * Process the markdown with the rules provided.
   */
  processMarkdown = (text: string, rules: MarkdownRule[], parse: ParseMatchFunction): string => {
    for (const rule of rules) {
      const { pattern: regex, replacer } = rule;
      const content = regex.exec(text);

      // No content found for the current rule therefore we can move to the next
      // one.
      if (!content) {
        continue;
      }

      // Keep track of where the original content ended in relation to the text
      // provided.
      const endOfContentIndex = content.index + content[0].length;

      const textBeforeHtmlReplacement = parse(text.slice(0, content.index));
      const textAfterHtmlReplacement = parse(text.slice(endOfContentIndex));

      // The replacement text that has been transformed to HTML.
      let htmlReplacement: string;

      if (this.isString(replacer)) {
        // String `Replacer`s only support replacing the first digit - like `$1`.
        htmlReplacement = replacer.replace(/\$(\d)/g, (_, firstDigit) => content[firstDigit]);
      } else {
        // With function `Replacer`s the whole match and all content is provided
        const [fullMatch, ...rest] = content;
        htmlReplacement = replacer(fullMatch, ...rest);
      }

      return `${textBeforeHtmlReplacement}${htmlReplacement}${textAfterHtmlReplacement}`;
    }

    // No matches found in loop so we can return the text unchanged.
    return text;
  };

  inline = (text: string): string => {
    return this.processMarkdown(
      text,
      [
        // - Bold => `**bold**`
        // - Italic => `*italic*` | `_italic_`
        // - Bold and Italic => `**_mixed_**` TODO this doesn't check for
        //   correctly matching tags.
        {
          pattern: /([*_]{1,3})((.|\n)+?)\1/g,
          replacer: (_, tokens, content): string => {
            tokens = tokens.length;
            content = this.inline(content);

            if (tokens > 1) {
              content = this.tag('strong', content);
            }

            if (tokens % 2) {
              content = this.tag('em', content);
            }

            return content;
          }
        },

        // - Underline => `~underline~`
        // - Strikethrough => `~~strike-through~~`
        // - Delete => `~~~delete~~`
        {
          pattern: /(~{1,3})((.|\n)+?)\1/g,
          replacer: (_, tokens, content) => this.tag(['u', 's', 'del'][tokens.length - 1], this.inline(content))
        },

        // - Replace remaining lines with a break tag => `<br />`
        { pattern: / {2}\n|\n {2}/g, replacer: '<br />' }
      ],
      this.inline
    );
  };

  inlineBlock = (text = '', shouldInline = true): string => {
    // A collection of all the tags created so far.
    const gatheredTags: string[] = [];

    function injectInlineBlock(text: string): string {
      return text.replace(/\\(\d+)/g, (_ /* match */, code) => injectInlineBlock(gatheredTags[Number.parseInt(code, 10) - 1]));
    }

    text = text
      .trim()
      // inline code block
      .replace(/`([^`]*)`/g, (_, text) => `\\${gatheredTags.push(this.tag('code', this.encodeHtml(text)))}`)
      // inline media (a / img / iframe)
      .replace(/[!&]?\[([!&]?\[.*?\)|[^\]]*?)]\((.*?)( .*?)?\)|(\w+:\/\/[\w!$'()*+,./-]+)/g, (match, text, href, title, link) => {
        if (link) {
          return shouldInline ? `\\${gatheredTags.push(this.tag('a', link, { href: link }))}` : match;
        }

        if (match[0] === '&') {
          text = text.match(/^(.+),(.+),([^ \]]+)( ?.+?)?$/);
          return `\\${gatheredTags.push(
            this.tag('iframe', '', {
              width: text[1],
              height: text[2],
              frameborder: text[3],
              class: text[4],
              src: href,
              title
            })
          )}`;
        }

        return `\\${gatheredTags.push(match[0] === '!' ? this.tag('img', '', { src: href, alt: text, title }) : this.tag('a', this.inlineBlock(text, false), { href, title }))}`;
      });

    text = injectInlineBlock(shouldInline ? this.inline(text) : text);
    return text;
  };

  block = (text: string): string => {
    return this.processMarkdown(
      text,
      [
        // comments
        { pattern: /<!--((.|\n)*?)-->/g, replacer: '<!--$1-->' },

        // pre format block
        {
          pattern: /^("""|```)(.*)\n((.*\n)*?)\1/gm,
          replacer: (_, wrapper, classNames, text) =>
            wrapper === '"""' ? this.tag('div', this.parse(text), { class: classNames }) : this.tag('pre', this.tag('code', this.encodeHtml(text), { class: classNames }))
        },

        // blockquotes
        {
          pattern: /(^>.*\n?)+/gm,
          replacer: this.chain('blockquote', /^> ?(.*)$/gm, '$1', this.inline)
        },

        // tables
        {
          pattern: /((^|\n)\|.+)+/g,
          replacer: this.chain('table', /^.*(\n\|---.*?)?$/gm, (match, subline) =>
            this.chain('tr', /\|(-?)([^|]+)\1(\|$)?/gm, (_ /* match */, type, text) => this.tag(type || subline ? 'th' : 'td', this.inlineBlock(text)))(
              match.slice(0, match.length - (subline || '').length)
            )
          )
        },

        // lists
        { pattern: /(?:(^|\n)([+-]|\d+\.) +(.*(\n[\t ]+.*)*))+/g, replacer: this.list },

        //anchor
        { pattern: /#\[([^\]]+?)]/g, replacer: '<a name="$1"></a>' },

        // headlines
        {
          pattern: /^(#+) +(.*)$/gm,
          replacer: (_, headerSyntax, headerText) => this.tag(`h${headerSyntax.length}`, this.inlineBlock(headerText))
        },

        // horizontal rule
        { pattern: /^(===+|---+)(?=\s*$)/gm, replacer: '<hr>' }
      ],
      this.parse
    );
  };

  /**
   * Chain string replacement methods and output a function that returns the tag
   * representation of the match.
   */
  chain = (tagName: string, regex: RegExp, replacer: string | StringReplacerFunction, parser?: ParseMatchFunction): ParseMatchFunction => {
    return (match: string) => {
      match = match.replace(regex, replacer as string);
      return this.tag(tagName, parser ? parser(match) : match);
    };
  };

  /**
   * Handle lists in markdown.
   */
  list = (text: string): string => {
    const wrapperTag = text.match(/^[+-]/m) ? 'ul' : 'ol';

    return text
      ? `<${wrapperTag}>${text.replace(
          /(?:[+-]|\d+\.) +(.*)\n?(([\t ].*\n?)*)/g,
          (_, listItemText, childList) =>
            `<li>${this.inlineBlock(`${listItemText}\n${this.removeIndentation(childList || '').replace(/(?:(^|\n)([+-]|\d+\.) +(.*(\n[\t ]+.*)*))+/g, this.list)}`)}</li>`
        )}</${wrapperTag}>`
      : '';
  };

  /**
   * Encode html tags within the markdown output.
   */
  encodeHtml = (text: string): string => {
    return text ? text.replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;') : '';
  };

  removeIndentation = (text: string): string => {
    return text.replace(new RegExp(`^${(text.match(/^\S?\s+/) || '')[0]}`, 'gm'), '');
  };

  /**
   * Create a tag with the content provided.
   */
  tag = (tag: string, text: string, attributes?: Record<string, string>): string => {
    return `<${
      tag +
      (attributes
        ? ` ${Object.keys(attributes)
            .map((k) => (attributes[k] ? `${k}="${this.encodeHtml(attributes[k]) || ''}"` : ''))
            .join(' ')}`
        : '')
    }>${text}</${tag}>`;
  };
}
