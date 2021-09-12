export default class RosterHTMLParser {

  static officeMatcher = /\s{2,}(Principal\s+Office|[\S ]+\s+Extension\s+Office)/;

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

  static _parseOfficePgPieces(officePgPiece, officeProps) {
    const matcherOfficeNameLine = /\sOffice$/;
    const matcherPhone = /\(\d{3}\) \d{3}-\d{4}/;
    const trimTwoOrMoreWhitespaces = (str) => (
      str.replace(/\s{2,}/, ' ')
    );

    // Current office object iteration is empty
    if (officeProps.phone == undefined) {
      // Current piece is an address-and-phone block
      if (officePgPiece.match(matcherPhone)) {
        const addressAndPhone = RosterHTMLParser._parseAddressAndPhone(officePgPiece)
        officeProps = Object.assign(officeProps, addressAndPhone);
        return officeProps;
      }
      // Finished processing offices, this must be the org name
      officeProps.orgName = trimTwoOrMoreWhitespaces(officePgPiece);
      return officeProps;
    }
    // Office name signals the end of the office chunk
    if (officePgPiece.match(matcherOfficeNameLine)) {
      officeProps.officeName = trimTwoOrMoreWhitespaces(officePgPiece);
      officeProps.complete = true;
    } else {
      console.warn(`Unexpected case, officePgPiece doesn't match office name: ${officePgPiece}`)
    }
    return officeProps;
  }

  static _parseCompleteOfficePg(pInnerHTML) {
    const officePgPieces = pInnerHTML.split(RosterHTMLParser.officeMatcher);
    const offices = [];
    let officeProps = {};
    const resetOfficeProps = () => {
      officeProps = Object.assign({},  {
        phone: undefined,
        address: [],
        officeName: undefined,
        orgName: undefined,
        complete: false
      });
    };

    resetOfficeProps();

    let officePgPiece, orgName;
    while (officePgPiece = officePgPieces.pop()) {
      officeProps = RosterHTMLParser._parseOfficePgPieces(officePgPiece, officeProps);
      if (officeProps.orgName) {
        orgName = officeProps.orgName;
      }
      if (officeProps.complete) {
        delete officeProps.complete;
        offices.push(Object.assign({}, officeProps));
        resetOfficeProps();
      }
    }

    if (orgName) {
      offices.forEach((v, i) => {
        offices[i].orgName = orgName;
      });
    }

    return offices;
  }

  static parse(pdf2HtmlOutput) {
    const offices = [];

    const rosterDOM = document.createElement('html');
    rosterDOM.body.innerHtml = RosterHTMLParser._sanitizeRosterHTML(pdf2HtmlOutput);

    const currentState = 'ALABAMA';

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
