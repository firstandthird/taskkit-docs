'use strict';

const DocTask = require('../');

const doc = new DocTask('docs', {
  title: 'some title here',
  files: {
    'test/out.html': 'test/fixtures/*.md'
  }
});

doc.execute((err) => {
  if (err) {
    throw err;
  }
});
