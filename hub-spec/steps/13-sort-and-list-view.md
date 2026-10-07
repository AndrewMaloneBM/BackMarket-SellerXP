# Step 13: Sort and list view

## Goal
People can sort the prototypes and switch between cards and a list.

## Read
Picture: `screens/01-home.png` (right of the count), `screens/03-list-view.png`. Source: `source/01-home.html`, `source/03-list-view.html`.

## Do
1. On the same line as the count, on the right, add "Sort" with the current choice in bold and a small arrow. Options: Last updated, Name, Status.
   - Status uses the order in `DATA.md`, then last updated.
2. Next to it, add a two-button toggle with a grid icon and a list icon. The selected one has the neutral fill.
3. List view: one white card holding rows. Columns, left to right: status tag (124px), name (bold, 16px, one line), pages (one line), byline (one line), updated (88px). 16px gaps, padding 12 16, 1px quiet border between rows.
4. The whole row is clickable and opens the prototype. A row shows the neutral fill on hover.
5. On narrow screens the list scrolls sideways instead of squashing.
6. Keep the sort and the view in the address.

## Leave out
The "Details" link in each row. The "Show 24 more" button. Show every row.

## Checklist
- Sorting by name is alphabetical.
- Sorting by status follows the order in `DATA.md`.
- The toggle switches between cards and list without losing filters.
- Rows open the prototype on click and by keyboard.
- Long names are cut off with an ellipsis, not wrapped.
- Refreshing keeps the sort and the view.
