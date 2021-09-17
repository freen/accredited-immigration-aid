import fs from 'fs';
import RosterHTMLParser from './lib/RosterHTMLParser';
import pdf2html from 'pdf2html';

pdf2html.html('roster.pdf', (err, html) => {
  if (err) {
    console.error('Conversion error: ' + err)
  } else {
    fs.promises
      .open('roster.html', 'w+')
      .then((fileHandle) => {
        return fileHandle.write(html);
      });

    const offices = RosterHTMLParser.parse(html);

    fs.promises
      .open('roster.json', 'w+')
      .then((fileHandle) => {
        return fileHandle.write(JSON.stringify(offices));
      });
  }
});
