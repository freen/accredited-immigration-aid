import debug from 'debug';

export class RosterParser {
  rosterTxt;
  rosterData = {};

  constructor(rosterTxt) {
    this.rosterTxt = rosterTxt;
  }

  static _parse(rosterTxt) {
    appDebug = debug('app');

    rosterData = {};
    officeRegExp = /(Principal Office|[\w+] Extension Office)/;

    const rawPieces = rosterTxt.split(officeRegExp)
    appDebug('test');

    // console.log(rawPieces);

    return rosterData;
  }
}
