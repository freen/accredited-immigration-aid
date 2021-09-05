# Features

- User location never shared, local determination of proximity
- Determination of proximity could be:
  - Crow-flies, quick / initial sort: Simple calculation based on coords, or
  - Rich sort, progressive rendering: Google Maps / OSM driving directions
- App client could fetch location data in the following order
  - Directly from DOJ OLAP PDF, parse
  - Fallback to API, which has its own cache
  - Fallback to local cache, if exists, or if its more up to date than API cache


# PDF Text Demarcations

## End of one RA, beg of another

Active

## End of one state, beginning of another

Return to the top of the page
[NEW STATE NAME]

## End of RAs, beginning of ARs

Return to the top of the page

Recognized
Organization
Accredited
Representative
Accreditation
Expiration Date
Representative
Status
