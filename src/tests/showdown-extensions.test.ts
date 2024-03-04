import { describe, expect, it } from 'vitest';
import showdown, { ShowdownExtension } from 'showdown';

// Header translation extension
const headerMarkdownPattern = /^(#{1,6})[\s\t]*(.+?)\s*(\{:\s*#([\S\s]+?)\}[\s\t]*#*){0,1}$/gim;
const headerTranslationExtension: ShowdownExtension = {
  type: 'listener',
  listeners: {
    'headers.before': (_event, text, _converter, options, globals): string => {
      text = text.replace(headerMarkdownPattern, (_wholeMatch, headingLevel, headingText, _matchId, headingId) => {
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

      // Return the changed text
      return text;
    }
  }
};

// Link translation extension
const linkMarkdownPattern = /\[((?:\[[^\]]*]|[^\[\]])*)]\([ \t]*<?(.*?(?:\(.*?\).*?)?)>?[ \t]*((['"])(.*?)\4[ \t]*)?\)\{\:target=(["'])(.*)\6}/g;
const linkTranslationExtension = [
  {
    type: 'lang',
    regex: linkMarkdownPattern,
    replace: (_wholeMatch: string, linkText: string, url: string, _group3: string, _group4: string, title: string, _group6: string, target: string): string => {
      let anchorTag = `<a href="${url}"`;

      if (typeof title != 'undefined' && title !== '' && title !== null) {
        title = title.replace(/"/g, '&quot;');
        title = showdown.helper.escapeCharacters(title, '*_', false);
        anchorTag += ' title="' + title + '"';
      }

      if (typeof target != 'undefined' && target !== '' && target !== null) {
        anchorTag += ' target="' + target + '"';
      }

      anchorTag += '>' + linkText + '</a>';
      return anchorTag;
    }
  }
];

// Table translation extension
const tableMarkdownPattern = /(style="text-align:(\w+);")/gim;
const tableTranslationExtension: ShowdownExtension = {
  type: 'listener',
  listeners: {
    'tables.after': (_event, text): string => {
      // Change text like 'style="text-align:left;"' to 'class="content table-col-left"'
      text = text.replace(tableMarkdownPattern, (s) => {
        // Match for style pattern (we want a new instance so that we do 'fresh' match here)
        const match = new RegExp(tableMarkdownPattern.source, tableMarkdownPattern.flags).exec(s);

        // No match then do nothing
        if (!match) {
          return s;
        }

        // Swap style to class
        return `class="content table-col-${match[2]}"`;
      });

      // Return the changed text
      return text;
    }
  }
};

// Script tag translation extension
const scriptTagPattern = /(\<|\u003c|&#60;)([//]{0,1}script)(\>|\u003e|&#62;){0,1}/gim;
const scriptTagTranslationExtension: ShowdownExtension = {
  type: 'listener',
  listeners: {
    'hashHTMLBlocks.before': (_event, text): string => {
      // Change text like '<script>' to '&lt;script&gt;'
      text = text.replace(scriptTagPattern, (s) => {
        // Match script pattern
        const match = new RegExp(scriptTagPattern.source, scriptTagPattern.flags).exec(s);

        // No match then do nothing
        if (!match) {
          return s;
        }

        // Swap to escaped version
        return `&lt;${match[2]}&gt;`;
      });

      // Return the changed text
      return text;
    }
  }
};

describe('script tag tests', () => {
  it('plain tag', () => {
    showdown.extension('script-tag-translation', scriptTagTranslationExtension);
    const converter = new showdown.Converter({ extensions: ['script-tag-translation'] });

    const markdown = '<script>alert("gotcha!");</script>';
    const html = converter.makeHtml(markdown);

    expect(html).toBe('<p>&lt;script&gt;alert("gotcha!");&lt;/script&gt;</p>');
  });
});

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

describe('header tests', () => {
  it('h1', () => {
    showdown.extension('header-translation', headerTranslationExtension);
    let converter = new showdown.Converter({ extensions: ['header-translation'] });

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

    // Test disable auto generation of links
    converter = new showdown.Converter();

    markdown = '# H1';
    html = converter.makeHtml(markdown);
    expect(html).toBe('<h1 id="h1">H1</h1>');

    converter.setOption('noHeaderId', true);

    markdown = '# H1';
    html = converter.makeHtml(markdown);
    expect(html).toBe('<h1>H1</h1>');
  });
});

describe('all tests', () => {
  it('h1', () => {
    showdown.extension('header-translation', headerTranslationExtension);
    showdown.extension('table-translation', tableTranslationExtension);
    showdown.extension('script-tag-translation', scriptTagTranslationExtension);
    showdown.extension('link-translation', linkTranslationExtension);

    const converter = new showdown.Converter({ extensions: ['header-translation', 'table-translation', 'script-tag-translation', 'link-translation'] });
    converter.setOption('tables', true);

    const markdown = `
# H1 text goes here & some other stuff too {: #header-id }

## H2 text with no id

| h1    |    h2   |      h3 |
|:------|:-------:|--------:|
| 100   | [a][1]  | ![b][2] |
| *foo* | **bar** | ~~baz~~ |

1. Ordered list item 1
1. Ordered list item 2
1. Ordered list item 3

* Unordered list item 1
* Unordered list item 2
* Unordered list item 3

<code>This is the code</code>

<script>alert('sucker!');</script>

This is a normal para!

[Link](https://nowhere1.com.ex){:target="_blank"}
[Link](https://nowhere2.com)

[Link](https://nowhere3.com.ex "This is the title"){:target="_blank"}
[Link](https://nowhere4.com "This is the title")

`;

    const html = converter.makeHtml(markdown).replace('\n', '');

    // Match some expected outcomes

    expect(/<a href="https:\/\/nowhere1\.com\.ex" target="_blank">/.exec(html)).not.toBeNull();
    expect(/<a href="https:\/\/nowhere2\.com">/.exec(html)).not.toBeNull();
    expect(/<a href="https:\/\/nowhere3\.com\.ex" title="This is the title" target="_blank">/.exec(html)).not.toBeNull();
    expect(/<a href="https:\/\/nowhere4\.com" title="This is the title">/.exec(html)).not.toBeNull();
  });
});
