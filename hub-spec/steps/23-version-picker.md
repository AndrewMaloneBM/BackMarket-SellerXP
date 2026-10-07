# Step 23: Version picker

## Goal
Clicking the version label opens a panel showing every version.

## Read
Picture: `screens/11-dock-versions.png` (second and fourth sections). Source: `source/dock-component.html`.

## Do
1. Clicking the version label opens a white panel above the dock: 540px wide, radius 12, padding 16, 1px quiet border, shadow `0 8px 16px rgba(0,0,0,.12)`. The label gets a lighter fill `hsl(223,5%,28%)` while open.
2. Panel title: "5 versions of the Home page". The number counts versions only. The page name comes from the card file's first page.
3. A grid of cards, three per row, 12px gaps. Each card: a picture area 92px high with a neutral fill, then the name in bold, then the plain line in 12px.
4. If the prototype has a "before", the first card is "Before" with the line "What sellers see today". It is not counted in the title.
5. The current version's card has a 2px black border and a tick beside its name.
6. Clicking a version card switches to it and closes the panel.
7. With more than six versions, add a "Find a version" search input in the panel header and make the grid scroll.
8. Escape and clicking outside close the panel.

## Leave out
Real pictures in the picture area (step 27). Leave it as a plain neutral block. Leave out "Versions we dropped". Clicking "Before" does nothing until step 24.

## Checklist
- The title counts versions and does not count "Before".
- The current version is marked with the border and the tick.
- Clicking a card switches version and closes the panel.
- Seven or more versions show the search and scroll.
- Escape closes the panel and returns focus to the label.
- The panel can be used by keyboard alone.
