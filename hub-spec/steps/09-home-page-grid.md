# Step 09: Home page grid

## Goal
The hub home lists the prototypes as cards.

## Read
Picture: `screens/01-home.png`. Source: `source/01-home.html`.

## Do
1. Page content has max width 1240, centred, padding 24.
2. Title "Prototype Hub": IvarSoft, weight 600, font size `clamp(42px, 5vw, 56px)`, line height 1.143.
3. Under it, the count in quiet text: "8 prototypes".
4. Then the cards in a grid: `repeat(auto-fill, minmax(min(100%, 340px), 1fr))`, gap 24.
5. Show every prototype except Archived ones.
6. Order: last updated first.

## Leave out
Search, filters, sort and the list view. They are the next steps.

## Checklist
- The page uses the shared header and footer.
- The count matches the number of cards.
- Archived prototypes are not shown and not counted.
- The grid goes from three columns to two to one as the window narrows.
- The newest update is first.
