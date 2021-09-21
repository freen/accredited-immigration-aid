/**
 * @jest-environment ./tests/custom-test-env
 */

import RosterHTMLParser from './RosterHTMLParser';

describe('RosterHTMLParser._parseCompleteOfficePg', () => {
  test('parses two line office name', () => {
    const fixturePgInnerHtml = `Centro La Familia Advocacy Services, Inc.
 
Highway City Neighborhood Resource Center Extension 
Office 
4718 N. Polk Avenue
Fresno, CA 93722
(559) 369-6349`;

    expect(RosterHTMLParser._parseCompleteOfficePg(fixturePgInnerHtml))
      .toEqual([{
              'orgName': 'Centro La Familia Advocacy Services, Inc.',
              'officeName': 'Highway City Neighborhood Resource Center Extension Office',
              'address': [
                '4718 N. Polk Avenue',
                'Fresno, CA 93722'
              ],
              'phone': '(559) 369-6349'
            }]);
  });

  test('parses three line address', () => {
    const fixturePgInnerHtml = `Immigrant Hope - Wyoming Idaho
 
Big Piney Extension Office
Iglesia Cristiana of Big Piney
340 Smith Ave.
Big Piney, WY 83113
(208) 709-0131`;

    expect(RosterHTMLParser._parseCompleteOfficePg(fixturePgInnerHtml))
      .toEqual([{
              'orgName': 'Immigrant Hope - Wyoming Idaho',
              'officeName': 'Big Piney Extension Office',
              'address': [
                'Iglesia Cristiana of Big Piney',
                '340 Smith Ave.',
                'Big Piney, WY 83113'
              ],
              'phone': '(208) 709-0131'
            }]);
  });

  test('parses two line organization name', () => {
    const fixturePgInnerHtml = `Wyoming Coalition Against Domestic Violence and Sexual 
Assault (WCADVSA)
 
Principal Office
710 E. Garfield Street, Suite 218
Laramie, WY 82070
(307) 755-5481`;

    expect(RosterHTMLParser._parseCompleteOfficePg(fixturePgInnerHtml))
      .toEqual([{
              'orgName': 'Wyoming Coalition Against Domestic Violence and Sexual Assault (WCADVSA)',
              'officeName': 'Principal Office',
              'address': [
                '710 E. Garfield Street, Suite 218',
                'Laramie, WY 82070'
              ],
              'phone': '(307) 755-5481'
            }]);
  });

  test('parses org name and two offices', () => {
    const fixturePgInnerHtml = `Elmbrook Church/James Place Immigration Services
 
South Howell Avenue-Milwaukee Extension Office
4204 S Howell Avenue
Milwaukee, WI 53207
(414) 269-9952
 
West Harrison Avenue-Milwaukee Extension Office
807 S. 14th Street 
Suite 200 
Milwaukee, WI 53204
(414) 269-9952`;

    expect(RosterHTMLParser._parseCompleteOfficePg(fixturePgInnerHtml))
      .toEqual([
                {
                  'orgName': 'Elmbrook Church/James Place Immigration Services',
                  'officeName': 'West Harrison Avenue-Milwaukee Extension Office',
                  'address': [
                    '807 S. 14th Street',
                    'Suite 200',
                    'Milwaukee, WI 53204'
                  ],
                  'phone': '(414) 269-9952'
                },
                {
                  'orgName': 'Elmbrook Church/James Place Immigration Services',
                  'officeName': 'South Howell Avenue-Milwaukee Extension Office',
                  'address': [
                    '4204 S Howell Avenue',
                    'Milwaukee, WI 53207'
                  ],
                  'phone': '(414) 269-9952'
                }
            ]);
  });
});

