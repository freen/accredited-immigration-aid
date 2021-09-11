import fs from 'fs';
// import pdf from 'pdf-parse';
import RosterParser from './lib/RosterParser';
import pdf2html from 'pdf2html';

// let dataBuffer = fs.readFileSync('roster.pdf');

// pdf(dataBuffer).then((data) => {

//   // For inspection
//   fs.promises
//     .open('roster.txt', 'w+')
//     .then((fileHandle) => {
//       return fileHandle.write(data.text);
//     });

//   const rp = new RosterParser(data.text);

// });

pdf2html.html('roster.pdf', (err, html) => {
  if (err) {
    console.error('Conversion error: ' + err)
  } else {
    fs.promises
      .open('roster.html', 'w+')
      .then((fileHandle) => {
        return fileHandle.write(html);
      });
  }
});
