export default class RosterParser {
  rosterTxt;
  rosterData = {};

  constructor(rosterTxt) {
    this.rosterTxt = rosterTxt;
    RosterParser._parse(this.rosterTxt);
  }

  static _parse(rosterTxt) {
    let rosterData = {};
    const officeRegExp = /[\n\s\r]+(Principal Office|\w+ Extension Office)/;

    const rawPieces = rosterTxt.split(officeRegExp)
    debugger;

    return rosterData;
  }
}