describe('RosterHTMLParser._pgHasActivePeriod', () => {
  test('returns true for pInnerHTML that contains active period', () => {
    const fixturePgInnerHtml = "07/18/12 01/26/27 Active\n";

    expect(RosterHTMLParser._pgHasActivePeriod(fixturePgInnerHtml)).toBe(true);
  });

  test('returns false for pInnerHTML that does not contain active period', () => {
    const fixturePgInnerHtml = `Catholic Charities of the Diocese of Green Bay
 
Menasha Extension Office 
1475 Opportunity Way
Menasha, WI 54952
(920) 734-2601`;

    expect(RosterHTMLParser._pgHasActivePeriod(fixturePgInnerHtml)).toBe(false);
  });
});

describe('RosterHTMLParser._isOfficePg', () => {
  test('returns true for extension office', () => {
    const fixturePgInnerHtml = `Catholic Charities of the Diocese of Green Bay
 
Menasha Extension Office 
1475 Opportunity Way
Menasha, WI 54952
(920) 734-2601`;

    expect(RosterHTMLParser._isOfficePg(fixturePgInnerHtml)).toBe(true);
  });

  test('returns true for principal office', () => {
    const fixturePgInnerHtml = `Catholic Charities of the Diocese of La Crosse
 
Principal Office
508 S. 5th St.
La Crosse, WI 54601
(608) 519-8024`;

    expect(RosterHTMLParser._isOfficePg(fixturePgInnerHtml)).toBe(true);
  });

  test('returns false for recognition period', () => {
    const fixturePgInnerHtml = "05/05/05 06/27/25 Active\n";

    expect(RosterHTMLParser._isOfficePg(fixturePgInnerHtml)).toBe(false);
  });

  test('returns false for city pg', () => {
    const fixturePgInnerHtml = "Madison\n";

    expect(RosterHTMLParser._isOfficePg(fixturePgInnerHtml)).toBe(false);
  });
});

