# Step 25: Screens, Notes and More

## Goal
The last three dock items work.

## Read
Picture: `screens/15-dock-menus.png`. Source: `source/15-dock-menus.html`, `source/dock-component.html`.

## Do
After the Before and After switch, add a divider, then three text items with padding 0 10: "Screens", "Notes", "More".

Screens:
1. Opens a menu above the dock listing the prototype's screens from the card file.
2. Choosing one goes to that screen and keeps the version and the Before or After choice.

Notes:
1. Opens a panel on the right side of the page, 300px wide, white, with a shadow.
2. It shows: the version name, its plain line, the heading "What changed", the version's `changes` list, and at the bottom the card's links ("Brief or PRD", "Research findings") when they exist.
3. It has a close button. It closes on Escape.

More:
1. Opens a menu above the dock, 280px wide, with three items: "Copy link", "About this prototype", "Start over".
2. "Copy link" copies the current address and shows a "Link copied" toast.
3. "About this prototype" opens the same right-side panel showing the card: name, problem, goal, pages, people, links.
4. "Start over" reloads the prototype at its first screen, on the same version, with anything typed or clicked cleared.

Only one menu or panel is open at a time.

## Leave out
Comments and Review tabs. The "Later" items in the More menu: Language, Device size, Start a tour, team item.

## Checklist
- Screens lists the screens from the card file and switches between them.
- Notes shows the right version's line and changes.
- Links show in Notes only when the card has them.
- "Copy link" copies an address that reopens the same version and view.
- "About this prototype" shows the card's details.
- "Start over" returns to the first screen.
- Opening one menu closes the other.
- All three work by keyboard.
