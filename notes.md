# Features

- User location never shared, local determination of proximity
- Determination of proximity could be:
  - Crow-flies, quick / initial sort: Simple calculation based on coords, or
  - Rich sort, progressive rendering: Google Maps / OSM driving directions
- App client could fetch location data in the following order
  - Directly from DOJ OLAP PDF, parse
  - Fallback to API, which has its own cache
  - Fallback to local cache, if exists, or if its more up to date than API cache

## If we're depending on linebreaks, they have to be normalized

### Example 1 - Vencimiento on same line as office name

```
Montgomery
Catholic Social Services Archdiocese of Mobile04/06/0003/01/25Active
```

### Solution to Example 1

Do regexp for `04/06/0003/01/25Active` and ensure line-break before and after

### Example 2a - Office name sometimes spans 2 lines

```
Anthony Extension Office
325 First Street
Anthony, NM 88021
(575) 882-3008
02/03/2102/03/23Active
Gallup
CASA REINA (Sisters of Our Lady of Guadalupe and Saint
Joseph, Inc.)

Principal Office
711 South Puerco Drive
Gallup, NM 87301
(505) 722-5511
07/27/0009/24/25Active
Las Cruces
Catholic Charities of Southern New Mexico
```

### Example 2b

```
10/08/1004/03/26Active
Batavia
Erie County Bar Association Volunteer Lawyers Project,
Inc.

Batavia Extension Office
```

### Solution to Example 2

1. There's always a trailing space at the end of the first line of a 2-line name.
2.

### Example 3 - Page break means that the office name doesn't always precede the office type

Active, top of the 2nd column, floats below the office name while office type, address float to the next page due to the page break

````
Principal Office
711 South Puerco Drive
Gallup, NM 87301
(505) 722-5511
07/27/0009/24/25Active
Las Cruces
Catholic Charities of Southern New Mexico

04/14/1012/23/26Active

Principal Office
125 West Mountain Ave
P.O. Box 1613
Las Cruces, NM 88005
(575) 527-0500
Dona Ana County Colonias Development Council
````

### Solution to Example 3

1. Strip out all `mm/dd/yymm/dd/yyActive`, after ensuring line break on either side
2. Now, office type is again a valid splitting element

### Example 4 - A Total Mess

```
421 S. Bixel Street, Suite A
Los Angeles, CA 90017
(213) 480-1052
06/26/2006/26/22Active
The Protestant Episcopal Church in the Diocese of L.A.- 04/06/1004/27/24Active

Interfaith Refugee and Immigration Services

Episcopal Diocese of Los Angeles-Cathedral Center of St
Paul Extension Office
840 Echo Park Avenue
Los Angeles, CA 90026
(323) 667-0489

Principal Office
3621 Brunswick Avenue
Los Angeles, CA 90039
(323) 661-8588
UFW Foundation

Principal Office
```

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