describe('RosterHTMLParser.parse integration tests', () => {
  test('simple and easy path, no page breaks', () => {
    const fixturePdf2HtmlOutput = `
<p>ALABAMA
Recognized 
Organization
</p>
<p>Date 
Recognized
</p>
<p>Recognition 
Expiration Date
</p>
<p>Organization 
Status 
</p>
<p>Birmingham
</p>
<p>Hispanic Catholic Social Services
 
Principal Office
92 Oxmoor Road
Birmingham, AL 35209
(205) 987-4771
</p>
<p>07/18/12 01/26/27 Active
</p>
<p>Hispanic Interest Coalition of Alabama
 
Principal Office
117 South Crest Drive
Birmingham, AL 35209
(205) 942-5505
</p>
<p>10/10/08 06/08/26 Active
</p>
<p>Dothan
</p>
<p>Catholic Social Services Archdiocese of Mobile
 
Dothan Extension Office
557 West Main Street
Dothan, AL 36302
(334) 793-3601
</p>
<p>04/06/00 03/01/25 Active
</p>
<p>Mobile
</p>
<p>Catholic Social Services Archdiocese of Mobile
 
Principal Office
188 South Florida St.
Mobile, AL 36606
(251) 434-1550
</p>
<p>04/06/00 03/01/25 Active
</p>
<p>Gulf States Immigration Services
 
Principal Office
126 Mobile Street
Mobile, AL 36607
(251) 455-6328
</p>
<p>10/27/17 02/13/26 Active
</p>`;

    const expectedResult = {
      ALABAMA: {
        Birmingham: [
          {
            orgName: 'Hispanic Catholic Social Services',
            officeName: 'Principal Office',
            address: [
              '92 Oxmoor Road',
              'Birmingham, AL 35209'
            ],
            phone: '(205) 987-4771'
          },
          {
            orgName: 'Hispanic Interest Coalition of Alabama',
            officeName: 'Principal Office',
            address: [
              '117 South Crest Drive',
              'Birmingham, AL 35209'
            ],
            phone: '(205) 942-5505'
          },
        ],
        Dothan: [
          {
            orgName: 'Catholic Social Services Archdiocese of Mobile',
            officeName: 'Dothan Extension Office',
            address: [
              '557 West Main Street',
              'Dothan, AL 36302'
            ],
            phone: '(334) 793-3601'
          }
        ],
        Mobile: [
          {
            orgName: 'Catholic Social Services Archdiocese of Mobile',
            officeName: 'Principal Office',
            address: [
              '188 South Florida St.',
              'Mobile, AL 36606'
            ],
            phone: '(251) 434-1550'
          },
          {
            orgName: 'Gulf States Immigration Services',
            officeName: 'Principal Office',
            address: [
              '126 Mobile Street',
              'Mobile, AL 36607'
            ],
            phone: '(251) 455-6328'
          },
        ]
      }
    };

    expect(RosterHTMLParser.parse(fixturePdf2HtmlOutput))
      .toEqual(expectedResult);

  });

  test('integration, no page break, two states', () => {
      const fixturePdf2HtmlOutput = `
<p>ALASKA
Recognized 
Organization
</p>
<p>Date 
Recognized
</p>
<p>Recognition 
Expiration Date
</p>
<p>Organization 
Status 
</p>
<p>Anchorage
</p>
<p>Catholic Social Services Refugee Assistance and 
Immigration Services
 
Principal Office
3710 E. 20th Avenue
Anchorage, AK 99508
(907) 222-7341
</p>
<p>01/03/95 05/03/25 Active
</p>
<p>Return to the top of the page
</p>
<p>ARIZONA
Recognized 
Organization
</p>
<p>Date 
Recognized
</p>
<p>Recognition 
Expiration Date
</p>
<p>Organization 
Status 
</p>
<p>Glendale
</p>
<p>International Rescue Committee, Inc.
 
IRC - Phoenix Extension Office
4425 West Olive Avenue, Suite 400
Glendale, AZ 85302
(602) 433-2440
</p>
<p>02/23/96 11/27/25 Active
</p>
`;

    expect(RosterHTMLParser.parse(fixturePdf2HtmlOutput))
      .toEqual({
        ALASKA: {
          Anchorage: [
            {
              orgName: 'Catholic Social Services Refugee Assistance and Immigration Services',
              officeName: 'Principal Office',
              address: [
                '3710 E. 20th Avenue',
                'Anchorage, AK 99508'
              ],
              phone: '(907) 222-7341'
            }
          ]
        },
        ARIZONA: {
          Glendale: [
            {
              orgName: 'International Rescue Committee, Inc.',
              officeName: 'IRC - Phoenix Extension Office',
              address: [
                '4425 West Olive Avenue, Suite 400',
                'Glendale, AZ 85302'
              ],
              phone: '(602) 433-2440'
            }
          ]
        }
      });
  });

  test('integration, has page break, one state', () => {
    const fixturePdf2HtmlOutput = `
<p>ALABAMA
Recognized 
Organization
</p>
<p>Date 
Recognized
</p>
<p>Recognition 
Expiration Date
</p>
<p>Organization 
Status 
</p>
<p>Birmingham
</p>
<p>Hispanic Catholic Social Services
 
Principal Office
92 Oxmoor Road
Birmingham, AL 35209
(205) 987-4771
</p>
<p>07/18/12 01/26/27 Active
</p>
<p>Hispanic Interest Coalition of Alabama
 
Principal Office
117 South Crest Drive
Birmingham, AL 35209
(205) 942-5505
</p>
<p>10/10/08 06/08/26 Active
</p>
<p>Dothan
</p>
<p>Catholic Social Services Archdiocese of Mobile
 
Dothan Extension Office
557 West Main Street
Dothan, AL 36302
(334) 793-3601
</p>
<p>04/06/00 03/01/25 Active
</p>
<p>Mobile
</p>
<p>Catholic Social Services Archdiocese of Mobile
 
Principal Office
188 South Florida St.
Mobile, AL 36606
(251) 434-1550
</p>
<p>04/06/00 03/01/25 Active
</p>
<p>Gulf States Immigration Services
 
Principal Office
126 Mobile Street
Mobile, AL 36607
(251) 455-6328
</p>
<p>10/27/17 02/13/26 Active
</p>
<p>Montgomery
</p>
<p>Catholic Social Services Archdiocese of Mobile 04/06/00 03/01/25 Active</p>
<p/>
</div>
<div class="page"><p/>
<p> 
Montgomery Extension Office 
4455 Narrow Lane Road
Montgomery, AL 36116
(334) 288-8890
</p>
`;

    const expectedResult = {
      ALABAMA: {
        Birmingham: [
          {
            orgName: 'Hispanic Catholic Social Services',
            officeName: 'Principal Office',
            address: [
              '92 Oxmoor Road',
              'Birmingham, AL 35209'
            ],
            phone: '(205) 987-4771'
          },
          {
            orgName: 'Hispanic Interest Coalition of Alabama',
            officeName: 'Principal Office',
            address: [
              '117 South Crest Drive',
              'Birmingham, AL 35209'
            ],
            phone: '(205) 942-5505'
          },
        ],
        Dothan: [
          {
            orgName: 'Catholic Social Services Archdiocese of Mobile',
            officeName: 'Dothan Extension Office',
            address: [
              '557 West Main Street',
              'Dothan, AL 36302'
            ],
            phone: '(334) 793-3601'
          }
        ],
        Mobile: [
          {
            orgName: 'Catholic Social Services Archdiocese of Mobile',
            officeName: 'Principal Office',
            address: [
              '188 South Florida St.',
              'Mobile, AL 36606'
            ],
            phone: '(251) 434-1550'
          },
          {
            orgName: 'Gulf States Immigration Services',
            officeName: 'Principal Office',
            address: [
              '126 Mobile Street',
              'Mobile, AL 36607'
            ],
            phone: '(251) 455-6328'
          },
        ],
        Montgomery: [
          {
            orgName: 'Catholic Social Services Archdiocese of Mobile',
            officeName: 'Montgomery Extension Office',
            address: [
              '4455 Narrow Lane Road',
              'Montgomery, AL 36116'
            ],
            phone: '(334) 288-8890'
          }
        ]
      }
    };

    expect(RosterHTMLParser.parse(fixturePdf2HtmlOutput))
      .toEqual(expectedResult);

  });
});


