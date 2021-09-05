import fs from 'fs';
import pdf from 'pdf-parse';
import RosterParser from './lib/RosterParser';

let dataBuffer = fs.readFileSync('roster.pdf');

pdf(dataBuffer).then((data) => {

  // For inspection
  fs.promises
    .open('roster.txt', 'w+')
    .then((fileHandle) => {
      return fileHandle.write(data.text);
    });

  const rp = new RosterParser(data.text);

});
