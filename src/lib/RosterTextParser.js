export default class RosterTextParser {
  rosterTxt;
  rosterData = {};
  officeSplit = /\s+(Principal Office|\w+ Extension Office)/;
  twoLineOfficeName = /(?<NameLineOne>\S )$\n(?<NameLineTwo>\S+)\n\s+/;

  constructor(rosterTxt) {
    this.rosterTxt = rosterTxt;
    this._parse(this.rosterTxt);
  }

  _parse(rosterTxt) {
    const offices = [];

    const pieces = rosterTxt.split(this.officeSplit);

    let i = 1, officeName, officeType, address1, address2, phone;
    while (i < pieces.length) {
      officeName = pieces[i-1].split("\n").pop();
      officeType = pieces[i];
      [address1, address2, phone] = pieces[i+1].trim().split("\n").slice(0,3);
      offices.push({
        officeName,
        officeType,
        address1,
        address2,
        phone
      });
      i += 2;
    }

    debugger;

    return offices;
  }
}
