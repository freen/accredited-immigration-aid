import { JSDOM } from 'jsdom';
import chunks from 'array.chunk';

export default class RosterHTMLParser {
  static testNonEmptyString = (v) => (typeof v === 'string' && v.trim().length > 0);
  static officePropValidators = {
    phone: (v) => (RosterHTMLParser.matcherPhone.test(v)),
    address: (v) => {
      if (!Array.isArray(v)) {
        return false;
      }
      const copyWithoutEmptyLines = v.filter(RosterHTMLParser.testNonEmptyString);

      return copyWithoutEmptyLines.length == v.length;
    },
    officeName: RosterHTMLParser.testNonEmptyString,
    orgName: RosterHTMLParser.testNonEmptyString
  };

  static matcherOffice = /\s{2,}(Principal\s+Office|[\S ]+\s+Extension\s+Office)/;
  static matcherActivePeriod = /(\d{2}\/\d{2}\/\d{2} ){2}Active/;
  static matcherPhone = /\(\d{3}\) \d{3}-\d{4}/;

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
    return RosterHTMLParser.matcherActivePeriod.test(pInnerHTML);
  }

  static _isOfficePg(pInnerHTML) {
    return RosterHTMLParser.matcherOffice.test(pInnerHTML);
  }

  // // Where `offices` matches the return value of `_parseCompleteOfficePg`
  // static _isOfficePgComplete(offices) {
  //   let errors = [];
  //   const validators = RosterHTMLParser.officePropValidators;

  //   offices.forEach((office, i) => {
  //     for (const key of Object.keys(validators)) {
  //       if (office.hasOwnProperty(key)) {
  //         if (!validators[key](office[key])) {
  //           errors[i] ??= {};
  //           errors[i][key] = office[key];
  //         }
  //       } else {
  //         errors[i][key] = '<undefined>';
  //       }
  //     }
  //   })

  //   return errors.length ? errors : true;
  // }

  // // Where `office` matches the return value of one element of `_parseCompleteOfficePg`
  // static _isOfficeComplete(office) {
  //   let errors = {};
  //   const validators = RosterHTMLParser.officePropValidators;

  //   for (const key of Object.keys(validators)) {
  //     if (office.hasOwnProperty(key)) {
  //       if (!validators[key](office[key])) {
  //         errors[key] = office[key];
  //       }
  //     } else {
  //       errors[key] = '<undefined>';
  //     }
  //   }

  //   return Object.keys(errors).length ? errors : true;
  // }

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
      if (officePgPiece.match(RosterHTMLParser.matcherPhone)) {
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
    const officePgPieces = pInnerHTML.split(RosterHTMLParser.matcherOffice);
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

    debugger;

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

    return RosterHTMLParser.matcherPhone.test(lastLine);
  }

  static _parseStateSequence(stateHtml) {
    const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
    const body = dom.window.document.querySelector('body');
    const offices = {};

    let currentCity = '',
      parsedOffices = [],
      i = body.childElementCount - 1,
      hasOrgName = false,
      parsedOffice, p, pgHTML = '';

    while (i >= 0) {
      p = body.children[i];
      pgHTML = p.innerHTML;

      if (currentCity != '') {
        offices[currentCity] ??= [];
      }

      if (RosterHTMLParser._lastLineIsPhoneNumber(pgHTML)) {
        // TODO: break this block into separate method

        while (true) {
          parsedOffices = RosterHTMLParser._parseCompleteOfficePg(pgHTML);

          // If orgName is present (whether 1 or more offices,) we have all our info
          // b/c the orgName comes last
          hasOrgName = parsedOffices.some((v) => v?.orgName !== undefined);

          if (hasOrgName || i == 0) {
            offices[currentCity] = offices[currentCity].concat(parsedOffices);

            if(i == 0) { // This shouldn't happen
              console.warn("Hit i = 0 without hasOrgName");
            }

            break;
          }

          i--;
          p = body.children[i];
          pgHTML = `${p.innerHTML}\n${pgHTML}`;
        }

      } else if (RosterHTMLParser._pgHasActivePeriod(pgHTML)) {
        // do nothing, for now
      } else if (pgHTML.trim() == "Return to the top of the page") {
        // do nothing
      } else { // It's a city name
        currentCity = pgHTML.trim();
      }

      i--;
    }

    return offices;
  }

  static parse(pdf2HtmlOutput) {
    pdf2HtmlOutput = RosterHTMLParser._sanitizeRosterHTML(pdf2HtmlOutput);
    const states = RosterHTMLParser._splitStates(pdf2HtmlOutput);

    for (const key of Object.keys(states)) {
      debugger;
      states[key] = RosterHTMLParser._parseStateSequence(states[key]);
    }

    return states;
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