describe('RosterHTMLParser._parseStateSequence', () => {
  test('has page-break in the middle of the address', () => {
    const fixturePdf2HtmlOutput = `
<p>Wimauma</p>
<p>Redlands Christian Migrant Association, Inc.
 
RCMA - Wimauma Extension Office
14710 S Charlie Circle
</p>
<p>10/20/15 10/26/26 Active</p>
<p/>
</div>
<div class="page"><p/>
<p>Wimauma, FL 33598
(813) 634-1723
</p>
<p>Return to the top of the page
</p>`;

    const expectedResult = {
      Wimauma: [
          {
            orgName: 'Redlands Christian Migrant Association, Inc.',
            officeName: 'RCMA - Wimauma Extension Office',
            address: [
              '14710 S Charlie Circle',
              'Wimauma, FL 33598'
            ],
            phone: '(813) 634-1723'
          }
        ]
    };

    const stripped = RosterHTMLParser._stripPageBreaks(fixturePdf2HtmlOutput);

    expect(RosterHTMLParser._parseStateSequence(stripped))
      .toEqual(expectedResult);
  });
});

describe('RosterHTMLParser._stripPageBreaks', () => {
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
});

describe('RosterHTMLParser._lastLineIsPhoneNumber', () => {
  test('returns true when last line of text is phone number', () => {
    const fixturePgInnerHtml = `Easy Solution Consultants, Inc. (ESC, Inc)
 
Principal Office
4554 N. Broadway Street
Suite # 223
Chicago, IL 60640
(773) 769-2380`;

    expect(RosterHTMLParser._lastLineIsPhoneNumber(fixturePgInnerHtml))
      .toBe(true);
  });

  test('returns false when last line of text is not phone number', () => {
    const fixturePgInnerHtml = `Easy Solution Consultants, Inc. (ESC, Inc)
 
Principal Office
4554 N. Broadway Street
Suite # 223
Chicago, IL 60640`;

    expect(RosterHTMLParser._lastLineIsPhoneNumber(fixturePgInnerHtml))
      .toBe(false);
  });
});

