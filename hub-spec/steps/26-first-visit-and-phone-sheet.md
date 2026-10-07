# Step 26: First visit and phone sheet

## Goal
First-time visitors get one line of help. On a phone the dock becomes a sheet.

## Read
Picture: `screens/12-dock-states.png`. Source: `source/12-dock-states.html`, `source/dock-component.html`.

## Do
First visit:
1. The first time someone opens any prototype, show a white box just above the dock: 540px wide, radius 12, with this text and a small secondary "Got it" button:
   "You're on Version A, one of 5 versions of the Home page. Use the arrows to compare, or tap the name to see them all."
2. Fill in the real version, count and page.
3. It goes away on "Got it" or the first time they use the dock. Remember that in the browser so it does not come back.
4. Do not show it on a one-version prototype.

Phone, under 720px wide:
1. Replace the dock with one black button at the bottom right: the version name and an up caret, 48px high. For a one-version prototype it says "Menu".
2. It opens a sheet from the bottom with a dimmed page behind it.
3. The sheet, top to bottom: previous arrow, the version name with its line under it, next arrow. Then the Before and After switch, centred. Then rows: "See all 5 versions", "Screens", "Notes", "More", "All prototypes".
4. Rows are at least 48px high.
5. The sheet closes by swiping down, tapping outside, or Escape.

## Leave out
Moving the dock to the top of the page.

## Checklist
- The caption shows once and never again in the same browser.
- The caption names the right version, count and page.
- At 390px wide the dock is one button at the bottom right.
- The sheet holds every dock action.
- The Before and After switch works inside the sheet.
- At 720px and wider, the full dock is unchanged.
