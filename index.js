'use strict';
const TaskkitTask = require('taskkit-task');
const fs = require('fs');
const glob = require('glob');
const async = require('async');
const Markdown = require('markdown-it');
const hljs = require('highlight.js');

class DocTask extends TaskkitTask {
  get defaultOptions() {
    return {
      title: 'Docs',
      styles: [],
      scripts: []
    };
  }
  process(input, output, options, allDone) {
    async.autoInject({
      md(done) {
        const md = new Markdown({
          highlight(str, lang) {
            if (lang && hljs.getLanguage(lang)) {
              try {
                return hljs.highlight(lang, str).value;
              } catch (e) {
                this.log(['warning'], e);
              }
            }
            return ''; // use external default escaping
          }
        });
        done(null, md);
      },
      files(done) {
        glob(input, done);
      },
      contents(files, done) {
        async.concat(files, fs.readFile, done);
      },
      html(md, contents, done) {
        const html = contents.map((buffer) => md.render(buffer.toString('utf8')));
        done(null, html.join('\n'));
      },
      out(html, done) {
        const template = `
          <html>
            <title>${options.title}</title>
            ${options.styles.map((style) => `<link ref="stylesheet" href="${style}"/>`)}
            <body>
              ${html}
              ${options.scripts.map((script) => `<script src="${script}"></script>`)}
            </body>
          </html>
          `;
        done(null, template);
      }
    }, (err, results) => {
      if (err) {
        return allDone(err);
      }
      this.write(output, results.out, allDone);
    });
  }
}

module.exports = DocTask;