describe('RosterHTMLParser._splitStates', () => {
  test('splits two states into object', () => {
      const fixturePdf2HtmlOutput = `
<p>ALASKA
Recognized 
Organization
</p>
<p>Date 
Recognized
</p>
<p>Recognition 
Expiration Date
</p>
<p>Organization 
Status 
</p>
<p>Anchorage
</p>
<p>Catholic Social Services Refugee Assistance and 
Immigration Services
 
Principal Office
3710 E. 20th Avenue
Anchorage, AK 99508
(907) 222-7341
</p>
<p>01/03/95 05/03/25 Active
</p>
<p>Return to the top of the page
</p>
<p>ARIZONA
Recognized 
Organization
</p>
<p>Date 
Recognized
</p>
<p>Recognition 
Expiration Date
</p>
<p>Organization 
Status 
</p>
<p>Glendale
</p>
<p>International Rescue Committee, Inc.
 
IRC - Phoenix Extension Office
4425 West Olive Avenue, Suite 400
Glendale, AZ 85302
(602) 433-2440
</p>
<p>02/23/96 11/27/25 Active
</p>
`;

    expect(RosterHTMLParser._splitStates(fixturePdf2HtmlOutput))
      .toEqual({
        ALASKA: `<p>Anchorage
</p>
<p>Catholic Social Services Refugee Assistance and 
Immigration Services
 
Principal Office
3710 E. 20th Avenue
Anchorage, AK 99508
(907) 222-7341
</p>
<p>01/03/95 05/03/25 Active
</p>
<p>Return to the top of the page
</p>`,
        ARIZONA: `<p>Glendale
</p>
<p>International Rescue Committee, Inc.
 
IRC - Phoenix Extension Office
4425 West Olive Avenue, Suite 400
Glendale, AZ 85302
(602) 433-2440
</p>
<p>02/23/96 11/27/25 Active
</p>`
      });
  });
});

