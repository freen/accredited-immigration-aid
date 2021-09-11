import RosterHTMLParser from './RosterHTMLParser';

test('strips pdf2html pagebreaks', () => {
  const fixtureRosterHTML = `
<p>10/29/08 12/11/26 Active
</p>
<p>Community Help Center Muslim Women Resource Center
 
Principal Office
</p>
<p>05/28/13 12/20/25 Active</p>
<p/>
</div>
<div class="page"><p/>
<p>6445 N. Western Avenue, Suite 301
Chicago, IL 60604
(773) 764-1686
</p>
<p>Easy Solution Consultants, Inc. (ESC, Inc)
 
Principal Office
4554 N. Broadway Street
Suite # 223
Chicago, IL 60640
(773) 769-2380
</p>
`;
  const expectedResult = `
<p>10/29/08 12/11/26 Active
</p>
<p>Community Help Center Muslim Women Resource Center
 
Principal Office
</p>
<p>05/28/13 12/20/25 Active</p>

<p>6445 N. Western Avenue, Suite 301
Chicago, IL 60604
(773) 764-1686
</p>
<p>Easy Solution Consultants, Inc. (ESC, Inc)
 
Principal Office
4554 N. Broadway Street
Suite # 223
Chicago, IL 60640
(773) 769-2380
</p>
`;

  expect(RosterHTMLParser._stripPageBreaks(fixtureRosterHTML))
    .toBe(expectedResult);
});

// Below, demarcating trailing spaces with [ ] since editor is configurd to delete them

/**
 * Exhibit A - a single <p> containing name and 2 offices
 */

// <p>03/30/82 06/18/25 Active
// </p>
// <p>Elmbrook Church/James Place Immigration Services
// [ ]
// South Howell Avenue-Milwaukee Extension Office
// 4204 S Howell Avenue
// Milwaukee, WI 53207
// (414) 269-9952
// [ ]
// West Harrison Avenue-Milwaukee Extension Office
// 807 S. 14th Street[ ]
// Suite 200[ ]
// Milwaukee, WI 53204
// (414) 269-9952
// </p>
// <p>10/11/12 09/29/23 Active
// </p>

/**
 * Exhibit B - a single <p> containing name and 1 offices
 */

// <p>Menasha
// </p>
// <p>Catholic Charities of the Diocese of Green Bay
// [ ]
// Menasha Extension Office[ ]
// 1475 Opportunity Way
// Menasha, WI 54952
// (920) 734-2601
// </p>
// <p>02/23/00 06/28/25 Active
// </p>

/**
 * Exhibit C - The delimiter for the PDF's "shift" from Orgs to Representatives data set
 */

// <p>[ ]
// Recognized[ ]
// Organization
// </p>
// <p>Accredited[ ]
// Representative
// </p>
// <p>Accreditation[ ]
// Expiration Date
// </p>
// <p>Representative[ ]
// Status
// </p>

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

// Steps
// 1. Identify the <p> is an office b/c inner text contains word "Office"
// 2. Everything that precedes the line containing "Office" (use regexp splitter from txt parser) is the org name (trimmed for line breaks)
// 3. Everything that follows ~~~ is the $addressAndPhoneNumber
// 4. If the $addressAndPhoneNumber contains less than 3 non-empty lines..
// 5. Parse next <p> and grab Active information (throw exception if doesn't match, for inspection)
// 6. Parse subsequent <p> and concatenate with the inner text of the initial <p>
// 7. Re-run Office parsing procedure, recurse to (1)

/**
 * Exhibit E - An Org with an Office, whose name spans 2 lines
 */

// <p>Wesley Chapel
// </p>
// <p>Immigrant Connection at Florida District of the Wesleyan[ ]
// Church
// [ ]
// Principal Office
// 3807 Maryweather Lane
// Wesley Chapel, FL 33544
// (813) 907-5511
// </p>
// <p>10/27/17 05/29/26 Active
// </p>

/**
 * Exhibit F - An Org with an Office, whose name spans 2 lines and is split by a pagebreak
 */

// <p>Decatur
// </p>
// <p>Innovation Law Lab
// [ ]
// </p>
// <p>09/07/18 07/05/27 Active</p>
// <p/>
// </div>
// <div class="page"><p/>
// <p>Decatur Extention Office
// 701 W Howard Ave
// Decatur, GA 30030
// (503) 922-3042
// </p>
// <p>Inspiritus, Inc.
// [ ]
// Principal Office
// 143 New Street
// Decatur, GA 30303
// (678) 852-8523
// </p>
