import { describe, expect, it } from 'vitest';
import showdown, { ShowdownExtension } from 'showdown';

// Header translation extension
const markdownHeaderPattern = /^(#{1,6})[\s\t]*(.+?)\s*(\{:\s*#([\S\s]+?)\}[\s\t]*#*){0,1}$/gim;
const headerTranslationExtension: ShowdownExtension = {
  type: 'listener',
  listeners: {
    'headers.before': (_event, text, _converter, options, globals): string => {
      text = text.replace(markdownHeaderPattern, (_match0, headingLevel, headingText, _matchId, headingId) => {
        // The number of heading levels will be used in the class for the HTML element
        headingLevel = headingLevel.length;

        // Pass headers through spanGamut sub parser (markdown thing) in case heading text
        // aso has further makrdown within the text
        headingText = showdown.subParser('spanGamut')(headingText, options, globals);

        const idAttribute = !!headingId ? ` id="${headingId.trim()}"` : '';

        // We switch headings to paras so that document structure is not affected by content
        // that is we don't want help text to have a H1 tag in the middle of a H3 section in a page
        // This is for screen readers so that don't see markdown generated text as a new structure within the page
        const header = '<p class="content h' + headingLevel + `"${idAttribute}>` + headingText + '</p>';

        // This sub parser hash blocks the content so that further parsers with not try
        // and convert the text we generated
        return showdown.subParser('hashBlock')(header, options, globals);
      });

      // return the changed text
      return text;
    }
  }
};

// Table translation extension
// Header translation extension
const markdownTablePattern = /(style="text-align:(\w+);")/gim;
const tableTranslationExtension: ShowdownExtension = {
  type: 'listener',
  listeners: {
    'tables.after': (_event, text): string => {
      // Change text like 'style="text-align:left;"' to 'class="content table-col-left"'
      text = text.replace(markdownTablePattern, (s) => {
        // Match for style pattern (we want a new instance so that we do 'fresh' match here)
        const match = new RegExp(markdownTablePattern.source, markdownTablePattern.flags).exec(s);

        // No match then do nothing
        if (!match) {
          return s;
        }

        // Swap style to class
        return `class="content table-col-${match[2]}"`;
      });

      // return the changed text
      return text;
    }
  }
};

describe('table tests', () => {
  it('simple table', () => {
    showdown.extension('table-translation', tableTranslationExtension);
    const converter = new showdown.Converter({ extensions: ['table-translation'] });

    const markdown = '| h1    |    h2   |      h3 |\n' + '|:------|:-------:|--------:|\n' + '| 100   | [a][1]  | ![b][2] |\n' + '| *foo* | **bar** | ~~baz~~ |';
    converter.setOption('tables', true);
    const html = converter.makeHtml(markdown);

    expect(html).toBe(
      '<table>\n<thead>\n<tr>\n<th class="content table-col-left">h1</th>\n<th class="content table-col-center">h2</th>\n<th class="content table-col-right">h3</th>\n</tr>\n</thead>\n<tbody>\n<tr>\n<td class="content table-col-left">100</td>\n<td class="content table-col-center">[a][1]</td>\n<td class="content table-col-right">![b][2]</td>\n</tr>\n<tr>\n<td class="content table-col-left"><em>foo</em></td>\n<td class="content table-col-center"><strong>bar</strong></td>\n<td class="content table-col-right">~~baz~~</td>\n</tr>\n</tbody>\n</table>'
    );
  });
});

describe('table tests', () => {
  it('h1', () => {
    showdown.extension('header-translation', headerTranslationExtension);
    const converter = new showdown.Converter({ extensions: ['header-translation'] });

    let markdown = '# H1 text goes here & some other stuff too {: #header-id }';
    let html = converter.makeHtml(markdown);
    expect(html).toBe('<p class="content h1" id="header-id">H1 text goes here &amp; some other stuff too</p>');

    markdown = '# H1 text goes here & some other stuff too';
    html = converter.makeHtml(markdown);
    expect(html).toBe('<p class="content h1">H1 text goes here &amp; some other stuff too</p>');

    markdown = '## H2 text goes here & some other stuff too {: #header-id }';
    html = converter.makeHtml(markdown);
    expect(html).toBe('<p class="content h2" id="header-id">H2 text goes here &amp; some other stuff too</p>');

    markdown = '### H3 text goes here & some other stuff too';
    html = converter.makeHtml(markdown);
    expect(html).toBe('<p class="content h3">H3 text goes here &amp; some other stuff too</p>');
  });
});