describe('RosterHTMLParser._chopIrrelevantSections', () => {
  test('removes everything before and after org index', () => {
    const fixturePdf2HtmlOutput = `
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta name="pdf:PDFVersion" content="1.4"/>
<meta name="X-Parsed-By" content="org.apache.tika.parser.DefaultParser"/>
<meta name="X-Parsed-By" content="org.apache.tika.parser.pdf.PDFParser"/>
<meta name="access_permission:modify_annotations" content="true"/>
<meta name="access_permission:can_print_degraded" content="true"/>
<meta name="meta:creation-date" content="2021-08-30T12:03:01Z"/>
<meta name="created" content="2021-08-30T12:03:01Z"/>
<meta name="access_permission:extract_for_accessibility" content="true"/>
<meta name="access_permission:assemble_document" content="true"/>
<meta name="xmpTPg:NPages" content="182"/>
<meta name="Creation-Date" content="2021-08-30T12:03:01Z"/>
<meta name="resourceName" content="roster.pdf"/>
<meta name="dcterms:created" content="2021-08-30T12:03:01Z"/>
<meta name="dc:format" content="application/pdf; version=1.4"/>
<meta name="access_permission:extract_content" content="true"/>
<meta name="access_permission:can_print" content="true"/>
<meta name="access_permission:fill_in_form" content="true"/>
<meta name="pdf:encrypted" content="false"/>
<meta name="producer" content="PDF Engine win32 - (11.0)"/>
<meta name="Content-Length" content="1080206"/>
<meta name="access_permission:can_modify" content="true"/>
<meta name="pdf:docinfo:producer" content="PDF Engine win32 - (11.0)"/>
<meta name="pdf:docinfo:created" content="2021-08-30T12:03:01Z"/>
<meta name="Content-Type" content="application/pdf"/>
<title></title>
</head>
<body><div class="page"><p/>
<p>Recognized Organizations and Accredited Representatives Roster
by State and City 
</p>
<p> 
Report Last Updated on: 08/30/21
</p>
<p> 
Disclaimer:  The DOJ R&amp;A Program Coordinator maintains a roster of recognized organizations and accredited representatives. The contact 
information posted in these rosters is provided to the R&amp;A Program by the recognized organizations, and recognized organizations have an 
obligation to notify the Office of Legal Access Programs, through formal correspondence, of any changes to its contact information (such as 
name, address, and telephone number).  Therefore, while the Office of Legal Access Programs makes available the most current information 
provided to our Program Coordinator, it is the responsibility of each recognized organization to keep the Office of Legal Access Programs&rsquo; 
posted information up to date.
</p>
<p> 
&bull;  Search by Alphabetical Order or press [Ctrl] + [F] to find a representative.
&bull;  Asterisk * denotes pending renewal. 
</p>
<p> 
</p>
<p>Alabama   |  Alaska   |  Arizona   |  Arkansas   |  California   |  Colorado   |  Connecticut   |  Delaware   |  Florida   |  
</p>
<p>Georgia   |  Hawaii   |  Idaho   |  Illinois   |  Indiana   |  Iowa   |  Kansas   |  Kentucky   |  Louisiana   |  Maine   |  
</p>
<p>Maryland   |  Massachusetts   |  Michigan   |  Minnesota   |  Mississippi   |  Missouri   |  Montana   |  Nebraska   |  
</p>
<p>Nevada   |  New Hampshire   |  New Jersey   |  New Mexico   |  New York   |  North Carolina   |  North Dakota   |  
</p>
<p>Ohio   |  Oklahoma   |  Oregon   |  Pennsylvania   |  Rhode Island   |  South Carolina   |  South Dakota   |  Tennessee
</p>
<p>  |  Texas   |  Utah   |  Vermont   |  Virginia   |  Washington   |  Washington D.C.   |  Wisconsin   |  Wyoming   |  
</p>
<p> 
</p>
<p>ALABAMA
Recognized 
Organization
</p>
<p>Date 
Recognized
</p>
<p>Recognition 
Expiration Date
</p>
<p>Organization 
Status 
</p>
<p>Laramie
</p>
<p>Wyoming Coalition Against Domestic Violence and Sexual 
Assault (WCADVSA)
 
Principal Office
710 E. Garfield Street, Suite 218
Laramie, WY 82070
(307) 755-5481
</p>
<p>06/08/12 02/09/24 Active
</p>
<p>Return to the top of the page
</p>
<p> 
Recognized 
Organization
</p>
<p>Accredited 
Representative
</p>
<p>Accreditation 
Expiration Date
</p>
<p>Representative 
Status
</p>
<p>ABA Immigration Justice Project Rodriguez,  Karla Leticia 06/29/24 Active
</p>
<p>ABCD Parker Hill/Fenway NSC Serret,  Ivana (DHS only) 05/17/22 Active
</p>
<p>Sugilio,  Jenny (DHS only) 08/24/21*
(Pending Renewal)
</p>
`;
    const expectedResult = `
<p>ALABAMA
Recognized 
Organization
</p>
<p>Date 
Recognized
</p>
<p>Recognition 
Expiration Date
</p>
<p>Organization 
Status 
</p>
<p>Laramie
</p>
<p>Wyoming Coalition Against Domestic Violence and Sexual 
Assault (WCADVSA)
 
Principal Office
710 E. Garfield Street, Suite 218
Laramie, WY 82070
(307) 755-5481
</p>
<p>06/08/12 02/09/24 Active
</p>
<p>Return to the top of the page
</p>
`;
    expect(RosterHTMLParser._chopIrrelevantSections(fixturePdf2HtmlOutput))
      .toBe(expectedResult);
  });
});

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
