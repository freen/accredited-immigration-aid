export default class RosterHTMLParser {
  rosterDOM;
  rosterData = {};

  static officeMatcher = /\s{2,}(Principal\s+Office|[\S ]+\s+Extension\s+Office)/;

  constructor(rawRosterHTML) {
    this.rosterDOM = document.createElement('html');
    this.rosterDOM.innerHhtml = RosterHTMLParser._sanitizeRosterHTML(rawRosterHTML);
  }

  static _sanitizeRosterHTML(rosterHTML) {
    rosterHTML = RosterHTMLParser._chopIrrelevantSections(rosterHTML);
    rosterHTML = RosterHTMLParser._stripPageBreaks(rosterHTML);

    return rosterHTML;
  }

  static _stripPageBreaks(rosterHTML) {
    const initialPageBreak = '<div class="page"><p/>';
    const pageBreak = "<p/>\n</div>\n<div class=\"page\"><p/>";
    const lastClosingPageBreak = "</div>\n</body>";
    // Order is significant, in the following
    const replacePairs = [
      [pageBreak, ''],
      [initialPageBreak, ''],
      [lastClosingPageBreak, '</body>'],
    ];
    let toFind, toReplace;

    for (const replacePair of replacePairs) {
      [toFind, toReplace] = replacePair;
      rosterHTML = rosterHTML.replace(toFind, toReplace);
    }

    return rosterHTML;
  }

  static _chopIrrelevantSections(pInnerHTML) {
    const transitionToOrgs = /<p>Organization\s+Status\s+<\/p>/;
    const transitionToReps = /<p>(\s+)?Recognized(\s+)?Organization(\s+)?<\/p>(\s+)?<p>(\s+)?Accredited(\s+)?Representative(\s+)?<\/p>(\s+)?<p>Accreditation(\s+)?Expiration(\s+)?Date(\s+)?<\/p>(\s+)?<p>Representative(\s+)?Status(\s+)?<\/p>/;

    return pInnerHTML.split(transitionToOrgs)
      .pop()
      .split(transitionToReps)
      .shift();
  }

  static _isOfficePg(pInnerHTML) {

  }

  static _isOfficePgInfoComplete(pInnerHTML) {

  }

  static _parseAddressAndPhone(addressAndPhone) {
    const pieces = addressAndPhone.split("\n");
    const phone = pieces.pop();
    const address = pieces.map((x) => x.trim()).filter((x) => x != '');

    return {
      address,
      phone
    }
  }

  // Steps
  // 1. Identify the <p> is an office b/c inner text contains word "Office"
  // 2. Everything that precedes the first line containing "Office" (use regexp splitter from txt parser) is the org name (trimmed for line breaks)
  // 3. Everything that follows ~~~ is the $addressAndPhoneNumber
  // 4. If the $addressAndPhoneNumber contains less than 3 non-empty lines..
  // 5. Parse next <p> and grab Active information (throw exception if doesn't match, for inspection)
  // 6. Parse subsequent <p> and concatenate with the inner text of the initial <p>
  // 7. Re-run Office parsing procedure, recurse to (1)
  // Assumes pInnerHTML is complete and unsegmented
  static _parseCompleteOfficePg(pInnerHTML) {
    const matcherOfficeNameLine = /\sOffice$/;
    const matcherPhone = /\(\d{3}\) \d{3}-\d{4}/;
    const pieces = pInnerHTML.split(RosterHTMLParser.officeMatcher);
    const offices = [];
    let thisOffice = {};
    const resetThisOffice = () => {
      thisOffice = Object.assign({},  {
        phone: undefined,
        address: [],
        officeName: undefined,
        orgName: undefined
      });
    };
    const trimTwoOrMoreWhitespaces = (str) => (
      str.replace(/\s{2,}/, ' ')
    );

    resetThisOffice();

    let piece, orgName;
    while (piece = pieces.pop()) {
      // Current office object iteration is empty
      if (thisOffice.phone == undefined) {
        // Current piece is an address-and-phone block
        if (piece.match(matcherPhone)) {
          thisOffice = Object.assign(thisOffice, RosterHTMLParser._parseAddressAndPhone(piece));
          continue;
        }
        // Finished processing offices, this must be the org name
        orgName = trimTwoOrMoreWhitespaces(piece);
        continue;
      }
      // Office name signals the end of the office chunk
      if (piece.match(matcherOfficeNameLine)) {
        thisOffice.officeName = trimTwoOrMoreWhitespaces(piece);
        offices.push(Object.assign({}, thisOffice));
        resetThisOffice();
        continue;
      } else {
        console.warn(`Unexpected case, piece doesn't match office name: ${piece}`)
      }
    }

    if (orgName) {
      offices.forEach((v, i) => {
        offices[i].orgName = orgName;
      });
    }

    return offices;
  }

  parse() {
    const offices = [];
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

/**
 * Exhibit D - An Org with 1 Office, whose address is split by a page-break
 */

// <p>02/14/00 12/14/24 Active
// </p>
// <p>Redlands Christian Migrant Association, Inc.
// [ ]
// RCMA - Wimauma Extension Office
// 14710 S Charlie Circle
// </p>
// <p>10/20/15 10/26/26 Active</p>
// <p/>
// </div>
// <div class="page"><p/>
// <p>Wimauma, FL 33598
// (813) 634-1723
// </p>
// <p>Return to the top of the page
// </p>
// <p>GEORGIA
// Recognized[ ]
// Organization
// </p>

// Theoretically, post strip page breaks op:

// <p>02/14/00 12/14/24 Active
// </p>
// <p>Redlands Christian Migrant Association, Inc.
// [ ]
// RCMA - Wimauma Extension Office
// 14710 S Charlie Circle
// </p>
// <p>10/20/15 10/26/26 Active</p>
// <p>Wimauma, FL 33598
// (813) 634-1723
// </p>
// <p>Return to the top of the page
// </p>
// <p>GEORGIA
// Recognized[ ]
// Organization
// </p>
