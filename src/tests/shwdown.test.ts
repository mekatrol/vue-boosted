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

describe('table tests', () => {
  it('simple table', () => {
    const markdown = '| h1    |    h2   |      h3 |\n' + '|:------|:-------:|--------:|\n' + '| 100   | [a][1]  | ![b][2] |\n' + '| *foo* | **bar** | ~~baz~~ |';

    const converter = new showdown.Converter();
    converter.setOption('tables', true);
    const html = converter.makeHtml(markdown);

    expect(html).toBe(
      '<table>\n<thead>\n<tr>\n<th style="text-align:left;">h1</th>\n<th style="text-align:center;">h2</th>\n<th style="text-align:right;">h3</th>\n</tr>\n</thead>\n<tbody>\n<tr>\n<td style="text-align:left;">100</td>\n<td style="text-align:center;">[a][1]</td>\n<td style="text-align:right;">![b][2]</td>\n</tr>\n<tr>\n<td style="text-align:left;"><em>foo</em></td>\n<td style="text-align:center;"><strong>bar</strong></td>\n<td style="text-align:right;">~~baz~~</td>\n</tr>\n</tbody>\n</table>'
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
