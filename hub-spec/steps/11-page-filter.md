# Step 11: Page filter

## Goal
A row of chips filters by page.

## Read
Picture: `screens/01-home.png`, `screens/04-filters-applied.png`. Source: `source/01-home.html`. `LOOK.md` for the chip.

## Do
1. Under the title, add a row of chips with 8px gaps. First chip is "All".
2. Then one chip for each value in the team's filter list, in the team's order, including the "all" value ("Cross-page").
3. Only show a chip if at least one non-archived prototype uses that value.
4. Chips are multi-select. Clicking one turns it on or off. "All" is on when none are selected, and clicking it clears the rest.
5. A prototype matches when it is on any selected page.
6. A prototype marked "Cross-page" matches every page chip.
7. Keep the selection in the address.
8. The row has the screen-reader name "Filter by page", using the team's filter name.

## Leave out
A "More" overflow chip. Show every chip and let the row wrap.

## Checklist
- Selecting "Home" and "Money" shows prototypes on either.
- A Cross-page prototype shows under every page chip.
- A page with no prototypes has no chip.
- "All" clears the selection.
- Selected chips are black with white text.
- Chips can be reached and toggled by keyboard.
- Refreshing keeps the selection.
