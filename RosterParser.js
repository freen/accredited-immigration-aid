export default class RosterParser {
  rosterTxt;
  rosterData = {};
  officeSplit = /[\n\s\r]+(Principal Office|\w+ Extension Office)/;

  constructor(rosterTxt) {
    this.rosterTxt = rosterTxt;
    RosterParser._parse(this.rosterTxt);
  }

  static _parse(rosterTxt) {
    let rosterData = {};

    const rawPieces = rosterTxt.split(this.officeSplit)

    return rosterData;
  }
}
