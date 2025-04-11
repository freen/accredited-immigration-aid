import { JSDOM } from 'jsdom';
import chunks from 'array.chunk';

const CURRENT_CITY_PENDING = 'CURRENT_CITY_PENDING';

const matcherOffice = /\s{2,}(Principal\s+Office|[\S ]+\s+Extension\s+Office)/;
const matcherActivePeriod = /(\d{2}\/\d{2}\/\d{2} ){2}Active/;
const matcherPhone = /\(\d{3}\) \d{3}-\d{4}/;

export default class RosterHTMLParser {

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
    const matcherTransitionToOrgs = /Wisconsin\s+?\|\s+?Wyoming\s+?\|\s+?\<\/p\>\s+?\<p\>\s+?\<\/p\>/;
    const matcherTransitionToReps = /<p>(\s+)?Recognized(\s+)?Organization(\s+)?<\/p>(\s+)?<p>(\s+)?Accredited(\s+)?Representative(\s+)?<\/p>(\s+)?<p>Accreditation(\s+)?Expiration(\s+)?Date(\s+)?<\/p>(\s+)?<p>Representative(\s+)?Status(\s+)?<\/p>/;

    return pInnerHTML
      .split(matcherTransitionToOrgs)
      .pop() // Remove lower section
      .split(matcherTransitionToReps)
      .shift(); // Remove upper section
  }

  static _pgHasActivePeriod(pInnerHTML) {
    return matcherActivePeriod.test(pInnerHTML);
  }

  static _isOfficePg(pInnerHTML) {
    return matcherOffice.test(pInnerHTML);
  }

  static _parseAddressAndPhone(addressAndPhone) {
    const pieces = addressAndPhone
      .split("\n")
      .map((x) => x.trim())
      .filter((x) => x != '');
    const phone = pieces.pop();
    const address = pieces;

    return {
      address,
      phone
    };
  }

  static _parseOfficePgPieces(officePgPiece, officeProps) {
    const matcherOfficeNameLine = /\sOffice$/;
    const trimTwoOrMoreWhitespaces = (str) => (str.replace(/\s{2,}/, ' '));

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
    const officePgPieces = pInnerHTML.split(matcherOffice);
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

  static _splitStates(partialPdf2HtmlOutput) {
    const states = {};
    const matcherStateTransition = /<p>(?<State>[\w\s]+)Recognized(?:\s+)?Organization(?:\s+)?<\/p>(?:\s+)?<p>(?:\s+)?Date(?:\s+)?Recognized(?:\s+)?<\/p>(?:\s+)?<p>Recognition(?:\s+)?Expiration(?:\s+)?Date(?:\s+)?<\/p>(?:\s+)?<p>Organization(?:\s+)?Status(?:\s+)?<\/p>/;
    let pieces =  partialPdf2HtmlOutput
      .trim()
      .split(matcherStateTransition)
      .map((x) => x.trim())
      .filter((x) => x != '');

    pieces = chunks(pieces, 2);
    let state, html;

    for (const piece of pieces) {
      [state, html] = piece;
      states[state] = html;
    }

    return states;
  }

  static _lastLineIsPhoneNumber(pgHTML) {
    const lastLine = pgHTML
      .split("\n")
      .map((x) => x.trim())
      .filter((x) => x != '')
      .pop();

    return matcherPhone.test(lastLine);
  }

  // If orgName is present (whether 1 or more offices,) we have all our info
  // b/c the orgName comes last when parsing in reverse
  static _officesFullyParsed(parsedOffices) {
    return parsedOffices.some((v) => v?.orgName !== undefined);
  }

  static _skipPg(pgHTML) {
    return RosterHTMLParser._pgHasActivePeriod(pgHTML) ||
      pgHTML.trim() == "Return to the top of the page";
  }

  static _parseStateSequence(stateHtml) {
    const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
    const body = dom.window.document.querySelector('body');
    const offices = {};

    body.innerHTML = stateHtml;

    let currentCity = CURRENT_CITY_PENDING,
      parsedOffices = [],
      i = body.childElementCount - 1,
      hasOrgName = false,
      parsedOffice, p, newCity, pgHTML = '';

    while (i >= 0) {
      p = body.children[i];
      pgHTML = p.innerHTML;
      offices[currentCity] ??= [];

      if (RosterHTMLParser._lastLineIsPhoneNumber(pgHTML)) {

        while (true) {
          parsedOffices = RosterHTMLParser._parseCompleteOfficePg(pgHTML);

          if (RosterHTMLParser._officesFullyParsed(parsedOffices) || i == 0) {
            offices[currentCity] = offices[currentCity].concat(parsedOffices);

            if(i == 0) { // This shouldn't happen
              console.warn("Hit i = 0 without hasOrgName");
            }

            break;
          }

          while (true) {
            i--;
            p = body.children[i];

            if (!RosterHTMLParser._skipPg(p.innerHTML)) {
              break;
            }
          }

          pgHTML = `${p.innerHTML}\n${pgHTML}`;
        }

      } else if (RosterHTMLParser._skipPg(pgHTML)) {
        // do nothing
      } else { // It's a city name
        newCity = pgHTML.trim();

        if (currentCity == CURRENT_CITY_PENDING) {
          offices[newCity] = offices[currentCity];
          delete offices[currentCity];
        }

        currentCity = newCity;
      }

      i--;
    }

    return offices;
  }

  static parse(pdf2HtmlOutput) {
    pdf2HtmlOutput = RosterHTMLParser._sanitizeRosterHTML(pdf2HtmlOutput);
    const states = RosterHTMLParser._splitStates(pdf2HtmlOutput);

    for (const key of Object.keys(states)) {
      states[key] = RosterHTMLParser._parseStateSequence(states[key]);
    }

    return states;
  }
}

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
