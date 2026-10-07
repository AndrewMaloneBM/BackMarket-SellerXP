# Step 12: Status and Built by filters

## Goal
Two dropdown chips filter by status and by role, and one link clears everything.

## Read
Picture: `screens/04-filters-applied.png`. Source: `source/01-home.html`.

## Do
1. After the page chips, add a 1px by 24px divider, then two dropdown chips that look like chips with a small down arrow.
2. Status options: All active, Exploring, Ready to test, In testing, Tested, Shipped, Archived.
   - "All active" is the default and means everything except Archived.
   - Archived prototypes only show when Status is "Archived".
3. Built by options: Everyone, Design, PM, Research, Engineering, Marketing.
   - A prototype matches when any of its people has that role.
4. Chip labels: "Status" and "Built by" by default. When set: "Status: Tested", "Built by: Design", and the chip turns black with white text.
5. When any filter or search is on, show "3 of 8 prototypes" and a "Clear filters" link beside it. The total counts non-archived prototypes.
6. "Clear filters" resets search, pages, status and built by.
7. Keep both choices in the address.

## Leave out
Filtering by a single person.

## Checklist
- Choosing "Tested" shows only Tested prototypes.
- Choosing "Archived" is the only way to see archived ones.
- Choosing "Design" shows prototypes with at least one designer.
- The chip label changes and turns black when set.
- "Clear filters" appears only when something is filtered, and resets everything.
- Filters combine with search and page chips.
- Refreshing keeps the filters.
